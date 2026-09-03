/* Reference content for CarMate. Every entry carries en + zh copy.
   Nothing here is car-specific advice — the manual always wins, and the UI says so. */

/* ---------- Service / record types ---------- */
/* km + months are the DEFAULT service intervals used to compute "next due".
   null interval = event-based, logged but never nags on mileage. */
const SERVICE_TYPES = [
  { id: "oil",         icon: "oil",     km: 8000,   months: 12, en: "Engine oil + filter", zh: "換機油 + 機油隔" },
  { id: "airFilter",   icon: "filter",  km: 20000,  months: 24, en: "Air filter",          zh: "空氣隔" },
  { id: "cabinFilter", icon: "wind",    km: 15000,  months: 12, en: "Cabin / A-C filter",  zh: "冷氣隔" },
  { id: "sparkPlug",   icon: "spark",   km: 60000,  months: 60, en: "Spark plugs",         zh: "火咀" },
  { id: "brakeFluid",  icon: "drop",    km: null,   months: 24, en: "Brake fluid",         zh: "迫力油" },
  { id: "brakePad",    icon: "disc",    km: 40000,  months: null, en: "Brake pads",        zh: "迫力皮" },
  { id: "coolant",     icon: "temp",    km: 60000,  months: 36, en: "Coolant",             zh: "水箱水" },
  { id: "gearboxOil",  icon: "gear",    km: 60000,  months: 60, en: "Gearbox / ATF oil",   zh: "波箱油" },
  { id: "battery",     icon: "battery", km: null,   months: 48, en: "Battery",             zh: "電池" },
  { id: "tyre",        icon: "tyre",    km: 50000,  months: 60, en: "Tyres",               zh: "換車胎" },
  { id: "alignment",   icon: "align",   km: null,   months: 12, en: "Wheel alignment",     zh: "四輪定位" },
  { id: "wiper",       icon: "wiper",   km: null,   months: 12, en: "Wiper blades",        zh: "雨刮" },
  { id: "inspection",  icon: "check",   km: null,   months: 12, en: "Roadworthiness test", zh: "驗車" },
  { id: "fuel",        icon: "fuel",    km: null,   months: null, en: "Refuel",            zh: "入油" },
  { id: "wash",        icon: "wash",    km: null,   months: null, en: "Car wash / detail", zh: "洗車" },
  { id: "repair",      icon: "wrench",  km: null,   months: null, en: "Repair",            zh: "維修" },
  { id: "other",       icon: "dot",     km: null,   months: null, en: "Other",             zh: "其他" },
];

/* ---------- Oil guide: viscosity ---------- */
const VISCOSITY = {
  en: {
    title: "Reading the grade: what 5W-30 means",
    body: [
      "<b>5W</b> — the \"W\" is Winter. It rates how easily the oil still flows when the engine is cold. Lower number = thinner when cold = it reaches the top of the engine faster on start-up, which is when most engine wear happens.",
      "<b>30</b> — how thick the oil stays at full operating temperature (100°C). Higher number = thicker film.",
      "In Hong Kong there is no real winter, so the W number matters less here than in a cold country. That is <i>not</i> a licence to change it: modern engines have very tight oil passages and variable valve timing that is designed around one grade. Too thick and oil arrives late; too thin and the film breaks down. Use what the manual says.",
    ],
    grades: [
      { g: "0W-16 / 0W-20", t: "Modern Japanese engines, hybrids, small turbos. Fuel-economy grades — only use if specified." },
      { g: "5W-30", t: "The most common grade worldwide. Most modern Japanese and European petrol cars." },
      { g: "5W-40", t: "European turbo petrol and diesel, older performance engines, hot hard driving." },
      { g: "10W-40", t: "Older or higher-mileage engines, usually semi-synthetic. Common on cars 10+ years old." },
      { g: "15W-40", t: "Older diesels and commercial vans. Rarely right for a modern private car." },
      { g: "0W-40", t: "High-performance European engines (Porsche A40, some AMG). Premium full synthetic only." },
    ],
    where: "Where to find your grade: the owner's manual, the oil filler cap on top of the engine, or a sticker under the bonnet. Put it in My Car so you never have to look it up at the garage again.",
  },
  zh: {
    title: "睇懂標號：5W-30 係咩意思",
    body: [
      "<b>5W</b> — 「W」係 Winter（冬天）。呢個數字講緊機油喺凍嘅時候仲有幾易流動。數字越細＝凍機時越稀＝著車一開始就快啲流到引擎頂部。引擎大部分磨蝕就係喺頭嗰幾秒發生。",
      "<b>30</b> — 機油喺正常工作溫度（100°C）之下仲有幾稠。數字越大＝油膜越厚。",
      "香港冇真正嘅冬天，所以 W 嗰個數字冇寒帶國家咁緊要。但唔代表可以亂改：新引擎油道好幼，可變汽門正時（VVT）係跟住一個指定黏度設計嘅。太稠＝機油遲到；太稀＝油膜頂唔住。跟車主手冊寫嗰個就最穩陣。",
    ],
    grades: [
      { g: "0W-16 / 0W-20", t: "新款日本引擎、油電混能、小排氣量渦輪。慳油專用標號，車廠有寫先好用。" },
      { g: "5W-30", t: "全世界最常見。大部分近十年嘅日系同歐系汽油車。" },
      { g: "5W-40", t: "歐洲渦輪汽油／柴油、舊款性能車、成日跑高速或者車頭好熱嗰啲。" },
      { g: "10W-40", t: "舊車或者行咗好多公里嘅引擎，多數配半合成。十年以上嘅車好常見。" },
      { g: "15W-40", t: "舊柴油車、貨 Van。私家車而家好少會啱。" },
      { g: "0W-40", t: "高性能歐洲引擎（Porsche A40、部分 AMG）。淨係用高級全合成。" },
    ],
    where: "喺邊度搵到你部車嘅標號：車主手冊、引擎上面個入油蓋（機油蓋）、或者車頭冚入面貼紙。搵到之後入落「我的車」，第日入車房就唔使再撳手機搵。",
  },
};

