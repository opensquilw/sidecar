# 車主通 · CarMate

A bilingual (繁中 / English) offline-first PWA for new car owners in Hong Kong.

- **主頁** — next-oil-change gauge (km + days), current mileage, upcoming licence / insurance / 驗車 reminders
- **記錄** — service log for 17 maintenance items, with per-item due status
- **學堂** — engine oil guide (viscosity, mineral vs semi vs full synthetic, API/ACEA/OEM specs, 9 brands, when to change, myths), petrol-station services, step-by-step 打氣 guide, interval reference, HK paperwork
- **我的車** — car profile, oil interval overrides, tyre pressures, expiry dates
- **提醒** — export due dates to the phone calendar (.ics with 14-day and 3-day alarms)
- Three colour themes: 暗黑 / 光 / 馬卡龍

All data stays in `localStorage` on the device. No accounts, no backend, no analytics.

Every guide carries a standing note that the car's owner manual outranks the app.

## Run locally

```
python3 -m http.server 8913 --directory .
```
