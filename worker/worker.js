/* Sidecar 車伴 — AI assistant proxy (Cloudflare Worker)
 *
 * Holds YOUR Anthropic API key server-side so the app never ships one.
 * The browser sends {messages, lang, car}; the system prompt is built HERE
 * from reference.txt (the app's own guides), so this cannot be used as a
 * general-purpose chatbot. Replies stream back as a tiny SSE:
 *   data: {"t":"text delta"}   ...   data: {"done":true}
 *
 * Deploy: see README.md. Raw fetch rather than the SDK because a
 * single-file Worker deployed from the dashboard or a git-connected repo
 * has no bundler step.
 */

const ANTHROPIC = "https://api.anthropic.com/v1/messages";
const MAX_TURNS = 20;          // history pairs kept
const MAX_CHARS = 2000;        // per user message
const MAX_TOKENS = 1500;       // roadside answers are short

let referenceMemo = null;      // survives across requests while the isolate is warm

async function loadReference(env) {
  if (referenceMemo) return referenceMemo;
  const url = env.REFERENCE_URL;
  const cache = caches.default;
  let res = await cache.match(url);
  if (!res) {
    res = await fetch(url, { cf: { cacheTtl: 3600 } });
    if (!res.ok) throw new Error("reference fetch " + res.status);
    await cache.put(url, res.clone());
  }
  referenceMemo = await res.text();
  return referenceMemo;
}

function persona(lang) {
  const zh = lang === "zh";
  return [
    zh ? "你係「車伴」—— 一個幫香港新車主嘅助手，特別係幫佢哋處理交通意外、保養、換機油、車胎、油站同牌照手續。"
       : "You are Sidecar, an assistant for new car owners in Hong Kong: accidents, servicing, engine oil, tyres, petrol stations and licensing paperwork.",
    zh ? "用廣東話口語嘅繁體中文回答（例如「唔好」「即刻」「架車」），除非用戶用英文問。"
       : "Answer in English unless the user writes in Chinese, in which case answer in Hong Kong Cantonese-style Traditional Chinese.",
    "The user may be standing at the roadside, shaken, on a phone. Lead with the single most important action. Use short numbered steps. No preamble, no recap of their question, no sign-off.",
    "SAFETY RULE: if the message suggests anyone is injured, trapped, unconscious, or there is fire or fuel smell, the FIRST line must tell them to call 999 now — before anything else.",
    "Ground every answer in the REFERENCE below. It reflects Hong Kong practice. Do not invent specific fines, demerit points, limitation periods, statute numbers or insurer rules that are not in the reference — say the exact figure should be checked with the Transport Department, police or their insurer, and give the general rule instead.",
    "Never tell the user to admit fault, settle in cash at the roadside, or sign the other party's documents. Never advise leaving a scene where someone is hurt.",
    "You are not a lawyer, doctor or mechanic. For injuries: A&E or a doctor. For legal exposure: Duty Lawyer free legal advice. For the car: their insurer's hotline first, then a garage.",
    "If the question is outside car ownership in Hong Kong, say so briefly and offer what you can help with.",
    "If the user's car profile is provided, use it (e.g. quote their oil grade) instead of asking.",
  ].join("\n");
}

function carContext(car, lang) {
  if (!car || typeof car !== "object") return null;
  const bits = [];
  for (const [k, label] of [["nickname", "name"], ["make", "make"], ["model", "model"], ["year", "year"],
    ["mileage", "odometer km"], ["oilGrade", "oil grade"], ["oilSpec", "oil spec"], ["oilCapacity", "oil capacity L"],
    ["tyreSize", "tyre size"], ["tyreFront", "front tyre psi"], ["tyreRear", "rear tyre psi"],
    ["licenceExpiry", "licence expires"], ["insuranceExpiry", "insurance expires"], ["fuel", "fuel"]]) {
    const v = car[k];
    if (v != null && v !== "" && String(v).length < 80) bits.push(`${label}: ${String(v)}`);
  }
  if (!bits.length) return null;
  return (lang === "zh" ? "用戶部車：" : "User's car: ") + bits.join("; ");
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw.slice(-MAX_TURNS * 2)) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) continue;
    const text = String(m.content ?? "").slice(0, MAX_CHARS).trim();
    if (!text) continue;
    if (out.length && out[out.length - 1].role === m.role) { out[out.length - 1].content += "\n" + text; continue; }
    out.push({ role: m.role, content: text });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

