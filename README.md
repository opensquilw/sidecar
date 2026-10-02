# 車伴 · Sidecar

A bilingual (繁中 / English) offline-first PWA for new car owners in Hong Kong.

- **主頁** — car card with odometer (tap to switch cars), next-oil-change gauge (km + days), 跟進事項. Status at a glance, nothing else.
- **記錄** — service log for 17 maintenance items, with per-item due status
- **學堂** — a topic list (意外 first, flagged red) opening into: engine oil guide (viscosity, mineral vs semi vs full synthetic, API/ACEA/OEM specs, 9 brands, when to change, myths), petrol-station services, step-by-step 打氣 guide, interval reference, HK paperwork, what to do after an accident (minor collision through to serious crash, injuries, hit-and-run, the medical and legal aftermath), basic HK traffic rules for new drivers
- **我的車** — profile summary, 我的文件, this car's calendar export; 編輯資料 opens the full form. Multiple cars, each with its own records and reminders.
- **First run** — name your car and go; everything else can be filled in later
- **求助 assistant** — the help bubble bottom-right. Out of the box it answers from the built-in guides (offline, no key, works with no signal at a crash site) and shows a 打 999 banner whenever a message mentions injury, fire or being trapped. Deploy `worker/` (a Cloudflare Worker holding your Anthropic key) and set `AI_ENDPOINT` in `config.js`, and the same box becomes Claude — grounded in `reference.txt`, which is generated from the app's guides by `node build-reference.mjs`
- **文件** — photograph or upload the insurance certificate, vehicle licence, registration document, driving licence and ID per car; stored in IndexedDB on the device, images downscaled to ~1800px, one tap from the accident guide
- **提醒** — export due dates to the phone calendar (.ics with 14-day and 3-day alarms)
- Three colour themes: 暗黑 / 光 / 馬卡龍

All data stays on the device — `localStorage` for records, IndexedDB for documents. No accounts, no backend, no analytics.

Every guide carries a standing note that the car's owner manual outranks the app.

## Run locally

```
python3 -m http.server 8913 --directory .
```

## Working on it

`node bump.mjs` after **every** edit to js/css — it stamps `?v=N` in index.html and sw.js plus `CACHE_NAME`, and fails if they disagree. Skipping it serves stale files to browsers and to the service worker, which looks exactly like a bug that isn't one.

`node build-reference.mjs` after editing `data.js` — regenerates `reference.txt`, the AI assistant's grounding. Commit both.

## iOS app (App Store)

The same files run inside a native shell built with [Capacitor](https://capacitorjs.com). `ios/` is the Xcode project; `native.js` is the only app code that knows about it, and it does nothing in a browser. Inside the app it:

- mirrors `localStorage` and the IndexedDB documents to native storage, and restores them if iOS clears the WebView's data;
- schedules real reminders (14 days, 3 days and on the day, at 9am) instead of on-open notifications;
- sends the calendar file, backup and documents to the share sheet, because a WebView can't download.

Build on a Mac with Xcode installed:

```
npm install
npm run ios        # copies the web files into www/, syncs ios/, opens Xcode
```

After editing any web file, run `node bump.mjs` as usual, then `npm run ios` again. `www/` and `ios/App/App/public/` are generated; don't edit them. `privacy.html` is the privacy policy the App Store listing links to.
