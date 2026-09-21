# 車伴 · Sidecar

A bilingual (繁中 / English) offline-first PWA for new car owners in Hong Kong.

- **主頁** — next-oil-change gauge (km + days), current mileage, upcoming licence / insurance / 驗車 reminders; tap the car card to switch between cars
- **記錄** — service log for 17 maintenance items, with per-item due status
- **學堂** — engine oil guide (viscosity, mineral vs semi vs full synthetic, API/ACEA/OEM specs, 9 brands, when to change, myths), petrol-station services, step-by-step 打氣 guide, interval reference, HK paperwork, what to do after an accident (minor collision through to serious crash, injuries, hit-and-run, the medical and legal aftermath), basic HK traffic rules for new drivers
- **我的車** — car profile, oil interval overrides, tyre pressures, expiry dates; multiple cars supported, each with its own records and reminders
- **First run** — name your car and go; everything else can be filled in later
- **車伴助手 assistant** — the chat bubble bottom-right. Out of the box it answers from the built-in guides (offline, no key, works with no signal at a crash site) and shows a 打 999 banner whenever a message mentions injury, fire or being trapped. Deploy `worker/` (a Cloudflare Worker holding your Anthropic key) and set `AI_ENDPOINT` in `config.js`, and the same box becomes Claude — grounded in `reference.txt`, which is generated from the app's guides by `node build-reference.mjs`
- **文件** — photograph or upload the insurance certificate, vehicle licence, registration document, driving licence and ID per car; stored in IndexedDB on the device, images downscaled to ~1800px, one tap from the accident guide
- **提醒** — export due dates to the phone calendar (.ics with 14-day and 3-day alarms)
- Three colour themes: 暗黑 / 光 / 馬卡龍

All data stays on the device — `localStorage` for records, IndexedDB for documents. No accounts, no backend, no analytics.

Every guide carries a standing note that the car's owner manual outranks the app.

## Run locally

```
python3 -m http.server 8913 --directory .
```
