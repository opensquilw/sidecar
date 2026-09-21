/* Local stand-in for the deployed worker: same request shape, same SSE reply.
   Lets the app's streaming client be tested without an API key.
   Run: node worker/mock.mjs  (port 8914) */
import http from "node:http";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS",
               "Access-Control-Allow-Headers": "content-type" };

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }
  if (req.method === "GET") { res.writeHead(200, { ...CORS, "content-type": "application/json" }); return res.end('{"ok":true,"mock":true}'); }
  let body = ""; for await (const c of req) body += c;
  let j; try { j = JSON.parse(body); } catch { res.writeHead(400, CORS); return res.end("bad json"); }
  const last = (j.messages || []).filter((m) => m.role === "user").pop();
  const q = last ? last.content : "";
  if (/quota/i.test(q)) { res.writeHead(429, { ...CORS, "content-type": "application/json" }); return res.end('{"error":"quota"}'); }
  if (/boom/i.test(q)) { res.writeHead(502, CORS); return res.end("upstream"); }

  res.writeHead(200, { ...CORS, "content-type": "text/event-stream", "cache-control": "no-store" });
  const carLine = j.car && j.car.nickname ? `（${j.car.nickname}${j.car.oilGrade ? "，" + j.car.oilGrade : ""}）` : "";
  const reply = j.lang === "en"
    ? `**Call 999 first if anyone is hurt.**\n\n1. **Stop and hazards on.** Do not drive off.\n2. **Get behind the barrier** if you are on an expressway.\n3. **Photograph everything** before the cars move.\n4. **Exchange particulars**: plate, name, phone, insurer.\n\nMock reply for: ${q}${carLine}`
    : `**有人受傷就先打 999。**\n\n1. **停車，開死火燈。** 唔好走。\n2. **企去欄杆外面**，如果係快速公路。\n3. **未郁車之前影晒相。**\n4. **交換資料**：車牌、姓名、電話、保險公司。\n\n（模擬回覆：${q}${carLine}）`;
  const chunks = reply.match(/.{1,6}/gs) || [];
  let i = 0;
  const tick = () => {
    if (i < chunks.length) { res.write(`data: ${JSON.stringify({ t: chunks[i++] })}\n\n`); setTimeout(tick, 18); }
    else { if (/refuse/i.test(q)) res.write(`data: {"refusal":true}\n\n`); res.write(`data: {"done":true}\n\n`); res.end(); }
  };
  tick();
}).listen(8914, () => console.log("mock AI on http://localhost:8914"));
