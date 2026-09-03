/* CarMate — everything is local to the device. No backend, no accounts. */

/* ---------- storage ---------- */
const K = { car: "cm_car", recs: "cm_records", stations: "cm_stations", theme: "cm_theme" };

const load = (k, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; }
  catch { return fallback; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let car = load(K.car, null);
let records = load(K.recs, []);
let stations = load(K.stations, []);

const DEFAULT_OIL_KM = 8000;
const DEFAULT_OIL_MO = 12;

/* ---------- small helpers ---------- */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
/* Local-calendar ISO date. toISOString() is UTC, which lands on the wrong day
   for a UTC+8 user for eight hours of every day. */
const isoLocal = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const todayISO = () => isoLocal(new Date());
const nf = (n) => Number(n).toLocaleString("en-US");

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(LANG === "zh" ? "zh-HK" : "en-GB",
    { year: "numeric", month: "short", day: "numeric" });
}
function addMonths(iso, m) {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDate();
  d.setMonth(d.getMonth() + m);
  if (d.getDate() < day) d.setDate(0);
  return isoLocal(d);
}
function daysBetween(fromISO, toISO) {
  return Math.round((new Date(toISO + "T00:00:00") - new Date(fromISO + "T00:00:00")) / 86400000);
}
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.hidden = true; }, 1800);
}

/* ---------- icons ---------- */
const ICONS = {
  oil: ["f", "M12 2.5c4 5 6 7.8 6 10.3a6 6 0 0 1-12 0C6 10.3 8 7.5 12 2.5z"],
  filter: ["f", "M3 4h18l-7 8.5V21l-4-2.2v-6.3z"],
  wind: ["s", "M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 12h14a2.5 2.5 0 1 1-2.5 2.5M3 16h8"],
  spark: ["f", "M13 2 4.5 13.5H11l-1 8.5 8.5-12H12z"],
  drop: ["f", "M12 2.5c4 5 6 7.8 6 10.3a6 6 0 0 1-12 0C6 10.3 8 7.5 12 2.5z"],
  disc: ["f", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 5.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"],
  temp: ["f", "M12 3a2.5 2.5 0 0 1 2.5 2.5v7.7a5 5 0 1 1-5 0V5.5A2.5 2.5 0 0 1 12 3z"],
  gear: ["f", "M19.4 13a7.4 7.4 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L14.9 2h-4l-.4 2.9a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.4 11a7.4 7.4 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.9h4l.4-2.9a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5z"],
  battery: ["f", "M6 7h9a2 2 0 0 1 2 2v1h2.5v4H17v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"],
  tyre: ["f", "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8z"],
  align: ["s", "M12 3v18M5.5 7 3.5 12l2 5M18.5 7l2 5-2 5"],
  wiper: ["s", "M3.5 18.5h17M5.5 18.5 15 5.5M15 5.5l2.6 1.6"],
  check: ["f", "m9.6 16.6-4.2-4.2L4 13.8l5.6 5.6L21 8l-1.4-1.4z"],
  fuel: ["f", "M4 3h8a1 1 0 0 1 1 1v17H3V4a1 1 0 0 1 1-1zm2 3v4h4V6zm10 1.5 3.2 3.2V18a1.6 1.6 0 0 1-3.2 0v-4.5h-1.5V8.8z"],
  wash: ["f", "M7 3c2 3.2 3 4.8 3 6.2a3 3 0 1 1-6 0C4 7.8 5 6.2 7 3zm10 6c2 3.2 3 4.8 3 6.2a3 3 0 1 1-6 0c0-1.4 1-3 3-6.2z"],
  wrench: ["f", "M21.3 6.6a5.5 5.5 0 0 1-7.6 5.4L6 19.7 3.4 17l7.7-7.7a5.5 5.5 0 0 1 7.2-7.1l-3.2 3.2 2.1 2.1 3.2-3.2c.2.7.3 1.5.1 2.3z"],
  dot: ["f", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
};
function icon(id, size) {
  const def = ICONS[id] || ICONS.dot;
  const s = size || 18;
  const inner = def[0] === "f"
    ? `<path fill="currentColor" d="${def[1]}"/>`
    : `<path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" d="${def[1]}"/>`;
  return `<svg viewBox="0 0 24 24" width="${s}" height="${s}">${inner}</svg>`;
}

/* ---------- gauge ---------- */
/* A 240-degree sweep, tachometer style: starts lower-left, sweeps over the top,
   ends lower-right. pct 0..1 fills the arc; status colours it. */
const G = { cx: 100, cy: 100, r: 78, start: 150, sweep: 240 };

function polar(deg, r) {
  const rad = (deg * Math.PI) / 180;
  return [G.cx + r * Math.cos(rad), G.cy + r * Math.sin(rad)];
}
function arcPath(fromDeg, toDeg, r) {
  const [x1, y1] = polar(fromDeg, r);
  const [x2, y2] = polar(toDeg, r);
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function gaugeSVG(pct, status, big, unit) {
  const p = Math.min(1, Math.max(0, pct));
  const cls = status === "ok" ? "" : status;

  const ticks = [];
  for (let i = 0; i <= 8; i++) {
    const deg = G.start + (G.sweep / 8) * i;
    const [x1, y1] = polar(deg, G.r + 9);
    const [x2, y2] = polar(deg, G.r + 15);
    ticks.push(`<line class="gauge-tick${i >= 7 ? " hot" : ""}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="2" stroke-linecap="round"/>`);
  }

  /* A short marker at the rim rather than a full needle: a needle through the
     hub would cross the centred readout text. */
  const markDeg = G.start + G.sweep * p;
  const [nx, ny] = polar(markDeg, G.r - 20);
  const [hx, hy] = polar(markDeg, G.r + 4);

  return `<div class="gauge-wrap"><svg class="gauge" viewBox="0 0 200 172" role="img">
    ${ticks.join("")}
    <path class="gauge-track" d="${arcPath(G.start, G.start + G.sweep, G.r)}" fill="none" stroke-width="9" stroke-linecap="round"/>
    <path class="gauge-value ${cls}" d="${arcPath(G.start, G.start + G.sweep * Math.max(p, 0.001), G.r)}" fill="none" stroke-width="9" stroke-linecap="round"/>
    <line class="gauge-mark ${cls}" x1="${hx.toFixed(1)}" y1="${hy.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke-width="3" stroke-linecap="round"/>
    <text class="gauge-big ${cls}" x="100" y="88" text-anchor="middle">${esc(big)}</text>
    <text class="gauge-unit" x="100" y="108" text-anchor="middle">${esc(unit)}</text>
  </svg></div>`;
}

/* ---------- lookups ---------- */
const typeById = (id) => SERVICE_TYPES.find((s) => s.id === id) || SERVICE_TYPES[SERVICE_TYPES.length - 1];
const typeName = (id) => typeById(id)[LANG];
const oilKindName = (id) => { const o = OIL_TYPES.find((x) => x.id === id); return o ? o[LANG].name : ""; };

const SERVICE_KEYS = ["svcAir", "svcWash", "svcShop", "svcEV", "svcOil", "svcToilet", "svc24"];

/* ---------- due calculation ---------- */
function intervalFor(typeId) {
  const st = typeById(typeId);
  if (typeId === "oil") {
    return {
      km: (car && Number(car.oilIntervalKm)) || DEFAULT_OIL_KM,
      months: (car && Number(car.oilIntervalMonths)) || DEFAULT_OIL_MO,
    };
  }
  return { km: st.km, months: st.months };
}

function lastRecord(typeId) {
  return records
    .filter((r) => r.type === typeId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))[0] || null;
}

/* Returns null when the item has no interval or has never been logged. */
function dueFor(typeId) {
  const iv = intervalFor(typeId);
  if (!iv.km && !iv.months) return null;
  const last = lastRecord(typeId);
  if (!last) return null;

  const out = { last, kmLeft: null, daysLeft: null, dueKm: null, dueDate: null, status: "ok", pct: 0 };

  if (iv.km && last.mileage != null && car && car.mileage != null && car.mileage !== "") {
    out.dueKm = Number(last.mileage) + iv.km;
    out.kmLeft = out.dueKm - Number(car.mileage);
    out.pct = Math.min(1, Math.max(0, (Number(car.mileage) - Number(last.mileage)) / iv.km));
  }
  if (iv.months) {
    out.dueDate = addMonths(last.date, iv.months);
    out.daysLeft = daysBetween(todayISO(), out.dueDate);
    const totalDays = daysBetween(last.date, out.dueDate) || 1;
    const usedPct = (totalDays - out.daysLeft) / totalDays;
    out.pct = Math.max(out.pct, Math.min(1, Math.max(0, usedPct)));
  }

  const kmOver = out.kmLeft != null && out.kmLeft <= 0;
  const dayOver = out.daysLeft != null && out.daysLeft <= 0;
  const kmSoon = out.kmLeft != null && out.kmLeft <= 1000;
  const daySoon = out.daysLeft != null && out.daysLeft <= 30;
  out.status = kmOver || dayOver ? "over" : kmSoon || daySoon ? "warn" : "ok";
  return out;
}

function statusLabel(s) {
  return s === "over" ? t("dueOverdue") : s === "warn" ? t("dueSoon") : t("dueOk");
}

/* ---------- navigation ---------- */
let currentScreen = "home-screen";
const SCREENS = ["home-screen", "log-screen", "rec-form-screen", "learn-screen", "st-form-screen", "car-screen"];

function go(screen) {
  SCREENS.forEach((s) => { const el = $(s); if (el) el.hidden = s !== screen; });
  currentScreen = screen;
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.screen === screen));
  window.scrollTo(0, 0);
  if (screen === "home-screen") renderHome();
  if (screen === "log-screen") renderLog();
  if (screen === "learn-screen") renderLearn();
  if (screen === "car-screen") fillCarForm();
}

