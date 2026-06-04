# Climate Policy Monitor — Wireframes

Low-fidelity ASCII mockups for the visualization modes in [`PLAN.md`](./PLAN.md) §6. Illustrative numbers only.
Conventions shown throughout: bilingual 中/EN labels, a language toggle, a metric/chart toggle, filters, and
**provenance + export** affordances (source · `retrieved_at` · license · CSV/PNG download) on every view.

Assumes the recommended `PLAN.md` §10 defaults (Tier A sources first, hybrid analyst+narrative). Adjust freely.

---

## Mode 1 — Overview / Dashboard (landing)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 🌍 全球气候政策监测 · Climate Policy Monitor     [中/EN]  最近更新 2026-06-04 │
│ 看板 地图 趋势 对比 检索 构成 新动态 数据  Dashboard Map Trends Compare ...   │
├────────────────────────────────────────────────────────────────────────────┤
│ ┌政策总数──┐ ┌覆盖国家┐ ┌今年新增┐ ┌平均强度─┐ ┌净零承诺┐ ┌上次采集──┐      │
│ │ 12,847   │ │  196   │ │  312   │ │ 4.6/10  │ │ 4,190  │ │ 6h ago   │      │
│ │ Policies │ │Countries│ │New 2026│ │Stringency│ │Net-zero│ │ ✓ 8 src  │      │
│ └──────────┘ └────────┘ └────────┘ └─────────┘ └────────┘ └──────────┘      │
├──────────────────────────────────────────────┬─────────────────────────────┤
│  全球政策覆盖 / Global coverage  [coverage ▾] │  🆕 新动态 / What's New       │
│                                               │ ───────────────────────────  │
│         .-~~-.        ___                      │ • EU  · CBAM directive        │
│       .'  ████ '.   .' ██ '.                   │   碳边境调整 · 2d   [EUR-Lex] │
│      (  ███████  ) ( ████   )                  │ • IND · NDC v3 submitted      │
│       '. █████ .'   '.___.'   ▁▂▃▅▇ low→high   │   2035 ratchet · 3d [UNFCCC]  │
│         '-....-'                               │ • BRA · Carbon market law     │
│                                               │   5d              [CPR/CCLW]  │
│  累计气候立法 cumulative laws ▁▂▃▄▅▆▇█ 1990→26 │            [查看全部 All →]   │
└──────────────────────────────────────────────┴─────────────────────────────┘
  Sources: CPDB · OECD · Climate Watch · CPR/CCLW · World Bank · Net Zero Tracker
```

---

## Mode 2 — Map (metric toggle is the heart of this view)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  地图 / Map                                           [中/EN]  CSV ↓  PNG ↓  │
├──────────────┬─────────────────────────────────────────────────────────────┤
│ 指标 Metric  │ [ 覆盖 Coverage | ●强度 Stringency | 碳价 Price | 净零 NZ ]   │
│ ───────────  │ ┌─────────────────────────────────────────────────────────┐ │
│ ▸ 部门Sector │ │          ___                                            │ │
│ ▸ 工具Instr. │ │        .' ██ '.     ┌─ hover ───────────────┐  ████ 8–10│ │
│ ▸ 状态Status │ │  _____( █████ )___  │ Germany / 德国         │  ███  6–8 │ │
│ ▸ 类型Type   │ │ '. ███████████  '.  │ Stringency: 7.8/10     │  ██   4–6 │ │
│ 年份 Year    │ │   ).  █████████ .(  │ Policies: 214          │  ▒    2–4 │ │
│ 1990 ──●2026 │ │     '-._______.-'   │ Carbon price: $55/t    │  ░    0–2 │ │
│              │ │                     └────────────────────────┘  ▢ no data│ │
│ [重置 Reset] │ │  click country → profile (Mode 8)                       │ │
│              │ └─────────────────────────────────────────────────────────┘ │
│              │  CAPMF stringency 0–10 · OECD · retrieved 2026-06-04 · CC-BY │
└──────────────┴─────────────────────────────────────────────────────────────┘
```

---