/* ---------- Oil guide: base oil types ---------- */
const OIL_TYPES = [
  {
    id: "mineral",
    tier: 1,
    en: { name: "Mineral oil", tag: "Cheapest", interval: "≈5,000 km or 3–4 months",
      what: "Straight refined crude oil. The molecules are uneven sizes, so it thins out faster under heat and leaves more deposits.",
      who: "Older, simple, low-stress engines. Some workshops still put it in 15-year-old cars. Fine if it is what the car was designed for and you change it often.",
      watch: "Degrades fastest in Hong Kong's heat and stop-go traffic. Never use it in a turbo engine." },
    zh: { name: "礦物油", tag: "最平", interval: "約 5,000 公里 或 3–4 個月",
      what: "直接由原油提煉，分子大細唔均勻，一熱就好快變稀，燒完仲會留多啲積碳。",
      who: "舊款、結構簡單、負荷細嘅引擎。有啲車房仲會幫十幾年嘅車入呢種。只要係原廠設計啱、又勤力換，其實冇問題。",
      watch: "香港又熱又塞車，佢衰得最快。渦輪車千祈唔好用。" },
  },
  {
    id: "semi",
    tier: 2,
    en: { name: "Semi-synthetic", tag: "Middle ground", interval: "≈7,000–8,000 km or 6 months",
      what: "A blend of mineral base oil with some synthetic base. Better heat resistance than mineral, cheaper than full synthetic.",
      who: "Older cars with some mileage on them, or drivers who want a safety margin without paying full-synthetic prices. Often paired with 10W-40.",
      watch: "\"Semi-synthetic\" is loosely regulated — the synthetic share varies a lot between brands." },
    zh: { name: "半合成", tag: "中間落墨", interval: "約 7,000–8,000 公里 或 6 個月",
      what: "礦物基礎油撈一部分合成基礎油。耐熱過礦物油，又平過全合成。",
      who: "有返咁上下里數嘅舊車，或者想安全啲但唔想畀全合成價錢嘅車主。好多時配 10W-40。",
      watch: "「半合成」呢個叫法冇好嚴格規管，唔同牌子入面合成成分差好遠。" },
  },
  {
    id: "full",
    tier: 3,
    en: { name: "Full synthetic", tag: "Most modern cars require this", interval: "≈8,000–10,000 km or 12 months",
      what: "Base oil built to a uniform molecular size (Group III / PAO / ester). Flows better cold, holds its film hotter, resists sludge, and lasts far longer between changes.",
      who: "Anything turbocharged, direct-injection, hybrid, or made in roughly the last 10–15 years. If your manual asks for a long service interval, it is assuming full synthetic.",
      watch: "Costs more per litre but the longer interval usually evens it out. Do not stretch the interval past what your manual allows just because the bottle says \"long life\"." },
    zh: { name: "全合成", tag: "多數新車必須用", interval: "約 8,000–10,000 公里 或 12 個月",
      what: "分子大細做到好均勻嘅基礎油（Group III／PAO／酯類）。凍機流得快、高溫油膜頂得住、唔易結油泥，換油周期長好多。",
      who: "凡係渦輪、缸內直噴、油電混能，或者大概近 10–15 年出嘅車。你本手冊如果寫住好長嘅換油周期，佢預咗你用全合成。",
      watch: "每公升貴啲，但周期長咗，計落多數打和。唔好淨係見支油寫住「Long Life」就自己拉長周期，跟手冊上限。" },
  },
];

