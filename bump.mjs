/* Cache-bust every asset in one step.  node bump.mjs
   index.html ?v=N, sw.js ASSETS ?v=N and CACHE_NAME sidecar-vN must always
   agree — editing a file without bumping serves stale JS/CSS to browsers
   (and to the service worker), which looks exactly like a bug that isn't one. */
import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const cur = Math.max(...[...html.matchAll(/\?v=(\d+)/g)].map((m) => +m[1]));
const next = cur + 1;

writeFileSync("index.html", html.replace(/\?v=\d+/g, `?v=${next}`));
writeFileSync("sw.js", readFileSync("sw.js", "utf8")
  .replace(/\?v=\d+/g, `?v=${next}`)
  .replace(/sidecar-v\d+/g, `sidecar-v${next}`));

const check = readFileSync("index.html", "utf8");
const sw = readFileSync("sw.js", "utf8");
const versions = new Set([...check.matchAll(/\?v=(\d+)/g), ...sw.matchAll(/\?v=(\d+)/g)].map((m) => m[1]));
const cache = sw.match(/sidecar-v(\d+)/)[1];
if (versions.size !== 1 || !versions.has(cache)) {
  console.error("MISMATCH", [...versions], "cache", cache); process.exit(1);
}
console.log(`v${cur} -> v${next} (index.html + sw.js + CACHE_NAME all agree)`);
