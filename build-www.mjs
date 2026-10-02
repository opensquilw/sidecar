/* Copy the web app into www/ for the iOS shell.  node build-www.mjs
   The repo root is the web app (served as-is by GitHub Pages); Capacitor needs
   it in its own folder so node_modules/ and ios/ don't get bundled into the app.
   The service worker is left out: the app's files already ship inside it. */
import { cpSync, rmSync, mkdirSync } from "node:fs";

const FILES = ["index.html", "style.css", "config.js", "data.js", "i18n.js", "native.js", "app.js", "manifest.json", "icons"];

rmSync("www", { recursive: true, force: true });
mkdirSync("www");
for (const f of FILES) cpSync(f, "www/" + f, { recursive: true });
console.log("www/ ready:", FILES.join(", "));