/* ---------- Oil guide: specifications ---------- */
const OIL_SPECS = {
  en: {
    intro: "The grade (5W-30) is only half the answer. The other half is the <b>specification</b> — the standards body or carmaker approval printed on the bottle. This is the part people skip, and it is the part that actually protects a modern engine.",
    groups: [
      { name: "API (American)", items: [
        ["API SP", "Newest petrol standard (2020+). Adds protection against LSPI — a pre-ignition knock that can wreck small turbo direct-injection engines. Backwards compatible, so SP is a safe upgrade over SN."],
        ["API SN / SN Plus", "Previous generation. Still fine for older non-turbo engines."],
        ["API CK-4 / CJ-4", "Diesel engine oils."],
      ]},
      { name: "ILSAC (fuel economy)", items: [
        ["GF-6A", "Pairs with API SP for 0W-20 / 5W-30 and thicker. Fuel-economy and timing-chain wear tested."],
        ["GF-6B", "For the very thin 0W-16 grade only."],
      ]},
      { name: "ACEA (European)", items: [
        ["A3/B4", "Full-SAPS, high-strength European oils. Older Euro petrol and diesel without a particulate filter."],
        ["C2 / C3 / C5", "Low-SAPS ('mid' ash). <b>Required</b> if your car has a diesel DPF or a petrol GPF filter. Wrong ash level slowly clogs the filter — an expensive mistake."],
      ]},
      { name: "Carmaker approvals", items: [
        ["VW 502.00 / 504.00 / 508.00", "Volkswagen, Audi, Škoda, SEAT. 504.00 is the long-life low-SAPS one."],
        ["MB 229.5 / 229.51 / 229.52", "Mercedes-Benz."],
        ["BMW LL-01 / LL-04", "BMW and MINI. LL-04 for particulate-filter cars."],
        ["GM dexos1 Gen3", "Most modern GM petrol engines."],
        ["Porsche A40 / C30", "Porsche."],
        ["Toyota / Honda / Nissan genuine", "Japanese makers mostly just specify API/ILSAC plus a grade, which is why Japanese cars are easy to shop for."],
      ]},
    ],
    rule: "Rule of thumb: match the grade, then match the spec. Once both match, the difference between good brands is real but small — much smaller than the difference between changing on time and changing late.",
  },
  zh: {
    intro: "標號（5W-30）只係答咗一半，另一半係<b>規格</b> —— 支油樽上面印住嗰啲標準組織認證或者車廠認證。呢部分最多人跳過，但偏偏就係真正保護新引擎嗰部分。",
    groups: [
      { name: "API（美國標準）", items: [
        ["API SP", "最新汽油標準（2020 年起）。加咗防 LSPI 保護 —— 一種低速預燃爆震，可以整死細排氣量渦輪直噴引擎。向下兼容，所以由 SN 升做 SP 一定安全。"],
        ["API SN / SN Plus", "上一代。舊款自然吸氣引擎仲用得。"],
        ["API CK-4 / CJ-4", "柴油引擎專用機油。"],
      ]},
      { name: "ILSAC（慳油認證）", items: [
        ["GF-6A", "配 API SP，適用 0W-20／5W-30 或以上。有慳油同定時鏈磨蝕測試。"],
        ["GF-6B", "淨係畀好稀嘅 0W-16 用。"],
      ]},
      { name: "ACEA（歐洲標準）", items: [
        ["A3/B4", "全 SAPS（高灰分）高強度歐洲油。冇微粒濾網嘅舊款歐洲汽油／柴油車。"],
        ["C2 / C3 / C5", "低 SAPS（低灰分）。如果你部車有柴油 DPF 或者汽油 GPF 微粒濾網，<b>一定要用</b>。灰分用錯會慢慢塞死個濾網，換一個好貴。"],
      ]},
      { name: "車廠認證", items: [
        ["VW 502.00 / 504.00 / 508.00", "福士、Audi、Škoda、SEAT。504.00 係長效低灰分嗰隻。"],
        ["MB 229.5 / 229.51 / 229.52", "平治。"],
        ["BMW LL-01 / LL-04", "寶馬同 MINI。有微粒濾網就用 LL-04。"],
        ["GM dexos1 Gen3", "多數近年 GM 汽油引擎。"],
        ["Porsche A40 / C30", "保時捷。"],
        ["豐田／本田／日產原廠", "日系車廠多數淨係指定 API／ILSAC 加一個標號，所以日本車買油最易搞掂。"],
      ]},
    ],
    rule: "一句記住：先對標號，再對規格。兩樣都啱咗之後，好牌子之間嘅分別係有，但好細 —— 細過「準時換」同「拖到先換」之間嘅分別。",
  },
};

