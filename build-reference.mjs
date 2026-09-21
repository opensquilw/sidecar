/* Flattens the in-app guides (data.js) into reference.txt, which the AI worker
   loads into its system prompt. One source of truth: edit data.js, run
   `node build-reference.mjs`, commit both. */
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const NAMES = ["SERVICE_TYPES", "VISCOSITY", "OIL_TYPES", "OIL_SPECS", "OIL_BRANDS", "CHANGE_GUIDE",
  "MYTHS", "CHOOSE_STEPS", "STATION_BRANDS", "STATION_SERVICES", "TYRE_GUIDE", "HK_ADMIN",
  "ACCIDENT_GUIDE", "TRAFFIC_RULES"];
const src = readFileSync(new URL("./data.js", import.meta.url), "utf8");
const D = vm.runInNewContext(src + `;({${NAMES.join(",")}})`, {});

const strip = (s) => String(s).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const L = [];
const h = (t) => L.push("", "## " + t);
const p = (t) => L.push(strip(t));
const kv = (items) => items.forEach(([k, v]) => L.push(`- ${strip(k)}: ${strip(v)}`));
const li = (items) => items.forEach((x) => L.push("- " + strip(x)));

for (const lang of ["zh", "en"]) {
  L.push(`# ${lang === "zh" ? "參考資料（繁體中文）" : "REFERENCE (English)"}`);

  h(lang === "zh" ? "交通意外" : "Accident"); p(D.ACCIDENT_GUIDE[lang].lead);
  const A = D.ACCIDENT_GUIDE[lang];
  for (const [title, items, fmt] of [[A.stopTitle, A.stop, kv], [A.crashFirstTitle, A.crashFirst, kv],
    [A.injuredTitle, A.injured, kv], [A.hitRunTitle, A.hitRun, kv], [A.crashAfterTitle, A.crashAfter, kv],
    [A.reportTitle, A.report, kv], [A.exchangeTitle, A.exchange, li], [A.photoTitle, A.photo, li],
    [A.dontTitle, A.dont, kv], [A.afterTitle, A.after, kv], [A.breakdownTitle, A.breakdown, li],
    [A.kitTitle, A.kit, li], [A.numbersTitle, A.numbers, kv]]) { L.push("", "### " + strip(title)); fmt(items); }

  h(lang === "zh" ? "交通守則" : "Traffic rules"); p(D.TRAFFIC_RULES[lang].lead);
  for (const s of D.TRAFFIC_RULES[lang].sections) { L.push("", "### " + strip(s.title)); kv(s.items); }
  p(D.TRAFFIC_RULES[lang].codeNote);

  h(lang === "zh" ? "機油：揀油步驟" : "Engine oil: how to choose"); kv(D.CHOOSE_STEPS[lang]);
  h(strip(D.VISCOSITY[lang].title)); D.VISCOSITY[lang].body.forEach(p);
  D.VISCOSITY[lang].grades.forEach((g) => L.push(`- ${g.g}: ${strip(g.t)}`)); p(D.VISCOSITY[lang].where);
  h(lang === "zh" ? "三種機油" : "Oil types");
  for (const o of D.OIL_TYPES) { const c = o[lang]; L.push(`- ${c.name} (${c.tag}; ${c.interval}): ${strip(c.what)} ${strip(c.who)} ${strip(c.watch)}`); }
  h(lang === "zh" ? "機油規格" : "Oil specifications"); p(D.OIL_SPECS[lang].intro);
  for (const g of D.OIL_SPECS[lang].groups) { L.push("", "### " + g.name); kv(g.items); } p(D.OIL_SPECS[lang].rule);
  h(lang === "zh" ? "機油牌子" : "Oil brands");
  for (const b of D.OIL_BRANDS) { const c = b[lang]; L.push(`- ${c.name} (${c.origin}; price ${b.price}/4): ${strip(c.note)} ${lang === "zh" ? "系列" : "Lines"}: ${strip(c.lines)}`); }
  const C = D.CHANGE_GUIDE[lang];
  h(strip(C.title)); p(C.lead); L.push(`- ${strip(C.severe.title)}: ${strip(C.severe.body)}`); kv(C.rules);
  L.push("", "### " + strip(C.signsTitle)); li(C.signs); L.push("", "### " + strip(C.dipTitle)); li(C.dip);
  h(lang === "zh" ? "常見誤解" : "Myths"); D.MYTHS.forEach((m) => L.push(`- ${strip(m[lang].q)} → ${strip(m[lang].a)}`));

  const S = D.STATION_SERVICES[lang];
  h(lang === "zh" ? "油站服務" : "Petrol station services"); p(S.intro);
  for (const g of [S.likely, S.sometimes, S.elsewhere]) { L.push("", "### " + strip(g.title)); kv(g.items); }
  L.push("", "### " + strip(S.fuelTitle)); li(S.fuel);
  L.push("", "### " + (lang === "zh" ? "油站品牌" : "Station brands")); D.STATION_BRANDS.forEach((b) => L.push(`- ${b[lang].name}: ${strip(b[lang].note)}`));

  const T = D.TYRE_GUIDE[lang];
  h(strip(T.title)); p(T.lead); kv(T.steps);
  L.push("", "### " + strip(T.freqTitle)); li(T.freq); L.push("", "### " + strip(T.symTitle)); kv(T.sym);
  L.push("", "### " + strip(T.checkTitle)); li(T.check);

  h(lang === "zh" ? "香港手續" : "Hong Kong paperwork"); kv(D.HK_ADMIN[lang]);

  h(lang === "zh" ? "一般保養週期" : "General service intervals");
  D.SERVICE_TYPES.filter((s) => s.km || s.months).forEach((s) =>
    L.push(`- ${s[lang]}: ${s.km ? s.km + " km" : "-"} / ${s.months ? s.months + (lang === "zh" ? " 個月" : " months") : "-"}`));
  L.push("", "");
}

const out = L.join("\n");
writeFileSync(new URL("./reference.txt", import.meta.url), out);
console.log(`reference.txt: ${out.length} chars, ~${Math.round(out.length / 3)} tokens`);