/* ================= HOME ================= */
function renderHome() {
  const hasCar = !!car;
  $("home-nocar").hidden = hasCar;
  $("home-car-card").hidden = !hasCar;
  $("home-mileage").hidden = !hasCar;
  $("home-spec").hidden = !hasCar;
  $("home-oil").hidden = !hasCar;

  if (hasCar) {
    const name = car.nickname || [car.make, car.model].filter(Boolean).join(" ") || t("carTitle");
    $("hc-name").textContent = name;
    const subBits = [];
    if (car.nickname && (car.make || car.model)) subBits.push([car.make, car.model].filter(Boolean).join(" "));
    if (car.year) subBits.push(car.year);
    if (car.engine) subBits.push(car.engine);
    $("hc-sub").textContent = subBits.join(" · ");
    $("hc-plate").hidden = !car.plate;
    $("hc-plate").textContent = car.plate || "";

    $("hm-value").textContent = car.mileage != null && car.mileage !== "" ? nf(car.mileage) : "—";
    renderOilCard();
    renderSpecCard();
  }

  renderUpcoming();

  const recent = [...records].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4);
  $("home-recent").innerHTML = recent.map(recordItemHTML).join("");
  $("home-recent-empty").hidden = recent.length > 0;

  $("home-quick").innerHTML = t("homeQuick")
    .map(([label, target]) => `<button class="quick-btn" data-quick="${target}">${esc(label)}</button>`)
    .join("");
}