/* ---------- Oil brands ---------- */
const OIL_BRANDS = [
  { id: "mobil1", price: 3, en: { name: "Mobil 1 (美孚)", origin: "ExxonMobil · USA",
      note: "The most widely stocked premium full synthetic in Hong Kong — nearly every garage can get it. Strong all-rounder with a very broad approval list.",
      lines: "Mobil 1 ESP (low-SAPS, Euro), FS (0W-40 performance), X2 (0W-20 Japanese)" },
    zh: { name: "Mobil 1（美孚一號）", origin: "ExxonMobil · 美國",
      note: "香港最容易搵到嘅高級全合成，幾乎個個車房都攞到貨。全能型，車廠認證清單好齊。",
      lines: "Mobil 1 ESP（低灰分，歐洲車）、FS（0W-40 性能）、X2（0W-20 日本車）" } },
  { id: "shell", price: 3, en: { name: "Shell Helix (蜆殼)", origin: "Shell · Netherlands/UK",
      note: "Helix Ultra uses a gas-to-liquid base oil that starts out water-clear — marketed on keeping the engine clean, and it does test well on sludge. Easy to buy at Shell stations as well as garages.",
      lines: "Helix Ultra (full synth), Helix HX7 (semi), Ultra ECT C3 (Euro low-SAPS)" },
    zh: { name: "Shell Helix（蜆殼喜力）", origin: "Shell · 荷蘭／英國",
      note: "Helix Ultra 用天然氣製合成基礎油，出廠時清到似水，主打保持引擎乾淨，防油泥測試表現的確好。除咗車房，Shell 油站都買到。",
      lines: "Helix Ultra（全合成）、Helix HX7（半合成）、Ultra ECT C3（歐洲低灰分）" } },
  { id: "castrol", price: 3, en: { name: "Castrol (嘉實多)", origin: "Castrol/BP · UK",
      note: "The other brand you will see everywhere in Hong Kong. Magnatec is aimed squarely at short stop-go city trips — exactly what most HK driving is. EDGE is the performance line.",
      lines: "EDGE (full synth), Magnatec (city / stop-start), GTX (budget)" },
    zh: { name: "Castrol（嘉實多）", origin: "Castrol／BP · 英國",
      note: "香港另一隻周街見到嘅牌子。Magnatec 主攻短途、停停行行嘅市區用車 —— 即係香港大部分人日常揸車嘅情況。EDGE 就係性能線。",
      lines: "EDGE（全合成）、Magnatec（市區／怠速熄火）、GTX（入門）" } },
  { id: "total", price: 2, en: { name: "TotalEnergies Quartz", origin: "TotalEnergies · France",
      note: "Good value full synthetic with solid European approvals. Often the house brand at garages that work on French and Euro cars.",
      lines: "Quartz INEO (low-SAPS), Quartz 9000" },
    zh: { name: "TotalEnergies Quartz（道達爾）", origin: "TotalEnergies · 法國",
      note: "抵玩嘅全合成，歐洲車廠認證幾齊。專做法國車同歐洲車嘅車房好多時當佢係主打油。",
      lines: "Quartz INEO（低灰分）、Quartz 9000" } },
  { id: "liquimoly", price: 4, en: { name: "Liqui Moly (力魔)", origin: "Germany",
      note: "A favourite among Euro-car owners. Top Tec covers most VAG/BMW/MB approvals; Molygen adds a friction modifier that turns the oil green. Priced above the mainstream brands.",
      lines: "Top Tec 4200/4600, Molygen New Generation, Special Tec" },
    zh: { name: "Liqui Moly（力魔）", origin: "德國",
      note: "歐洲車車主嘅心水。Top Tec 系列覆蓋大部分 VAG／BMW／平治認證；Molygen 加咗抗磨添加劑，支油係綠色嘅。價錢貴過主流牌子。",
      lines: "Top Tec 4200／4600、Molygen New Generation、Special Tec" } },
  { id: "motul", price: 4, en: { name: "Motul (摩特)", origin: "France",
      note: "The enthusiast/track brand. 300V is a full ester racing oil with a short service life — brilliant on track, overkill and wasteful for a daily commute. 8100 X-cess is the sensible road line.",
      lines: "8100 X-cess / X-clean (road), 300V (track)" },
    zh: { name: "Motul（摩特）", origin: "法國",
      note: "玩車／賽道派牌子。300V 係全酯類賽車油，壽命短 —— 落賽道好勁，但日常返工用就大材小用兼嘥錢。行街車用 8100 X-cess 就啱。",
      lines: "8100 X-cess／X-clean（街車）、300V（賽道）" } },
  { id: "eneos", price: 2, en: { name: "ENEOS / Idemitsu (出光)", origin: "Japan",
      note: "Japanese oils built around what Japanese engines actually ask for — especially the thin 0W-20 grades. Sensible pick for a Toyota, Honda, Nissan or Mazda without paying European-brand prices.",
      lines: "ENEOS Sustina, X Prime; Idemitsu Zepro" },
    zh: { name: "ENEOS／Idemitsu（出光）", origin: "日本",
      note: "跟住日本引擎實際需要去做嘅日本油，特別係好稀嘅 0W-20。揸豐田、本田、日產、萬事得又唔想畀歐洲牌子價錢，呢個好抵。",
      lines: "ENEOS Sustina、X Prime；Idemitsu Zepro" } },
  { id: "repsol", price: 2, en: { name: "Repsol", origin: "Spain",
      note: "Well-specced full synthetic at a friendly price. Less common on HK shelves but easy to order.",
      lines: "Elite Evolution, Elite Long Life" },
    zh: { name: "Repsol（雷普索爾）", origin: "西班牙",
      note: "規格唔差，價錢友善嘅全合成。香港舖頭冇咁常見，但落單訂唔難。",
      lines: "Elite Evolution、Elite Long Life" } },
  { id: "oem", price: 4, en: { name: "Genuine / OEM oil (原廠油)", origin: "Your carmaker's dealer",
      note: "Toyota Genuine, Honda, VW, BMW TwinPower, Mercedes etc. Guaranteed to meet the spec because the carmaker wrote the spec. Costs more at the dealer, and it is the zero-thinking option — which for a new owner is a perfectly good reason to pick it.",
      lines: "Sold through the franchised dealer / 代理" },
    zh: { name: "原廠油（Genuine／OEM）", origin: "你部車嘅代理",
      note: "豐田原廠、本田、福士、BMW TwinPower、平治等等。一定合規格，因為規格本身就係佢寫嘅。喺代理買會貴啲，但係「唔使諗」嘅選擇 —— 對新手嚟講呢個理由已經夠好。",
      lines: "喺該品牌代理／服務中心買" } },
];

