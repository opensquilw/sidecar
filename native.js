/* The iOS app shell (Capacitor). In a browser NATIVE is false and nothing here
   runs, so the PWA behaves exactly as before. Inside the app:
   - localStorage and the IndexedDB documents are mirrored to native storage,
     because iOS may clear WebView storage when the phone runs low on space;
   - reminders become real scheduled notifications instead of on-open ones;
   - files (.ics, backup, documents) go through the share sheet, since a
     WebView cannot download. */

const NATIVE = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
const NP = NATIVE ? Capacitor.Plugins : {};

/* ---------- localStorage mirror ---------- */
(function nativeStorage() {
  if (!NATIVE) return;
  const P = NP.Preferences;
  const ours = (k) => typeof k === "string" && k.startsWith("cm_");
  const setItem = Storage.prototype.setItem, removeItem = Storage.prototype.removeItem;
  let mirroring = false;

  Storage.prototype.setItem = function (k, v) {
    setItem.call(this, k, v);
    if (mirroring && this === localStorage && ours(k)) P.set({ key: k, value: String(v) }).catch(() => {});
  };
  Storage.prototype.removeItem = function (k) {
    removeItem.call(this, k);
    if (mirroring && this === localStorage && ours(k)) P.remove({ key: k }).catch(() => {});
  };

  /* If the WebView lost its data but the native copy has it, put it back and
     reload so app.js starts from the restored data. Otherwise refresh the
     native copy from the WebView and mirror every write from here on. */
  (async () => {
    try {
      const { keys } = await P.keys();
      const saved = keys.filter(ours);
      if (localStorage.getItem("cm_cars") == null && saved.includes("cm_cars")) {
        for (const k of saved) {
          const { value } = await P.get({ key: k });
          if (value != null) setItem.call(localStorage, k, value);
        }
        location.reload();
        return;
      }
      for (const k of saved) if (localStorage.getItem(k) == null) await P.remove({ key: k });
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (ours(k)) await P.set({ key: k, value: localStorage.getItem(k) });
      }
    } catch { /* storage mirror is best effort; the WebView copy still works */ }
    mirroring = true;
  })();
})();

/* ---------- document mirror (files in the app's private folder) ---------- */
const docFile = (id) => "docs/" + id + ".json";

function blobToB64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}
function b64ToBlob(b64, mime) {
  const bin = atob(b64), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return new Blob([u], { type: mime });
}

async function nativeDocSaved(d) {
  if (!NATIVE) return;
  const { blob, ...meta } = d;
  await NP.Filesystem.writeFile({
    path: docFile(d.id), directory: "DATA", encoding: "utf8", recursive: true,
    data: JSON.stringify({ ...meta, b64: await blobToB64(blob) }),
  });
}
function nativeDocDeleted(id) {
  if (!NATIVE) return Promise.resolve();
  return NP.Filesystem.deleteFile({ path: docFile(id), directory: "DATA" }).catch(() => {});
}

/* On launch: restore documents the WebView lost, and save any the native
   folder does not have yet (e.g. ones added before this mirror existed). */
async function nativeSyncDocs(docsAll, docPut) {
  if (!NATIVE) return false;
  let names = [];
  try { names = (await NP.Filesystem.readdir({ path: "docs", directory: "DATA" })).files.map((f) => f.name || f); }
  catch { /* folder not created yet */ }
  const onDisk = new Set(names.map((n) => n.replace(/\.json$/, "")));
  const inDb = await docsAll();
  const have = new Set(inDb.map((d) => d.id));
  let restored = false;
  for (const id of onDisk) {
    if (have.has(id)) continue;
    try {
      const { data } = await NP.Filesystem.readFile({ path: docFile(id), directory: "DATA", encoding: "utf8" });
      const { b64, ...meta } = JSON.parse(data);
      await docPut({ ...meta, blob: b64ToBlob(b64, meta.mime) });
      restored = true;
    } catch { /* skip an unreadable file rather than block the rest */ }
  }
  for (const d of inDb) if (!onDisk.has(d.id)) await nativeDocSaved(d).catch(() => {});
  return restored;
}

/* ---------- share sheet instead of downloads ---------- */
async function nativeShareFile(name, blob) {
  const { uri } = await NP.Filesystem.writeFile({ path: name, directory: "CACHE", data: await blobToB64(blob) });
  try { await NP.Share.share({ files: [uri] }); }
  catch { /* user closed the sheet */ }
}

/* ---------- scheduled reminders ---------- */
let nativeNotifPerm = "default";   // mirrors Notification.permission: default | granted | denied

async function nativeNotifRefresh() {
  if (!NATIVE) return;
  try {
    const { display } = await NP.LocalNotifications.checkPermissions();
    nativeNotifPerm = display === "granted" ? "granted" : display === "denied" ? "denied" : "default";
  } catch { nativeNotifPerm = "denied"; }
}
async function nativeNotifRequest() {
  try { await NP.LocalNotifications.requestPermissions(); } catch { /* fall through to refresh */ }
  await nativeNotifRefresh();
}

/* Replace every pending reminder with a fresh set: 14 days before, 3 days
   before and on the day, at 9am. iOS keeps at most 64 pending, so the
   soonest ones win. items: [{ title, date: "YYYY-MM-DD" }] */
async function nativeSchedule(items, text) {
  if (!NATIVE || nativeNotifPerm !== "granted") return;
  const LN = NP.LocalNotifications;
  try {
    const { notifications: old } = await LN.getPending();
    if (old.length) await LN.cancel({ notifications: old.map((n) => ({ id: n.id })) });
    const now = Date.now(), out = [];
    items.forEach((it) => [14, 3, 0].forEach((n) => {
      const at = new Date(it.date + "T09:00:00");
      at.setDate(at.getDate() - n);
      if (at.getTime() > now) out.push({ at, n, it });
    }));
    out.sort((a, b) => a.at - b.at);
    await LN.schedule({
      notifications: out.slice(0, 60).map((x, i) => ({
        id: i + 1, title: text.title, body: text.body(x.it, x.n), schedule: { at: x.at },
      })),
    });
  } catch { /* nothing we can do from here; the in-app status still shows due items */ }
}