function renderOilCard() {
  const d = dueFor("oil");
  const badge = $("ho-badge");
  const body = $("ho-body");

  if (!d) {
    badge.className = "badge info";
    badge.textContent = "\u2014";
    body.innerHTML = `<p class="muted" style="margin:0 0 14px">${esc(t("homeOilNoData"))}</p>
      <button class="btn btn-ghost" data-addtype="oil">${esc(t("homeOilLogBtn"))}</button>`;
    return;
  }

  badge.className = "badge " + (d.status === "ok" ? "" : d.status);
  badge.textContent = statusLabel(d.status);

  const iv = intervalFor("oil");

  /* The dial shows whichever limit is closer to running out. */
  const kmPct = d.kmLeft != null ? d.pct : null;
  const useKm = d.kmLeft != null;
  const big = useKm ? nf(Math.abs(d.kmLeft)) : String(Math.abs(d.daysLeft));
  const unit = useKm
    ? (d.kmLeft <= 0 ? t("homeKmOver") : t("homeKmLeft"))
    : (d.daysLeft <= 0 ? t("homeDaysOver") : t("homeDaysLeft"));

  let html = gaugeSVG(kmPct != null ? kmPct : d.pct, d.status, big, unit);

  const rows = [];
  if (car && car.mileage != null && car.mileage !== "") {
    rows.push(["ODO", nf(car.mileage) + " km", ""]);
  }
  if (d.dueKm != null) {
    rows.push(["NEXT", nf(d.dueKm) + " km", d.kmLeft <= 0 ? "over" : d.kmLeft <= 1000 ? "warn" : ""]);
  }
  if (d.dueDate) {
    const dayCls = d.daysLeft <= 0 ? "over" : d.daysLeft <= 30 ? "warn" : "";
    rows.push(["DUE", fmtDate(d.dueDate).toUpperCase(), dayCls]);
    rows.push(["LEFT",
      `${Math.abs(d.daysLeft)} ${d.daysLeft <= 0 ? t("homeDaysOver") : t("homeDaysLeft")}`, dayCls]);
  }
  html += rows.map(([k, v, cls]) =>
    `<div class="readout"><span class="ro-k">${esc(k)}</span><span class="ro-dots"></span>
      <span class="ro-v ${cls}">${esc(v)}</span></div>`).join("");

  const lastBits = [fmtDate(d.last.date)];
  if (d.last.mileage != null && d.last.mileage !== "") lastBits.push(nf(d.last.mileage) + " km");
  if (d.last.oilBrand) lastBits.push(d.last.oilBrand);
  if (d.last.oilGrade) lastBits.push(d.last.oilGrade);
  const ivTxt = [iv.km ? nf(iv.km) + " km" : "", iv.months ? iv.months + (LANG === "zh" ? " \u500b\u6708" : " mo") : ""]
    .filter(Boolean).join(" / ");
  html += `<div class="oil-sub">${esc(t("logLastDone"))}: ${esc(lastBits.join(" \u00b7 "))}
    <br>${esc(LANG === "zh" ? "\u9031\u671f" : "INTERVAL")}: ${esc(ivTxt)}</div>`;

  body.innerHTML = html;
}