/* ---------- When to change ---------- */
const CHANGE_GUIDE = {
  en: {
    title: "When should I actually change it?",
    lead: "Your manual comes first — it may say anything from 5,000 km to 15,000 km. Then adjust for how the car is really used.",
    severe: {
      title: "Hong Kong counts as \"severe service\"",
      body: "Most manuals have a second, shorter interval for severe conditions. Hong Kong driving ticks nearly every box on that list: short trips that never fully warm the engine, heavy stop-go traffic, sustained heat and humidity, steep hills, and long idling. If your manual gives two intervals, use the shorter one.",
    },
    rules: [
      ["Change the oil filter every single time", "A filter costs a fraction of the oil. Reusing it leaves a filter full of old dirty oil in the system."],
      ["Even a low-mileage car needs an annual change", "Oil ages by absorbing moisture and unburnt fuel, not just by covering distance. A car that does 3,000 km a year still needs fresh oil once a year."],
      ["Log the mileage, not just the date", "Whichever limit arrives first — km or months — is the one that counts."],
      ["Topping up is not changing", "Adding a bit of oil restores the level, not the additives. It buys you time, nothing more."],
    ],
    signsTitle: "Signs it is overdue",
    signs: [
      "Dipstick oil is black and gritty rather than translucent brown",
      "Engine sounds louder or more 'tappy' on a cold start",
      "Oil warning light, or the level is at or below MIN",
      "Burnt smell from the engine bay",
      "You genuinely cannot remember the last change — that is itself the answer",
    ],
    dipTitle: "How to check the dipstick",
    dip: [
      "Park on level ground. Run the engine to warm it, switch off, wait 5–10 minutes for the oil to drain back down.",
      "Pull the dipstick out, wipe it clean with tissue, push it fully back in.",
      "Pull it out again and read it. The level should sit between MIN and MAX — closer to MAX is fine, above MAX is not.",
      "Look at the colour too. Fresh oil is honey-coloured and translucent; old oil is opaque black.",
    ],
  },
  zh: {
    title: "咁究竟幾時要換？",
    lead: "先睇車主手冊 —— 佢可能寫 5,000 公里，又可能寫 15,000 公里。跟住再按你實際點揸去調整。",
    severe: {
      title: "喺香港揸車，基本上算「嚴苛使用」",
      body: "多數手冊都有第二個、短啲嘅「嚴苛條件」周期。香港嘅用車情況幾乎全中：短途行到引擎都未真正熱身、成日塞車停停行行、長期又熱又濕、斜路多、又成日怠速等人。如果你本手冊寫住兩個周期，就跟短嗰個。",
    },
    rules: [
      ["每次換油都要一齊換機油隔", "一個隔嘅價錢只係機油嘅幾分之一。慳返個隔，即係留咗成隔舊油污喺個系統入面。"],
      ["就算行得好少，一年都要換一次", "機油唔淨係「行得多」先變壞，佢會吸水氣同未燒完嘅汽油。一年只行三千公里嘅車，一樣要一年換一次。"],
      ["記得一齊記低里數，唔好淨係記日期", "公里數同月數，邊個先到就以邊個為準。"],
      ["「添油」唔等於「換油」", "加返啲油只係補返油位，補唔到已經消耗晒嘅添加劑。爭返啲時間啫。"],
    ],
    signsTitle: "呢啲情況即係拖得太耐",
    signs: [
      "機油尺抹出嚟又黑又有粒粒，唔再係半透明嘅啡色",
      "凍機著車嗰陣引擎聲大咗、或者「答答」聲多咗",
      "機油警告燈著，或者油位跌到 MIN 或以下",
      "打開車頭冚有陣燒燶味",
      "你真係諗唔起上次幾時換 —— 咁其實已經係答案"
    ],
    dipTitle: "點樣睇機油尺",
    dip: [
      "泊喺平地。著車熱身，熄匙，等 5–10 分鐘畀機油流返落去。",
      "抽出機油尺，用紙巾抹乾淨，再插返到底。",
      "再抽出嚟睇。油位應該喺 MIN 同 MAX 之間 —— 貼近 MAX 冇問題，過咗 MAX 就唔得。",
      "順便睇顏色。新油係蜜糖色、半透明；舊油就係唔透光嘅黑色。",
    ],
  },
};

/* ---------- Myths ---------- */
const MYTHS = [
  { en: { q: "More frequent changes are always better", a: "Past a point it is just money and waste. Changing full synthetic every 3,000 km throws away oil that is still fine. Follow the manual's severe-service interval and stop there." },
    zh: { q: "換得越密越好？", a: "過咗某個點就純粹嘥錢兼嘥資源。全合成每 3,000 公里換一次，係倒咗啲仲好好哋嘅油。跟手冊嘅「嚴苛條件」周期就夠，唔使再密。" } },
  { en: { q: "Full synthetic is always the right upgrade", a: "It is right for most modern engines, but a very old, high-mileage engine with worn seals can start weeping through gaps that thicker mineral oil was bridging. Match the spec, not the marketing." },
    zh: { q: "全合成一定係升級？", a: "對多數新引擎係啱，但一部好舊、里數好高、油封已經硬化嘅引擎，換咗之後可能會開始滲油 —— 因為之前係啲稠啲嘅礦物油頂住咗啲罅。跟規格，唔好跟廣告。" } },
  { en: { q: "You must never mix brands", a: "All oils of the same grade and spec are compatible — an emergency top-up with a different brand will not hurt anything. It is just not ideal as a permanent habit, since you dilute whichever additive package you paid for." },
    zh: { q: "唔同牌子撈埋會出事？", a: "只要標號同規格一樣，其實係兼容嘅 —— 半路急住添少少第二隻牌子，唔會搞出事。淨係唔好長期咁做啫，因為你會溝淡咗自己畀錢買嗰個添加劑配方。" } },
  { en: { q: "Engine flush before every change", a: "Modern detergent oils keep the engine clean on their own. A chemical flush on a high-mileage engine can dislodge deposits that were plugging small leaks. Only do it if a mechanic finds an actual sludge problem." },
    zh: { q: "每次換油都要「洗引擎」？", a: "而家嘅機油本身有清潔添加劑，日常已經幫你保持乾淨。喺高里數引擎落化學清洗劑，隨時會沖甩啲本來塞住細滲漏嘅積碳。除非師傅真係發現有油泥問題，否則唔使做。" } },
  { en: { q: "Thicker oil protects an old engine better", a: "Sometimes, but not by default. Going up a grade without a reason slows cold-start flow, which is when wear happens. Ask a mechanic who has actually looked at your engine." },
    zh: { q: "舊車用稠啲嘅油會保護好啲？", a: "有時係，但唔可以當定律。冇原因就跳高一級，只會令凍機時流動慢咗 —— 而磨蝕就係嗰陣發生。想改就搵真係睇過你部引擎嘅師傅先。" } },
  { en: { q: "The colour tells you when to change", a: "Dark oil is often just oil doing its job — detergents hold soot in suspension. Colour is a weak signal; mileage and time are the real ones. Grittiness and smell matter more than shade." },
    zh: { q: "睇顏色就知幾時要換？", a: "油變黑好多時只係代表佢做緊嘢 —— 清潔添加劑將積碳懸浮住。顏色係好弱嘅指標，里數同時間先係真。有冇粒粒同有冇燶味，重要過深淺色。" } },
];