function cors(env, req) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin);
  return { ok, headers: {
    "Access-Control-Allow-Origin": ok ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  } };
}

async function overQuota(env, req) {
  if (!env.QUOTA) return false;                       // KV binding is optional
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const key = `q:${ip}:${new Date().toISOString().slice(0, 10)}`;
  const n = Number(await env.QUOTA.get(key)) || 0;
  const limit = Number(env.DAILY_LIMIT) || 60;
  if (n >= limit) return true;
  await env.QUOTA.put(key, String(n + 1), { expirationTtl: 90000 });
  return false;
}

export default {
  async fetch(req, env) {
    const c = cors(env, req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: c.headers });
    if (req.method === "GET") return new Response(JSON.stringify({ ok: true, service: "sidecar-ai" }),
      { headers: { ...c.headers, "content-type": "application/json" } });
    if (req.method !== "POST") return new Response("method", { status: 405, headers: c.headers });
    if (!c.ok) return new Response("origin", { status: 403, headers: c.headers });
    if (!env.ANTHROPIC_API_KEY) return new Response("server not configured", { status: 500, headers: c.headers });
    if (await overQuota(env, req)) return new Response(JSON.stringify({ error: "quota" }),
      { status: 429, headers: { ...c.headers, "content-type": "application/json" } });

    let body;
    try { body = await req.json(); } catch { return new Response("bad json", { status: 400, headers: c.headers }); }
    const lang = body.lang === "en" ? "en" : "zh";
    const messages = sanitizeMessages(body.messages);
    if (!messages.length) return new Response("empty", { status: 400, headers: c.headers });

    let reference;
    try { reference = await loadReference(env); }
    catch (e) { return new Response("reference unavailable", { status: 503, headers: c.headers }); }

    const system = [
      { type: "text", text: reference, cache_control: { type: "ephemeral", ttl: "1h" } },
      { type: "text", text: persona(lang), cache_control: { type: "ephemeral", ttl: "1h" } },
    ];
    const ctx = carContext(body.car, lang);
    if (ctx) system.push({ type: "text", text: ctx });   // volatile: after the cache breakpoints

    const upstream = await fetch(ANTHROPIC, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "server-side-fallback-2026-07-01",
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-opus-5",
        max_tokens: MAX_TOKENS,
        stream: true,
        output_config: { effort: env.EFFORT || "medium" },
        fallbacks: "default",
        system,
        messages,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return new Response(JSON.stringify({ error: "upstream", status: upstream.status, detail: detail.slice(0, 300) }),
        { status: 502, headers: { ...c.headers, "content-type": "application/json" } });
    }

    /* Re-emit only text deltas as a minimal SSE the page can read with fetch(). */
    const enc = new TextEncoder(), dec = new TextDecoder();
    const reader = upstream.body.getReader();
    let buf = "";
    const out = new ReadableStream({
      /* Each pull keeps reading upstream until it has emitted at least one
         frame (or hits end of stream). Upstream chunks that carry only
         thinking / metadata events would otherwise leave the stream idle. */
      async pull(controller) {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) { controller.enqueue(enc.encode(`data: {"done":true}\n\n`)); controller.close(); return; }
          buf += dec.decode(value, { stream: true });
          let emitted = false, idx;
          while ((idx = buf.indexOf("\n\n")) >= 0) {
            const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
            const line = frame.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            let ev; try { ev = JSON.parse(line.slice(5)); } catch { continue; }
            let msg = null;
            if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") msg = { t: ev.delta.text };
            else if (ev.type === "message_delta" && ev.delta && ev.delta.stop_reason === "refusal") msg = { refusal: true };
            else if (ev.type === "error") msg = { error: (ev.error && ev.error.message) || "error" };
            if (msg) { controller.enqueue(enc.encode(`data: ${JSON.stringify(msg)}\n\n`)); emitted = true; }
          }
          if (emitted) return;
        }
      },
      cancel() { reader.cancel().catch(() => {}); },
    });
    return new Response(out, { headers: { ...c.headers, "content-type": "text/event-stream", "cache-control": "no-store" } });
  },
};