## Mode 3 — Trends (the cumulative growth curve is the signature chart)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 趋势 / Trends  [●增长 Growth | 浪潮 Waves | 强度 Stringency | 目标 Targets]   │
├────────────────────────────────────────────────────────────────────────────┤
│  气候立法累计增长 · Cumulative climate laws & policies adopted                │
│ 13k┤                                                            ______▇       │
│    │                                                   ______/                │
│    │                                          ______/                         │
│ 6k ┤                                 _______/                                 │
│    │                       ______/                                            │
│    │             ______/                                                      │
│  0 ┤_________/                                                                │
│    └──────────────────────────────────────────────────────────────────────  │
│     1990      1997 Kyoto    2009     2015 Paris       2021        2026        │
│  overlay: COP / treaty markers       [by sector ▾] [region ▾]  CSV ↓  PNG ↓  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Mode 4 — Compare (country × policy-area stringency heatmap = the analyst workhorse)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 对比 / Compare      国家 Countries: [DEU ✕][CHN ✕][USA ✕][IND ✕][+ Add]      │
├────────────────────────────────────────────────────────────────────────────┤
│ 政策强度热力图 · Stringency heatmap (policy area × country, CAPMF)            │
│                      DEU    CHN    USA    IND    JPN                          │
│  Carbon pricing      ███8   ██5    ▒2     ░1     ██6                          │
│  Energy efficiency   ███9   ███7   ██6    ▒3     ███8                         │
│  Renewables support  ███8   ███9   ██5    ██6    ██6     legend:             │
│  Transport           ██6    ██5    ▒3     ░2     ██5     ░0  ▒ low            │
│  Buildings           ███7   ▒4     ▒3     ░1     ██6     ██ mid  ███ high     │
│  Industry            ██5    ██6    ▒2     ▒3     ██5                          │
│ ─────────────────────────────────────────────────────────────────────────── │
│ 工具组合 Instrument mix     净零目标 Net-zero       差距 Gaps (vs peers)      │
│  DEU ▇▇▇▅▃  CHN ▇▇▅▃▁        DEU 2045 (in law)       USA: no carbon price     │
│  USA ▇▅▃▁▁  IND ▇▅▃▁▁        CHN 2060 (pledge)       IND: weak buildings/transp│
│                              USA 2050 (pledge)      [导出对比 Export ↓]       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Mode 5 — Search / Corpus (faceted full-text)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 检索 / Search   [ carbon border adjustment            ]  [搜索 Search]       │
├──────────────┬─────────────────────────────────────────────────────────────┤
│ 国家 Country │  results 1–10 of 342           sort: [relevance ▾]  CSV ↓    │
│  ▸ EU (88)   │ ───────────────────────────────────────────────────────────  │
│  ▸ CHN (41)  │  Carbon Border Adjustment Mechanism Regulation   [EU][law]    │
│ 部门 Sector  │  …a …<mark>carbon border adjustment</mark>… on imports of…    │
│  ▸ Industry  │  EU · 2023 · in force            [原文 PDF] [详情 →]          │
│ 来源 Source  │ ───────────────────────────────────────────────────────────  │
│  ▸ CPR/CCLW  │  关于建立碳边境调节机制的通知                     [CHN][policy]│
│  ▸ EUR-Lex   │  …<mark>碳边境</mark>调节…试点…                                │
│ 概念 Concept │  CHN · 2024 · planned            [原文 PDF] [详情 →]          │
│  ☁ tag cloud │ ───────────────────────────────────────────────────────────  │
│              │  concept trend ▁▂▃▅▇ "carbon border" mentions 2019→2026       │
└──────────────┴─────────────────────────────────────────────────────────────┘
```

---

## Mode 7 — What's New / Live (the signature "monitor" behavior)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 新动态 / What's New     [全部 All|新法 Laws|NDC|碳价 Price]  周报 Digest      │
├────────────────────────────────────────────────────────────────────────────┤
│ 🆕 2026-06-02 · EUR-Lex                                          [EU 🇪🇺]    │
│    Directive (EU) 2026/441 — Carbon Border Adjustment update                 │
│    碳边境调整机制更新 · law · energy/industry        [原文 PDF] [详情 →]      │
│ ────────────────────────────────────────────────────────────────────────── │
│ 🆕 2026-06-01 · UNFCCC NDC Registry                              [IND 🇮🇳]   │
│    India NDC version 3 submitted (2035 ratchet)                              │
│    submission_date 2026-06-01 · ndc                  [原文 PDF] [详情 →]      │
│ ────────────────────────────────────────────────────────────────────────── │
│    2026-05-28 · CPR/CCLW                                         [BRA 🇧🇷]   │
│    Brazil regulated carbon market — implementing decree                      │
│    policy · carbon_price                             [原文 PDF] [详情 →]      │
│ ────────────────────────────────────────────────────────────────────────── │
│    detected by real-time cron · ordered by first_seen_at       [更多 More ↓] │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Mode 8 — Country Profile (drill-down synthesis)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ← 返回  德国 Germany (DEU)                          [导出本国 Export DEU ↓] │
├───────────────────────────────┬────────────────────────────────────────────┤
│  概览 Overview                 │  强度轨迹 Stringency 1990–2023             │
│  Policies:       214           │  10┤                              ____      │
│  Avg stringency: 7.8 / 10      │    │                        _____/          │
│  Net-zero:       2045 (in law) │   5┤            ______/                     │
│  Carbon price:   $55 / tCO₂    │    │     ___/                               │
│  Latest:         2026-05-30    │   0┤_/                                      │
│                                │    └──────────────────────────────────────  │
│  📍 [locator map]              │     1990     2000     2010     2020         │
├───────────────────────────────┴────────────────────────────────────────────┤
│  政策清单 Policies (214)  [sector ▾][instrument ▾][status ▾]      CSV ↓     │
│  • Renewable Energy Sources Act (EEG)   renewables · in force · 2000  [PDF]  │
│  • Fuel Emissions Trading Act (BEHG)    carbon price · in force · 2019 [PDF] │
│  • Buildings Energy Act (GEG)           buildings  · in force · 2020  [PDF]  │
│  ...                                                          [更多 More]    │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Mode 9 — Data & Transparency (credibility / reproducibility surface)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  数据与透明度 / Data & Transparency                                          │
├────────────────────────────────────────────────────────────────────────────┤
│  采集运行 Harvest runs (latest per source)                                   │
│  Source            Fetched  Upserted  New  Err  Last run          Status     │
│  CPDB                6,727    6,727    12    0   2026-06-04 03:11  ✓          │
│  OECD CAPMF        48,910   48,910     0    0   2026-06-01 04:02  ✓          │
│  Climate Watch      9,330    9,201     8    1   2026-06-04 03:14  ⚠ partial  │
│  CPR/CCLW          29,540   29,540   104    0   2026-06-03 03:40  ✓          │
│  World Bank           312      312     0    0   2026-05-01 04:00  ✓          │
│  Net Zero Tracker   4,190    4,190    21    0   2026-06-04 03:20  ✓          │
│  UNFCCC (real-time)   734      731     3    0   2026-06-04 09:00  ✓          │
│ ─────────────────────────────────────────────────────────────────────────── │
│  许可与引用 License & citation        批量下载 Bulk download                 │
│  CPDB        CC-BY-4.0  [cite]        [全部 All CSV ↓]  [JSON ↓]             │
│  OECD CAPMF  OECD attr. [cite]        每行含 source + retrieved_at + license  │
│  CPR/CCLW    CC-BY-4.0  [cite]        数据字典 Data dictionary [→]            │
│  ...                                                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Notes
- **Insights layer** (not a standalone mode) reuses the Mode 2/3/4 charts with editorial annotation + a short
  bilingual explainer — e.g. an annotated version of the Mode 3 growth curve titled "The exponential rise of
  climate law."
- Modes 1, 2, 5, 9 are the **MVP**; 3, 4, 6, 8 follow; 7 + Insights last (per `PLAN.md` §9).
- These are layout sketches, not visual design — palette, type, and spacing follow the `pmonitor` house style.