/* ---------- Choosing flow ---------- */
const CHOOSE_STEPS = {
  en: [
    ["Open the manual (or the filler cap)", "Find two things: the viscosity grade (e.g. 5W-30) and the specification (e.g. API SP, ACEA C3, VW 504.00). Write both into My Car."],
    ["Lock the grade", "Non-negotiable. Do not let anyone talk you into a different grade without a specific reason for your engine."],
    ["Match or exceed the spec", "API standards are backwards compatible — SP covers a car asking for SN. Carmaker approvals are not flexible: if it says VW 504.00, it needs VW 504.00."],
    ["Pick the oil type", "If the manual asks for a long interval or the engine is turbocharged, that means full synthetic. Otherwise semi-synthetic is a fair compromise on an older car."],
    ["Then pick a brand", "Now it is about price, availability and preference. Any of the majors that carries your grade + spec will do the job."],
    ["Ask for the old parts back", "A quick way to keep a garage honest: ask to see the drained oil and the old filter. Log the date, mileage, brand and grade in CarMate straight away."],
  ],
  zh: [
    ["打開車主手冊（或者睇機油蓋）", "搵兩樣嘢：黏度標號（例如 5W-30）同規格（例如 API SP、ACEA C3、VW 504.00）。兩樣都入落「我的車」。"],
    ["標號鎖死", "冇得傾。除非有針對你部引擎嘅特定理由，否則唔好畀人游說你轉標號。"],
    ["規格要啱或者更高", "API 標準向下兼容 —— 部車要 SN，用 SP 冇問題。但車廠認證冇得彈：寫住 VW 504.00 就一定要 VW 504.00。"],
    ["揀油種", "手冊寫住長周期、或者部車有渦輪，即係要全合成。否則舊車用半合成都算合理折衷。"],
    ["最後先揀牌子", "去到呢步先係睇價錢、買唔買到、同個人喜好。任何一隻大牌子，只要有你要嘅標號＋規格，都做到嘢。"],
    ["叫師傅畀返舊件你睇", "想車房老實啲，有個好簡單方法：叫佢畀你睇放出嚟嘅舊油同舊機油隔。跟住即刻喺 CarMate 記低日期、里數、牌子同標號。"],
  ],
};

/* ---------- Petrol station services ---------- */
const STATION_BRANDS = [
  { id: "shell", en: { name: "Shell", note: "Large network across the territory. FuelSave 95 and V-Power 98 unleaded plus diesel; many sites have a convenience shop and an air pump." },
    zh: { name: "Shell（蜆殼）", note: "全港網絡大。有 FuelSave 95 同 V-Power 98 無鉛汽油同柴油；好多站有便利店同氣泵。" } },
  { id: "caltex", en: { name: "Caltex", note: "Petrol with Techron additive plus diesel. Star Card / loyalty discounts are common; many sites have a car wash." },
    zh: { name: "Caltex（加德士）", note: "汽油加 Techron 添加劑，另有柴油。Star Card／會員折扣好常見；唔少站有洗車。" } },
  { id: "sinopec", en: { name: "Sinopec 中石化", note: "95 and 98 unleaded plus diesel, often with aggressive member pricing." },
    zh: { name: "中石化（Sinopec）", note: "95 同 98 無鉛汽油同柴油，會員價錢好多時比較進取。" } },
  { id: "petrochina", en: { name: "PetroChina 中石油", note: "95 and 98 unleaded plus diesel, similar footprint and promotions." },
    zh: { name: "中石油（PetroChina）", note: "95 同 98 無鉛汽油同柴油，網絡同優惠都相近。" } },
  { id: "esso", en: { name: "Esso", note: "Synergy petrol and diesel at selected sites." },
    zh: { name: "Esso（埃索）", note: "部分站提供 Synergy 汽油同柴油。" } },
];