function renderSpecCard() {
  const rows = [];
  if (car.oilGrade) rows.push([t("fOilGradeCar"), car.oilGrade]);
  if (car.oilSpec) rows.push([t("fOilSpec"), car.oilSpec]);
  if (car.oilCapacity) rows.push([t("fOilCapacity"), car.oilCapacity + " L"]);
  if (car.tyreSize) rows.push([t("fTyreSize"), car.tyreSize]);
  if (car.tyreFront || car.tyreRear) {
    rows.push([LANG === "zh" ? "胎壓（前／後）" : "Pressure (front / rear)",
      `${car.tyreFront || "—"} / ${car.tyreRear || "—"} psi`]);
  }
  $("hs-body").innerHTML = rows.length
    ? rows.map(([k, v]) => `<div class="spec-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join("")
    : `<p class="muted" style="margin:8px 0 0">${esc(t("homeSpecEmpty"))}
        <button class="link-btn" data-goto="car-screen" style="margin-left:6px">${esc(t("homeSpecFill"))}</button></p>`;
}

function renderUpcoming() {
  const items = [];

  SERVICE_TYPES.forEach((st) => {
    const d = dueFor(st.id);
    if (!d || d.status === "ok") return;
    const bits = [];
    if (d.kmLeft != null) bits.push(`${nf(Math.abs(d.kmLeft))} ${d.kmLeft <= 0 ? t("homeKmOver") : t("homeKmLeft")}`);
    if (d.daysLeft != null) bits.push(`${Math.abs(d.daysLeft)} ${d.daysLeft <= 0 ? t("homeDaysOver") : t("homeDaysLeft")}`);
    items.push({ icon: st.icon, title: st[LANG], sub: bits.join(" · "), status: d.status, sort: d.status === "over" ? 0 : 1 });
  });

  if (car) {
    const expiries = [
      ["licenceExpiry", t("fLicenceExp"), "check"],
      ["insuranceExpiry", t("fInsuranceExp"), "check"],
      ["inspectionDue", t("fInspectionDue"), "check"],
    ];
    expiries.forEach(([key, label, ic]) => {
      if (!car[key]) return;
      const left = daysBetween(todayISO(), car[key]);
      if (left > 60) return;
      items.push({
        icon: ic, title: label,
        sub: `${fmtDate(car[key])} · ${Math.abs(left)} ${left <= 0 ? t("homeDaysOver") : t("homeDaysLeft")}`,
        status: left <= 0 ? "over" : "warn", sort: left <= 0 ? 0 : 1,
      });
    });

    /* HK: private cars need an annual roadworthiness test once past six years old. */
    if (car.firstReg && !car.inspectionDue) {
      const sixYears = addMonths(car.firstReg, 72);
      const left = daysBetween(todayISO(), sixYears);
      if (left <= 120) {
        const past = left <= 0;
        items.push({
          icon: "check",
          title: LANG === "zh"
            ? (past ? "每年續牌前要驗車" : "就嚟開始要年檢驗車")
            : (past ? "Annual inspection now required" : "Annual inspection starts soon"),
          sub: LANG === "zh"
            ? `首次登記滿六年：${fmtDate(sixYears)}`
            : `Six years from first registration: ${fmtDate(sixYears)}`,
          status: past ? "warn" : "ok", sort: 2,
        });
      }
    }
  }

  items.sort((a, b) => a.sort - b.sort);
  $("home-upcoming").innerHTML = items.map((i) => `
    <li class="record-item">
      <span class="rec-icon ${i.status === "over" ? "accent" : ""}">${icon(i.icon)}</span>
      <span class="rec-main"><span class="rec-title">${esc(i.title)}</span>
        <span class="rec-sub">${esc(i.sub)}</span></span>
      <span class="badge ${i.status === "ok" ? "info" : i.status}">${esc(statusLabel(i.status))}</span>
    </li>`).join("");
  $("home-upcoming-empty").hidden = items.length > 0;
}

function recordItemHTML(r) {
  const st = typeById(r.type);
  const subBits = [fmtDate(r.date)];
  if (r.mileage != null && r.mileage !== "") subBits.push(nf(r.mileage) + " " + t("unitKm"));
  if (r.type === "oil" && (r.oilBrand || r.oilGrade)) subBits.push([r.oilBrand, r.oilGrade].filter(Boolean).join(" "));
  if (r.shop) subBits.push(r.shop);
  if (r.note) subBits.push(r.note);
  return `<li><button class="record-item" data-rec="${r.id}">
      <span class="rec-icon">${icon(st.icon)}</span>
      <span class="rec-main"><span class="rec-title">${esc(st[LANG])}</span>
        <span class="rec-sub">${esc(subBits.join(" · "))}</span></span>
      ${r.cost ? `<span class="rec-right rec-cost">$${nf(r.cost)}</span>` : ""}
    </button></li>`;
}

/* ================= LOG ================= */
let logFilter = "all";

function renderLog() {
  const dues = SERVICE_TYPES.map((st) => ({ st, d: dueFor(st.id) })).filter((x) => x.d);
  dues.sort((a, b) => ({ over: 0, warn: 1, ok: 2 }[a.d.status] - { over: 0, warn: 1, ok: 2 }[b.d.status]));
  $("log-status").innerHTML = dues.map(({ st, d }) => {
    const bits = [];
    if (d.kmLeft != null) bits.push(`${nf(Math.abs(d.kmLeft))} ${d.kmLeft <= 0 ? t("homeKmOver") : t("homeKmLeft")}`);
    if (d.daysLeft != null) bits.push(`${Math.abs(d.daysLeft)} ${d.daysLeft <= 0 ? t("homeDaysOver") : t("homeDaysLeft")}`);
    bits.push(`${t("logLastDone")} ${fmtDate(d.last.date)}`);
    return `<div class="due-item ${d.status === "ok" ? "" : d.status}">
      <span class="rec-icon">${icon(st.icon)}</span>
      <span class="due-main"><span class="due-title">${esc(st[LANG])}</span>
        <span class="due-sub">${esc(bits.join(" · "))}</span></span>
      <span class="badge ${d.status === "ok" ? "" : d.status}">${esc(statusLabel(d.status))}</span>
    </div>`;
  }).join("");
  $("log-status-empty").hidden = dues.length > 0;

  const used = [...new Set(records.map((r) => r.type))];
  $("log-filter").innerHTML =
    `<button class="chip ${logFilter === "all" ? "active" : ""}" data-filter="all">${esc(t("logFilterAll"))}</button>` +
    SERVICE_TYPES.filter((st) => used.includes(st.id))
      .map((st) => `<button class="chip ${logFilter === st.id ? "active" : ""}" data-filter="${st.id}">${esc(st[LANG])}</button>`)
      .join("");

  const list = records
    .filter((r) => logFilter === "all" || r.type === logFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  $("log-list").innerHTML = list.map(recordItemHTML).join("");
  $("log-empty").hidden = list.length > 0;
}

/* ================= RECORD FORM ================= */
let editingRec = null;

function openRecForm(id, presetType) {
  editingRec = id ? records.find((r) => r.id === id) : null;

  $("rf-type").innerHTML = SERVICE_TYPES.map((st) =>
    `<option value="${st.id}">${esc(st[LANG])}</option>`).join("");
  $("rf-oil-kind").innerHTML = `<option value="">${esc(t("oilKindNone"))}</option>` +
    OIL_TYPES.map((o) => `<option value="${o.id}">${esc(o[LANG].name)}</option>`).join("");
  $("oil-brand-list").innerHTML = OIL_BRANDS.map((b) =>
    `<option value="${esc(b.en.name.replace(/\s*\(.*\)$/, ""))}"></option>`).join("");

  const r = editingRec;
  $("rec-form-title").textContent = r ? t("recFormEdit") : t("recFormAdd");
  $("rf-type").value = r ? r.type : presetType || "oil";
  $("rf-date").value = r ? r.date : todayISO();
  $("rf-mileage").value = r ? (r.mileage ?? "") : (car && car.mileage != null ? car.mileage : "");
  $("rf-cost").value = r ? (r.cost ?? "") : "";
  $("rf-shop").value = r ? (r.shop || "") : "";
  $("rf-note").value = r ? (r.note || "") : "";
  $("rf-oil-brand").value = r ? (r.oilBrand || "") : "";
  $("rf-oil-grade").value = r ? (r.oilGrade || "") : (car && car.oilGrade) || "";
  $("rf-oil-kind").value = r ? (r.oilKind || "") : "";
  $("rf-oil-filter").checked = r ? !!r.oilFilter : true;
  $("rec-delete-btn").hidden = !r;
  toggleOilFields();
  go("rec-form-screen");
}

function toggleOilFields() {
  $("rf-oil-fields").hidden = $("rf-type").value !== "oil";
}

function saveRec(e) {
  e.preventDefault();
  const mileage = $("rf-mileage").value === "" ? null : Number($("rf-mileage").value);
  const rec = {
    id: editingRec ? editingRec.id : uid(),
    type: $("rf-type").value,
    date: $("rf-date").value,
    mileage,
    cost: $("rf-cost").value === "" ? null : Number($("rf-cost").value),
    shop: $("rf-shop").value.trim(),
    note: $("rf-note").value.trim(),
  };
  if (rec.type === "oil") {
    rec.oilBrand = $("rf-oil-brand").value.trim();
    rec.oilGrade = $("rf-oil-grade").value.trim();
    rec.oilKind = $("rf-oil-kind").value;
    rec.oilFilter = $("rf-oil-filter").checked;
  }
  if (editingRec) records = records.map((x) => (x.id === rec.id ? rec : x));
  else records.push(rec);
  save(K.recs, records);

  /* A newer odometer reading is worth keeping on the car itself. */
  if (mileage != null && car && (car.mileage == null || mileage > Number(car.mileage))) {
    car.mileage = mileage;
    save(K.car, car);
  }
  toast(t("saved"));
  go("log-screen");
}

/* ================= LEARN ================= */
let learnTab = "oil";

function renderLearn() {
  document.querySelectorAll("#learn-tabs .seg-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === learnTab));
  const body = $("learn-body");
  body.innerHTML =
    learnTab === "oil" ? learnOilHTML() :
    learnTab === "station" ? learnStationHTML() :
    learnTab === "tyre" ? learnTyreHTML() :
    learnTab === "sched" ? learnSchedHTML() : learnAdminHTML();
}

function acc(title, inner, open) {
  return `<div class="acc${open ? " open" : ""}">
    <button class="acc-head">${esc(title)}</button>
    <div class="acc-body"${open ? "" : " hidden"}>${inner}</div>
  </div>`;
}

function learnOilHTML() {
  const V = VISCOSITY[LANG];
  const viscosity = V.body.map((p) => `<p>${p}</p>`).join("") +
    `<div class="def-list">${V.grades.map((g) =>
      `<div class="def-item"><div class="def-k">${esc(g.g)}</div><div class="def-v">${esc(g.t)}</div></div>`).join("")}</div>` +
    `<div class="note-box" style="margin-top:14px"><p style="margin:0">${esc(V.where)}</p></div>`;

  const types = OIL_TYPES.map((o) => {
    const c = o[LANG];
    return `<div class="type-card">
      <div class="type-card-head"><h4>${esc(c.name)}</h4><span class="badge info">${esc(c.tag)}</span></div>
      <div class="type-interval">${esc(c.interval)}</div>
      <dl>
        <dt>${LANG === "zh" ? "係咩嚟" : "What it is"}</dt><dd>${esc(c.what)}</dd>
        <dt>${LANG === "zh" ? "邊個啱用" : "Who it suits"}</dt><dd>${esc(c.who)}</dd>
        <dt>${LANG === "zh" ? "要留意" : "Watch out"}</dt><dd>${esc(c.watch)}</dd>
      </dl>
    </div>`;
  }).join("");

  const S = OIL_SPECS[LANG];
  const specs = `<p>${S.intro}</p>` + S.groups.map((g) =>
    `<h4>${esc(g.name)}</h4><div class="def-list">${g.items.map(([k, v]) =>
      `<div class="def-item"><div class="def-k">${esc(k)}</div><div class="def-v">${v}</div></div>`).join("")}</div>`).join("") +
    `<div class="note-box" style="margin-top:16px"><p style="margin:0">${esc(S.rule)}</p></div>`;

  const brands = OIL_BRANDS.map((b) => {
    const c = b[LANG];
    const dots = Array.from({ length: 4 }, (_, i) => (i < b.price ? "●" : "<i>●</i>")).join("");
    return `<div class="brand-card">
      <div class="brand-head">
        <div><h4>${esc(c.name)}</h4><div class="brand-origin">${esc(c.origin)}</div></div>
        <span class="price-dots" title="${esc(t("brandPrice"))}">${dots}</span>
      </div>
      <p class="brand-note">${esc(c.note)}</p>
      <p class="brand-lines"><b>${esc(t("brandLines"))}:</b> ${esc(c.lines)}</p>
    </div>`;
  }).join("");

  const C = CHANGE_GUIDE[LANG];
  const when = `<p>${esc(C.lead)}</p>
    <div class="note-box"><h4>${esc(C.severe.title)}</h4><p style="margin:0">${esc(C.severe.body)}</p></div>
    <div class="def-list">${C.rules.map(([k, v]) =>
      `<div class="def-item"><div class="def-k">${esc(k)}</div><div class="def-v">${esc(v)}</div></div>`).join("")}</div>
    <h4>${esc(C.signsTitle)}</h4><ul class="bullets">${C.signs.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    <h4>${esc(C.dipTitle)}</h4><ol class="step-list">${C.dip.map((s) => `<li><span class="st-body">${esc(s)}</span></li>`).join("")}</ol>`;

  const choose = `<ol class="step-list">${CHOOSE_STEPS[LANG].map(([tt, bb]) =>
    `<li><span class="st-title">${esc(tt)}</span><span class="st-body">${esc(bb)}</span></li>`).join("")}</ol>`;

  const myths = MYTHS.map((m) =>
    `<div class="myth-card"><p class="myth-q">${esc(m[LANG].q)}</p><p class="myth-a">${esc(m[LANG].a)}</p></div>`).join("");

  return acc(t("oilSecChoose"), choose, true) +
    acc(t("oilSecViscosity"), viscosity) +
    acc(t("oilSecTypes"), types) +
    acc(t("oilSecSpecs"), specs) +
    acc(t("oilSecWhen"), when) +
    acc(t("oilSecBrands"), brands) +
    acc(t("oilSecMyths"), myths);
}

function learnStationHTML() {
  const S = STATION_SERVICES[LANG];
  const group = (g) => `<h4>${esc(g.title)}</h4><div class="def-list">${g.items.map(([k, v]) =>
    `<div class="def-item"><div class="def-k">${esc(k)}</div><div class="def-v">${esc(v)}</div></div>`).join("")}</div>`;

  const brands = `<div class="def-list">${STATION_BRANDS.map((b) =>
    `<div class="def-item"><div class="def-k">${esc(b[LANG].name)}</div><div class="def-v">${esc(b[LANG].note)}</div></div>`).join("")}</div>
    <p class="hint" style="margin-top:10px">${LANG === "zh"
      ? "品牌組合同各站服務會隨時間變，以實地為準。"
      : "Brands and per-site services change over time — confirm on the forecourt."}</p>`;

  const fuel = `<ul class="bullets">${S.fuel.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;

  const mine = `<p class="muted">${esc(t("myStationsLead"))}</p>
    <ul class="record-list" id="station-list">${stations.map(stationItemHTML).join("")}</ul>
    ${stations.length ? "" : `<p class="empty-msg">${esc(t("myStationsEmpty"))}</p>`}
    <button class="btn btn-secondary full" id="add-station-btn">＋ ${esc(t("addStation"))}</button>`;

  return `<p class="muted" style="margin-top:0">${S.intro}</p>` +
    acc(t("myStationsTitle"), mine, true) +
    acc(LANG === "zh" ? "有咩服務可以預期" : "What to expect on the forecourt",
      group(S.likely) + group(S.sometimes) + group(S.elsewhere)) +
    acc(LANG === "zh" ? "香港常見油站品牌" : "Common HK station brands", brands) +
    acc(S.fuelTitle, fuel);
}

function stationItemHTML(s) {
  const brand = STATION_BRANDS.find((b) => b.id === s.brand);
  const sub = [brand ? brand[LANG].name : t("brandOther"), s.district, s.note].filter(Boolean).join(" · ");
  const tags = SERVICE_KEYS.filter((k) => s.services && s.services.includes(k))
    .map((k) => `<span class="svc-tag on">${esc(t(k))}</span>`).join("");
  return `<li><button class="record-item station-item" data-station="${s.id}">
      <span class="rec-icon">${icon("fuel")}</span>
      <span class="rec-main"><span class="rec-title">${esc(s.name)}</span>
        <span class="rec-sub">${esc(sub)}</span>
        ${tags ? `<span class="station-svcs">${tags}</span>` : ""}</span>
    </button></li>`;
}

function learnTyreHTML() {
  const G = TYRE_GUIDE[LANG];
  let mine = "";
  if (car && (car.tyreFront || car.tyreRear || car.tyreSize)) {
    mine = `<div class="note-box"><h4>${LANG === "zh" ? "你部車嘅設定" : "Your car's settings"}</h4>
      <p style="margin:0">${esc([car.tyreSize, (car.tyreFront || car.tyreRear)
        ? `${car.tyreFront || "—"} / ${car.tyreRear || "—"} psi`
        : ""].filter(Boolean).join(" · "))}</p></div>`;
  }
  return `<p class="muted" style="margin-top:0">${esc(G.lead)}</p>` + mine +
    acc(G.title, `<ol class="step-list">${G.steps.map(([tt, bb]) =>
      `<li><span class="st-title">${esc(tt)}</span><span class="st-body">${bb}</span></li>`).join("")}</ol>`, true) +
    acc(G.freqTitle, `<ul class="bullets">${G.freq.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`) +
    acc(G.symTitle, `<div class="def-list">${G.sym.map(([k, v]) =>
      `<div class="def-item"><div class="def-k">${esc(k)}</div><div class="def-v">${esc(v)}</div></div>`).join("")}</div>`) +
    acc(G.checkTitle, `<ul class="bullets">${G.check.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`);
}

function learnSchedHTML() {
  const rows = SERVICE_TYPES.filter((st) => st.km || st.months).map((st) => {
    const d = dueFor(st.id);
    return `<tr>
      <td>${esc(st[LANG])}${d ? ` <span class="badge ${d.status === "ok" ? "" : d.status}" style="margin-left:4px">${esc(statusLabel(d.status))}</span>` : ""}</td>
      <td>${st.km ? nf(st.km) + " " + t("unitKm") : t("schedNA")}</td>
      <td>${st.months ? (LANG === "zh" ? st.months + " 個月" : st.months + " mo") : t("schedNA")}</td>
    </tr>`;
  }).join("");
  return `<p class="muted" style="margin-top:0">${esc(t("schedLead"))}</p>
    <table class="sched-table">
      <thead><tr><th>${esc(t("schedItem"))}</th><th>${esc(t("schedKm"))}</th><th>${esc(t("schedTime"))}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function learnAdminHTML() {
  return `<div class="def-list">${HK_ADMIN[LANG].map(([k, v]) =>
    `<div class="def-item"><div class="def-k">${esc(k)}</div><div class="def-v">${esc(v)}</div></div>`).join("")}</div>
    <button class="btn btn-secondary full" data-goto="car-screen">${esc(LANG === "zh" ? "去填到期日" : "Add the expiry dates")}</button>`;
}

/* ================= STATION FORM ================= */
let editingStation = null;

function openStationForm(id) {
  editingStation = id ? stations.find((s) => s.id === id) : null;
  $("sf-brand").innerHTML = STATION_BRANDS.map((b) =>
    `<option value="${b.id}">${esc(b[LANG].name)}</option>`).join("") +
    `<option value="other">${esc(t("brandOther"))}</option>`;
  $("sf-services").innerHTML = SERVICE_KEYS.map((k) =>
    `<div class="checkbox-row"><input type="checkbox" id="svc-${k}" value="${k}" />
      <label for="svc-${k}">${esc(t(k))}</label></div>`).join("");

  const s = editingStation;
  $("st-form-title").textContent = s ? t("stFormEdit") : t("stFormAdd");
  $("sf-name").value = s ? s.name : "";
  $("sf-brand").value = s ? s.brand : "shell";
  $("sf-district").value = s ? s.district || "" : "";
  $("sf-note").value = s ? s.note || "" : "";
  SERVICE_KEYS.forEach((k) => { $("svc-" + k).checked = !!(s && s.services && s.services.includes(k)); });
  $("st-delete-btn").hidden = !s;
  go("st-form-screen");
}

function saveStation(e) {
  e.preventDefault();
  const st = {
    id: editingStation ? editingStation.id : uid(),
    name: $("sf-name").value.trim(),
    brand: $("sf-brand").value,
    district: $("sf-district").value.trim(),
    note: $("sf-note").value.trim(),
    services: SERVICE_KEYS.filter((k) => $("svc-" + k).checked),
  };
  if (editingStation) stations = stations.map((x) => (x.id === st.id ? st : x));
  else stations.push(st);
  save(K.stations, stations);
  toast(t("saved"));
  learnTab = "station";
  go("learn-screen");
}

/* ================= CAR FORM ================= */
const CAR_FIELDS = [
  ["cf-nickname", "nickname"], ["cf-plate", "plate"], ["cf-make", "make"], ["cf-model", "model"],
  ["cf-year", "year"], ["cf-engine", "engine"], ["cf-firstreg", "firstReg"], ["cf-mileage", "mileage"],
  ["cf-oilgrade", "oilGrade"], ["cf-oilcap", "oilCapacity"], ["cf-oilspec", "oilSpec"],
  ["cf-oilkm", "oilIntervalKm"], ["cf-oilmo", "oilIntervalMonths"],
  ["cf-tyresize", "tyreSize"], ["cf-tyref", "tyreFront"], ["cf-tyrer", "tyreRear"],
  ["cf-licence", "licenceExpiry"], ["cf-insurance", "insuranceExpiry"], ["cf-inspection", "inspectionDue"],
];

function fillCarForm() {
  $("cf-fuel").innerHTML = [["petrol", "fuelPetrol"], ["diesel", "fuelDiesel"], ["hybrid", "fuelHybrid"], ["ev", "fuelEV"]]
    .map(([v, k]) => `<option value="${v}">${esc(t(k))}</option>`).join("");
  const c = car || {};
  CAR_FIELDS.forEach(([el, key]) => { $(el).value = c[key] == null ? "" : c[key]; });
  $("cf-fuel").value = c.fuel || "petrol";
  $("cf-oilkm").placeholder = DEFAULT_OIL_KM;
  $("cf-oilmo").placeholder = DEFAULT_OIL_MO;
  document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("active", b.dataset.lang === LANG));
  document.querySelectorAll("[data-theme-btn]").forEach((b) => b.classList.toggle("active", b.dataset.themeBtn === THEME));
  updateNotifUI();
}

function saveCar(e) {
  e.preventDefault();
  const c = car || {};
  CAR_FIELDS.forEach(([el, key]) => {
    const v = $(el).value.trim();
    c[key] = v === "" ? null : ($(el).type === "number" ? Number(v) : v);
  });
  c.fuel = $("cf-fuel").value;
  car = c;
  save(K.car, car);
  toast(t("saved"));
  go("home-screen");
}

/* ================= REMINDERS ================= */
/* There is no backend and no Notification Triggers API, so the app cannot fire a
   notification on a future date by itself. Two things that DO work offline:
   1. export the due dates as .ics so the phone's own calendar does the reminding;
   2. show a notification (and set the app badge) when the app is next opened. */

function dueDatedItems() {
  const out = [];

  SERVICE_TYPES.forEach((st) => {
    const d = dueFor(st.id);
    if (!d || !d.dueDate) return;
    const note = [];
    if (d.dueKm != null) note.push(`${nf(d.dueKm)} km`);
    note.push(`${t("logLastDone")} ${fmtDate(d.last.date)}`);
    out.push({ id: "svc-" + st.id, title: st[LANG], date: d.dueDate, note: note.join(" · ") });
  });

  if (car) {
    [["licenceExpiry", t("fLicenceExp")],
     ["insuranceExpiry", t("fInsuranceExp")],
     ["inspectionDue", t("fInspectionDue")]].forEach(([k, label]) => {
      if (car[k]) out.push({ id: k, title: label, date: car[k], note: "" });
    });

    /* HK: annual inspection becomes due once a private car passes six years, and
       then recurs every year. Once the six-year mark is behind us, point at the
       next registration anniversary instead of a date that has already gone. */
    if (car.firstReg && !car.inspectionDue) {
      const sixMark = addMonths(car.firstReg, 72);
      const past = daysBetween(todayISO(), sixMark) <= 0;
      out.push({
        id: "sixYear",
        title: LANG === "zh" ? "每年續牌前要驗車" : "Annual inspection required",
        date: past ? nextAnniversary(car.firstReg) : sixMark,
        note: LANG === "zh" ? "首次登記滿六年後每年一次" : "Yearly, once six years from first registration",
        recur: true,
      });
    }
  }

  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

/* The next occurrence of iso's month/day that is not in the past. */
function nextAnniversary(iso) {
  const base = new Date(iso + "T00:00:00");
  const today = new Date(todayISO() + "T00:00:00");
  const d = new Date(base);
  d.setFullYear(today.getFullYear());
  if (d < today) d.setFullYear(today.getFullYear() + 1);
  return isoLocal(d);
}

function carLabel() {
  if (!car) return "CarMate";
  return car.nickname || [car.make, car.model].filter(Boolean).join(" ") || "CarMate";
}

function buildICS(items) {
  const pad = (n) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) +
    "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
  const dOnly = (iso) => iso.replace(/-/g, "");
  const dayAfter = (iso) => {
    const d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + 1);
    return isoLocal(d).replace(/-/g, "");
  };
  const ex = (v) => String(v).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CarMate//HK//EN",
             "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  items.forEach((it) => {
    const summary = ex(carLabel() + " — " + it.title);
    L.push("BEGIN:VEVENT");
    L.push("UID:" + it.id + "-" + dOnly(it.date) + "@carmate.local");
    L.push("DTSTAMP:" + stamp);
    L.push("DTSTART;VALUE=DATE:" + dOnly(it.date));
    L.push("DTEND;VALUE=DATE:" + dayAfter(it.date));
    L.push("SUMMARY:" + summary);
    if (it.note) L.push("DESCRIPTION:" + ex(it.note));
    if (it.recur) L.push("RRULE:FREQ=YEARLY");
    /* two nudges: two weeks out, then three days out */
    [14, 3].forEach((n) => {
      L.push("BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P" + n + "D",
             "DESCRIPTION:" + summary, "END:VALARM");
    });
    L.push("END:VEVENT");
  });
  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

function exportICS() {
  const items = dueDatedItems().filter((it) => daysBetween(todayISO(), it.date) >= 0);
  if (!items.length) { toast(t("calNothing")); return; }
  const blob = new Blob([buildICS(items)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "carmate-reminders.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(t("calDone"));
}

function notifSupported() { return "Notification" in window; }

function updateNotifUI() {
  const el = $("notif-status");
  if (!el) return;
  let txt = t("notifStatusOff"), cls = "ro-v dim";
  if (!notifSupported()) { txt = t("notifUnsupported"); }
  else if (Notification.permission === "granted") { txt = t("notifStatusOn"); cls = "ro-v"; }
  else if (Notification.permission === "denied") { txt = t("notifBlocked"); cls = "ro-v warn"; }
  el.textContent = txt;
  el.className = cls;
  const btn = $("notif-enable-btn");
  if (btn) btn.hidden = !notifSupported() || Notification.permission !== "default";
}

async function enableNotifications() {
  if (!notifSupported()) { toast(t("notifUnsupported")); return; }
  try { await Notification.requestPermission(); } catch { /* older callback-only API */ }
  updateNotifUI();
  if (Notification.permission === "granted") notifyIfDue(true);
}

/* Fires on open: at most once a day unless forced. */
async function notifyIfDue(force) {
  if (!notifSupported() || Notification.permission !== "granted") return;

  const soon = dueDatedItems().filter((it) => daysBetween(todayISO(), it.date) <= 30);
  const kmSoon = SERVICE_TYPES.filter((st) => {
    const d = dueFor(st.id);
    return d && d.kmLeft != null && d.kmLeft <= 1000;
  }).length;
  const count = soon.length + kmSoon;

  if (navigator.setAppBadge) {
    (count ? navigator.setAppBadge(count) : navigator.clearAppBadge()).catch(() => {});
  }
  if (!count) return;
  if (!force && localStorage.getItem("cm_lastNotify") === todayISO()) return;
  localStorage.setItem("cm_lastNotify", todayISO());

  let body;
  if (soon.length) {
    const first = soon[0];
    const left = daysBetween(todayISO(), first.date);
    body = `${first.title} — ${Math.abs(left)} ${left <= 0 ? t("homeDaysOver") : t("homeDaysLeft")}`;
    if (count > 1) body += LANG === "zh" ? `（另有 ${count - 1} 項）` : ` (+${count - 1} more)`;
  } else {
    body = LANG === "zh" ? `有 ${count} 項就快到期` : `${count} item(s) due soon`;
  }

  const opts = { body, icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "carmate-due" };
  try {
    const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
    if (reg && reg.showNotification) await reg.showNotification(t("notifTitle"), opts);
    else new Notification(t("notifTitle"), opts);
  } catch { /* permission can be revoked between check and show */ }
}

/* ================= EVENTS ================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.screen) return go(btn.dataset.screen);
  if (btn.dataset.goto) return go(btn.dataset.goto);
  if (btn.dataset.addtype) return openRecForm(null, btn.dataset.addtype);
  if (btn.dataset.rec) return openRecForm(btn.dataset.rec);
  if (btn.dataset.station) return openStationForm(btn.dataset.station);
  if (btn.id === "add-station-btn") return openStationForm(null);

  if (btn.dataset.quick) {
    const [, tab] = btn.dataset.quick.split(":");
    learnTab = tab;
    return go("learn-screen");
  }
  if (btn.dataset.tab) { learnTab = btn.dataset.tab; return renderLearn(); }
  if (btn.dataset.filter) { logFilter = btn.dataset.filter; return renderLog(); }

  if (btn.classList.contains("acc-head")) {
    const box = btn.parentElement;
    const open = box.classList.toggle("open");
    box.querySelector(".acc-body").hidden = !open;
    return;
  }
  if (btn.dataset.themeBtn) { applyTheme(btn.dataset.themeBtn); return; }
  if (btn.dataset.lang) { switchLang(btn.dataset.lang); return; }
});

$("add-btn").addEventListener("click", () => openRecForm(null, logFilter !== "all" ? logFilter : "oil"));
$("lang-btn").addEventListener("click", () => switchLang(LANG === "zh" ? "en" : "zh"));
$("rf-type").addEventListener("change", toggleOilFields);
$("rec-form").addEventListener("submit", saveRec);
$("rec-cancel-btn").addEventListener("click", () => go(editingRec ? "log-screen" : "home-screen"));
$("rec-delete-btn").addEventListener("click", () => {
  if (!editingRec || !confirm(t("deleteConfirm"))) return;
  records = records.filter((r) => r.id !== editingRec.id);
  save(K.recs, records);
  go("log-screen");
});
$("st-form").addEventListener("submit", saveStation);
$("st-cancel-btn").addEventListener("click", () => { learnTab = "station"; go("learn-screen"); });
$("st-delete-btn").addEventListener("click", () => {
  if (!editingStation || !confirm(t("deleteConfirm"))) return;
  stations = stations.filter((s) => s.id !== editingStation.id);
  save(K.stations, stations);
  learnTab = "station";
  go("learn-screen");
});
$("car-form").addEventListener("submit", saveCar);
$("cal-export-btn").addEventListener("click", exportICS);
$("notif-enable-btn").addEventListener("click", enableNotifications);

$("hm-update").addEventListener("click", () => {
  const v = prompt(t("homeMileagePrompt"), car && car.mileage != null ? car.mileage : "");
  if (v == null || v.trim() === "") return;
  const n = Number(v);
  if (isNaN(n) || n < 0) return;
  car.mileage = n;
  save(K.car, car);
  renderHome();
  toast(t("saved"));
});

$("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ car, records, stations }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "carmate-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$("clear-data-btn").addEventListener("click", () => {
  if (!confirm(t("clearConfirm"))) return;
  [K.car, K.recs, K.stations].forEach((k) => localStorage.removeItem(k));
  car = null; records = []; stations = [];
  go("home-screen");
});

function switchLang(lang) {
  setLang(lang);
  applyI18n();
  $("lang-btn").textContent = lang === "zh" ? "EN" : "中";
  document.querySelectorAll("[data-lang]").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  go(currentScreen);
}

/* ---------- theme ---------- */
let THEME = localStorage.getItem(K.theme) || "dark";

function applyTheme(theme) {
  THEME = theme;
  localStorage.setItem(K.theme, theme);
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  const BAR = { dark: "#0A0C10", light: "#EEF1F6", macaron: "#F8F1F5" };
  if (meta) meta.setAttribute("content", BAR[theme] || BAR.dark);
  document.querySelectorAll("[data-theme-btn]").forEach((b) =>
    b.classList.toggle("active", b.dataset.themeBtn === theme));
}

/* ---------- boot ---------- */
applyTheme(THEME);
setLang(LANG);
applyI18n();
$("lang-btn").textContent = LANG === "zh" ? "EN" : "中";
go("home-screen");

notifyIfDue(false);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