const STATION_SERVICES = {
  en: {
    intro: "What a Hong Kong petrol station can and cannot do for you. Which services a site actually has varies station by station — the list below is what to look for, not a guarantee. Save the ones near you in <b>My stations</b> once you have checked.",
    likely: { title: "Usually available", items: [
      ["Air pump for tyres (打氣)", "Most sites have one, often self-service and free or very cheap. Not every station — small forecourts sometimes skip it. Attendants will usually help if you ask."],
      ["Convenience shop", "Screen wash, top-up engine oil, wiper blades, bulbs, coolant, tissue. Handy for emergencies, dearer than an auto parts shop."],
      ["Fuel-card / loyalty discount", "Almost all brands run member pricing or card rebates. Worth signing up on day one — HK fuel is expensive enough that a few dollars a litre adds up fast."],
      ["Toilet", "Most staffed sites."],
    ]},
    sometimes: { title: "Some stations only", items: [
      ["Car wash", "Automatic rollover wash at selected larger sites. Hand wash is usually a separate business."],
      ["EV charging", "Appearing at more sites, but still patchy. Check the operator's app before relying on it."],
      ["Quick oil change bay", "A few branded sites run a service bay. Most oil changes in Hong Kong still happen at an independent garage (車房) or the dealer."],
      ["Nitrogen tyre fill", "More typically a tyre shop service than a petrol station one."],
    ]},
    elsewhere: { title: "Go elsewhere for these", items: [
      ["Tyre replacement, puncture repair, balancing, alignment", "Tyre shop (車胎鋪). They will normally check and set your pressures for free while you are there — the easiest way to get it done properly."],
      ["Servicing, oil change, brakes, diagnostics", "Independent garage (車房) or the franchised dealer (代理). Dealer costs more and protects the warranty; a good garage costs less and is worth finding early."],
      ["Roadworthiness test (驗車)", "A designated vehicle examination centre — required annually once a private car is over six years old, before you can renew the licence."],
      ["LPG (石油氣)", "Dedicated LPG filling stations. Relevant to taxis and light buses, not to a normal petrol private car."],
    ]},
    fuelTitle: "95 or 98?",
    fuel: [
      "Hong Kong pumps sell 95 and 98 octane unleaded plus diesel. The number is the octane rating — resistance to knocking, not 'power' or 'cleanliness' by itself.",
      "Use the minimum your manual specifies. If it says 95, running 98 will not add power to an engine that cannot use it; you are paying for headroom you do not need.",
      "If it says 98 or 'premium unleaded required', do not save money there — a knock-limited turbo engine will pull timing on lower octane and can suffer over time.",
      "Diesel and petrol are never interchangeable. Misfuelling is one of the most expensive mistakes a new owner can make — check the pump nozzle colour and label every single time until it is automatic.",
    ],
  },
  zh: {
    intro: "香港嘅油站幫到你咩、幫唔到你咩。每個站實際有咩服務都唔同 —— 下面呢張表係「可以留意咩」，唔係保證。你去過確認咗之後，記得喺<b>我的油站</b>入面存低附近嗰幾間。",
    likely: { title: "通常都有", items: [
      ["車胎氣泵（打氣）", "多數站都有，好多時係自助，免費或者好平。但唔係間間都有 —— 細地盤嘅油站有時會冇。開口問嘅話，員工通常都肯幫手。"],
      ["便利店", "玻璃水、添加用嘅機油、雨刮、燈膽、水箱水、紙巾。急用好方便，但貴過汽車用品舖。"],
      ["油卡／會員折扣", "幾乎每個牌子都有會員價或者信用卡回贈。第一日就去登記係值得嘅 —— 香港油價咁貴，每公升爭幾蚊，加埋好快見到。"],
      ["洗手間", "多數有人手駐守嘅站都有。"],
    ]},
    sometimes: { title: "部分站先有", items: [
      ["洗車", "部分較大嘅站有自動洗車機。人手洗車多數係另一門生意。"],
      ["電動車充電", "越嚟越多站有，但仲未算普及。真係要靠佢就記得開返營運商個 App 睇實時狀況。"],
      ["快速換機油", "少數品牌站有服務區。但香港大部分換機油，仲係喺獨立車房或者代理度做。"],
      ["車胎充氮氣", "呢個通常係車胎鋪嘅服務，多過油站。"],
    ]},
    elsewhere: { title: "呢啲要去第二度", items: [
      ["換胎、補胎、車呔平衡、四輪定位", "車胎鋪。你喺度做嘢嗰陣，佢通常會順便免費幫你校返胎壓 —— 呢個係最慳事又最準嘅做法。"],
      ["定期保養、換機油、迫力、電腦檢查", "獨立車房，或者品牌代理。代理貴啲但保住原廠保養；好嘅車房平啲，值得早啲搵定一間熟。"],
      ["驗車", "指定汽車檢驗中心。私家車首次登記滿六年之後，每年續牌之前都要驗一次。"],
      ["石油氣（LPG）", "專門嘅石油氣加氣站。主要係的士同小巴用，一般汽油私家車唔關事。"],
    ]},
    fuelTitle: "入 95 定 98？",
    fuel: [
      "香港油站賣 95 同 98 辛烷值無鉛汽油，另加柴油。個數字係辛烷值 —— 即係抗爆震能力，本身唔等於「馬力」或者「乾淨」。",
      "跟手冊寫嘅最低要求就得。如果佢寫 95，你入 98 唔會令一部用唔到嘅引擎多咗馬力；你只係買咗用唔着嘅餘裕。",
      "但如果佢寫 98 或者「須用高辛烷值汽油」，就唔好喺呢度慳 —— 渦輪引擎食低辛烷值會自動延遲點火，長期落去會傷。",
      "汽油同柴油永遠唔可以互換。入錯油係新手最貴嘅意外之一 —— 未變成習慣之前，每次都望實個油槍顏色同標籤。",
    ],
  },
};

/* ---------- Tyre pressure guide ---------- */
const TYRE_GUIDE = {
  en: {
    title: "Filling your tyres, step by step",
    lead: "The single cheapest piece of maintenance there is, and the one new owners skip most. Under-inflated tyres cost you fuel, wear out at the shoulders, and are the main cause of blowouts.",
    steps: [
      ["Find your correct pressure — not the tyre's", "It is on a sticker in the driver's door jamb (open the door and look at the frame), sometimes inside the fuel flap or in the manual. <b>Do not use the number moulded on the tyre sidewall</b> — that is the tyre's maximum, not your car's setting. Typical private car: 32–36 psi."],
      ["Check cold", "Cold means parked 3+ hours, or driven less than about 3 km. Driving heats the air and reads 2–4 psi high. If you must check warm, set it to the target and re-check cold later."],
      ["Know your units", "1 bar ≈ 14.5 psi ≈ 100 kPa. Hong Kong pumps are usually psi. If a placard shows both, read the one your pump uses."],
      ["At the pump", "Unscrew the valve cap and keep it somewhere you will not lose it. Press the hose fitting squarely onto the valve — a short hiss is normal, a continuous hiss means it is not seated. Add or release air until the gauge reads your target. Screw the cap back on."],
      ["Do all four — and the spare", "Spare tyres lose pressure sitting untouched and are almost always flat when you finally need one. Space-saver spares often need a much higher pressure (around 60 psi) — check its own label."],
      ["Adjust for a full load", "Many placards list a second, higher set of pressures for a fully loaded car or long motorway runs. Use those if you are packing the car."],
      ["Reset the TPMS if needed", "If your car has tyre-pressure monitoring, the warning light may need a reset after inflating — the procedure is in the manual, often a button or a menu item."],
    ],
    freqTitle: "How often",
    freq: [
      "Once a month, and before any long drive.",
      "Tyres lose roughly 1–2 psi a month on their own.",
      "Pressure drops about 1 psi for every 5–6°C the temperature falls, so a cold snap will set off warning lights across the city.",
    ],
    symTitle: "What wrong pressure looks like",
    sym: [
      ["Too low", "Worn at both outer edges, heavy steering, worse fuel economy, tyre runs hot — the classic blowout setup."],
      ["Too high", "Worn down the centre strip, bouncy ride, less grip in the wet because the contact patch shrinks."],
      ["Uneven wear on one side only", "Not a pressure problem — that is alignment. Get it checked."],
    ],
    checkTitle: "While you are down there",
    check: [
      "Tread depth: the legal minimum in Hong Kong is 1.6 mm. Most tyres have wear indicator bars moulded into the grooves — when the tread is flush with the bar, the tyre is finished.",
      "Look for cuts, bulges in the sidewall, or a nail head. A sidewall bulge means replace it now, not later.",
      "Check the age: a four-digit DOT code on the sidewall gives week and year (e.g. 2523 = week 25 of 2023). Rubber hardens with age — most makers say replace at 5–6 years even with tread left, and Hong Kong's heat and UV do not help.",
    ],
  },
  zh: {
    title: "打氣一步一步教",
    lead: "全世界最平嘅保養，偏偏又係新車主最容易漏咗嗰樣。胎壓唔夠會耗油、兩邊胎肩磨蝕，亦係爆胎嘅頭號原因。",
    steps: [
      ["搵你部車嘅標準胎壓 —— 唔係條胎嘅", "貼紙喺駕駛席車門邊嘅門柱（打開門望門框），有時喺油缸蓋入面或者車主手冊。<b>千祈唔好照跟胎側面印住嗰個數字</b> —— 嗰個係條胎嘅上限，唔係你部車嘅設定。一般私家車：32–36 psi。"],
      ["要「凍胎」量度", "凍胎即係泊咗三個鐘以上，或者行咗少過約三公里。行過車啲氣熱脹，讀數會高 2–4 psi。如果一定要熱住量，就先打到目標值，之後凍返再覆核。"],
      ["搞清楚單位", "1 bar ≈ 14.5 psi ≈ 100 kPa。香港啲氣泵多數用 psi。貼紙如果兩個單位都有，睇返你部氣泵用嗰個。"],
      ["喺氣泵度點做", "扭開氣咀蓋，放喺唔會唔見嘅位。將氣喉頭直直㩒實個氣咀 —— 「嘶」一聲好正常，但一直漏氣就代表冇㩒正。加氣或者放氣，直到錶面到你個目標值。做完扭返個蓋。"],
      ["四條胎都要 —— 連士啤呔", "士啤呔擺喺度冇人理，會慢慢漏氣，等到真係要用嗰陣多數已經冇氣。細嘅備用呔（space-saver）好多時要打好高，成 60 psi 左右 —— 睇返佢自己個標籤。"],
      ["載重多就要加壓", "好多貼紙都會列多一組「滿載」或者長途高速用嘅較高胎壓。成車人成車行李嘅話，就跟嗰組。"],
      ["需要嘅話 reset 胎壓感應", "如果部車有 TPMS 胎壓監測，打完氣可能要 reset 先熄到個警告燈 —— 做法喺手冊入面，多數係㩒個掣或者入 menu。"],
    ],
    freqTitle: "幾耐做一次",
    freq: [
      "一個月一次，另外長途出發之前再check一次。",
      "車胎自己每個月都會走大約 1–2 psi。",
      "氣溫每跌 5–6°C，胎壓大約跌 1 psi，所以一凍親成個城市都會有人著胎壓燈。",
    ],
    symTitle: "胎壓唔啱會點",
    sym: [
      ["太低", "兩邊外側磨蝕、扭軚重、耗油、條胎行到好熱 —— 呢個就係典型爆胎前奏。"],
      ["太高", "中間一條磨蝕、坐落好彈、落雨抓地差咗（因為接地面積細咗）。"],
      ["淨係一邊磨蝕", "呢個唔關胎壓事，係四輪定位問題。搵人check下。"],
    ],
    checkTitle: "順便睇埋呢啲",
    check: [
      "花紋深度：香港法例最低係 1.6 毫米。多數車胎喺坑紋入面有磨蝕指示條，花紋磨到同條指示條平就代表條胎壽終正寢。",
      "睇下有冇割痕、胎側有冇隆起、有冇釘。胎側隆起就即刻換，唔好等。",
      "睇埋出廠年份：胎側有個四位數 DOT 碼，代表週數同年份（例如 2523＝2023 年第 25 週）。橡膠會隨年份變硬 —— 多數廠商建議就算仲有花紋，五至六年都應該換，而香港啲熱同紫外線更加加速。",
    ],
  },
};

/* ---------- HK admin reminders ---------- */
const HK_ADMIN = {
  en: [
    ["Vehicle licence (牌費)", "Renew before it expires — driving with an expired licence is an offence. Renewal periods are typically 4 or 12 months; the Transport Department sends a reminder but do not depend on the post."],
    ["Third-party insurance", "Legally required at all times. It must be valid before the licence can be renewed."],
    ["Roadworthiness test (驗車)", "Once a private car is more than six years old from first registration, it needs an annual examination at a designated centre before each licence renewal. Book early — slots get tight."],
    ["Keep the paperwork in the car", "Registration document details, insurance certificate and licence. Photograph them and keep the photos on your phone as a backup."],
  ],
  zh: [
    ["車輛牌照（續牌／牌費）", "過期之前要續 —— 冇有效牌照上路係違法嘅。續牌期通常係 4 個月或者 12 個月；運輸署會寄提示，但唔好淨係靠封信。"],
    ["第三者保險", "法例規定任何時候都要有效。續牌之前保險一定要生效。"],
    ["驗車", "私家車由首次登記計滿六年之後，每次續牌前都要去指定檢驗中心年檢。早啲 book —— 位好搶。"],
    ["文件放車上", "車輛登記文件資料、保險證同牌照。順便影低相擺喺手機做後備。"],
  ],
};
