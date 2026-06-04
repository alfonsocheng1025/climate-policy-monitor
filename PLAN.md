# Climate Policy Monitor — Build Plan

> A re-architecture plan for `climate-policy-platform`, recasting the original Perplexity scaffold as the
> **third "monitor"** in the [ZJU-CMIC Program on Climate and Science Communication](https://research.newsfindsme.com/),
> alongside the **Climate News Observatory** (`monitor.newsfindsme.com`) and **Climate Paper Monitor** (`pmonitor.newsfindsme.com`).
>
> Status: **planning / not yet built.** No production code has been changed against this plan. Sources verified June 2026.

---

## 1. Vision

A bilingual (中/EN) platform that **comprehensively, historically, and in near-real-time** harvests global
climate-related **policies, laws, commitments, and instruments**; normalizes them to one schema; stores them
in Supabase Postgres; and visualizes them on Vercel — built to the same house style as the program's existing
paper monitor (multi-source harvest, dedup + upsert, GitHub Actions cron, transparency dashboard, reproducible
exports with citations).

It is both a **research instrument** (rigorous, filterable, exportable, reproducible) and a
**science-communication artifact** (legible, narrative, public-facing) — because the program treats climate
knowledge as a *communication* problem, not only a data problem.

## 2. What we keep vs. replace from the scaffold

**Keep (the shape is right):** GitHub Actions cron → Postgres (Supabase) → Next.js/Vercel; upsert + dedup by
`doc_id`; versioned CSV snapshots in `data/`; the `ingest → normalize → load` pipeline split.

**Replace / add:**

| Area | Change |
|---|---|
| Sources | 3 → ~10 verified sources across 4 roles (see §3). Two of the original three were coded against access methods that don't exist (CPR has no API; `cpdb-api` is dead). |
| Real-time | Add a real-time detection layer (UNFCCC RSS + EUR-Lex notifications + daily NDC diff). The scaffold had none. |
| Schema | Add a `record_type` discriminator + generic metric columns + provenance/real-time fields (see §5). |
| UI | Bilingual (中/EN) + transparency dashboard + the visualization modes in §6 — the scaffold had a single dashboard + search. |
| Infra hygiene | Make it its own git repo + `.gitignore`; reconcile `DATABASE_URL` (ingest) vs `POSTGRES_URL` (web/`@vercel/postgres`); pin a Python **3.11/3.12** venv for ingest (3.14 wheel risk). |

## 3. Data source architecture (verified June 2026)

License column matters: this platform is treated as **academic / non-commercial** (confirm). Sources flagged ⚠️
have redistribution constraints.

### Tier A — Comprehensive / historical backbone (clean APIs/bulk, permissive license)
| Source | Contributes | Access | License | Effort |
|---|---|---|---|---|
| **CPDB** (NewClimate) | 6,727 structured policies, 42 economies; instrument/sector/status | Direct CSV export + Zenodo DOI | CC-BY-4.0 | Easy |
| **OECD CAPMF** | Policy **stringency 0–10**, 1990–2023, ~50 countries | SDMX REST (`format=csvfilewithlabels`) | OECD attrib. | Easy–Med (≈20 calls/hr) |
| **Climate Watch** (WRI) | NDCs + net-zero + LTS, 150+ indicators, ~171 countries | JSON REST `/api/v1/data/{dataset}` | CC-BY-4.0 | Easy |
| **Climate Policy Radar / CCLW** | ~12k–30k **full-text** laws & policies (deepest corpus) | Hugging Face Parquet (~3.6 GB) | CC-BY-4.0 | Easy–Med (lagged ~6 mo) |
| **World Bank Carbon Pricing** | Carbon taxes + ETS, national/subnational | Annual `.xlsx` (resolve dated URL) | CC-BY-4.0 | Easy |
| **Net Zero Tracker** | 4,190 net-zero pledges (country→city→company) | OWID CSV/JSON mirror | CC-BY | Easy |

### Tier B — Authoritative NDC + real-time signal
| Source | Role | Access |
|---|---|---|
| **openclimatedata/ndcs** | Daily-refreshed UNFCCC NDC Registry mirror; **diff to detect new submissions** | Raw GitHub CSV (public domain) |
| **UNFCCC NDC Registry RSS** | Real-time new/updated-NDC alert | `unfccc.int/NDCREG/rss.xml` (verify html/xml parsing) |
| **EUR-Lex** | Near-real-time EU climate **legislation**, filter by EuroVoc / directory 15.10 | SPARQL `publications.europa.eu/webapi/rdf/sparql` + Cellar notification RSS |

### Tier C — Optional expansion
- **Sabin Climate Litigation** (>3,000 cases) — whole-DB CSV export; verify reuse terms before storing full text/PDFs.
- **FAOLEX** — environmental legislation CSV (Environment & Ecosystems + Policies subsets). ⚠️ **CC-BY-NC-SA** (non-commercial).
- **pcet.cn** (China) — undocumented JSON `/list/data/{id}` + `/detail/{id}`; **ccchina.org.cn** HTML-scrape-only (ASP.NET). Relevant to the ZJU base; more fragile.

### Avoid / handle with care
- **IEA Policies DB** — endpoint works but license **forbids redistribution**; link out, do not re-serve. ⚠️
- **ECOLEX** (no API, murky rights → use FAOLEX), **ICAP** (no API → carbon pricing via World Bank), **`cpdb-api` pip** (dead → use CSV).

## 4. Harvest strategy — two cadences

There is **no single global feed for all new climate laws**, so we combine:

- **Bulk cron (weekly):** refresh Tier A + the openclimatedata mirror → normalize → upsert. Commit a dated CSV
  snapshot to `data/` for git-diff reproducibility.
- **Real-time cron (daily/hourly):** poll UNFCCC RSS + EUR-Lex Cellar notifications (filtered) + diff the daily
  openclimatedata CSV → write new/changed rows and stamp `first_seen_at` → power the "What's New" feed (§6, Mode 7).

Each run writes a row to a `harvest_runs` stats table (source, fetched, upserted, errors, started/finished, version)
so the transparency dashboard can show "X fetched, Y upserted, last update …" exactly like `pmonitor`.

## 5. Data model rethink

The single-shape `policies` table cannot cleanly hold laws + scores + NDCs + net-zero pledges + litigation.
Proposed core table (`records`):

- **Identity/provenance:** `doc_id` (PK, `source:id`), `source`, `license`, `source_url`, `retrieved_at`,
  `first_seen_at`, `last_updated_at`.
- **Discriminator:** `record_type` ∈ `{law, policy, ndc, net_zero, carbon_price, litigation, stringency_score}`.
- **Common facets:** `country_iso` (ISO-3), `subnational`, `title`, `title_en`, `sector`, `policy_instrument`,
  `status`, `decision_date`, `submission_date`, `version`, `concepts` (JSONB), `full_text`, `source_pdf_url`.
- **Generic quantitative slot** (replaces the single `capmf_score`): `metric_name`, `metric_value`,
  `metric_unit`, `metric_year` — holds CAPMF stringency, carbon price, coverage %, etc., so multiple numeric
  series coexist without schema churn.
- **Search:** keep the `to_tsvector('simple', …)` GIN index (multilingual-safe). Add per-facet btree indexes.
- Optionally pre-compute aggregate tables/materialized views (e.g. `agg_country_metric`, `agg_adoption_by_year`)
  so the web layer reads cheap, pre-aggregated rows instead of scanning.

Keep `source` + `retrieved_at` on every row (reproducibility is non-negotiable for the research mission).

## 6. Visualization plan & modes  ⭐

> 📐 Low-fidelity ASCII wireframes for these modes are in [`WIREFRAMES.md`](./WIREFRAMES.md).

The platform is organized as a small set of **modes** (top-level navigation), each answering a different
question about the data. The design tension to resolve deliberately: this is **both** an analyst's dashboard
**and** a communicator's storytelling surface. The resolution is a **hybrid** — an analytical core plus a
curated "Insights" layer that annotates the same charts for public legibility.

### Design principles (apply to every mode)
- **Bilingual 中/EN** labels, legends, and tooltips throughout (house style).
- **Provenance on every view:** source badge, license, and `last-updated` timestamp visible; nothing appears
  without attribution.
- **Reproducible by default:** every chart exports **PNG/SVG**, and its underlying slice downloads as **CSV/JSON**
  with an **auto-generated citation** + `retrieved_at`. (This is the research differentiator.)
- **Colorblind-safe, sequential/diverging palettes** chosen per encoding (critical for choropleths and heatmaps);
  never red/green alone for status.
- **Server-side aggregation:** charts read pre-aggregated API responses (or materialized views), not raw rows, so
  the heterogeneous/large corpus stays fast. Maps use TopoJSON; heavy text stays server-side.
- **Honest encodings:** counts ≠ stringency ≠ ambition. Each metric is labeled with what it does and does **not**
  mean (e.g. "policy count is coverage, not effectiveness"). Show data gaps explicitly (grey "no data", never 0).
- **Accessible + responsive:** keyboard navigation, alt text / data-table fallback for each chart, mobile layouts.

### The modes

**Mode 1 — Overview / Dashboard (landing).**
KPI strip (total policies, countries covered, laws this year, avg. stringency, net-zero pledges, last harvest),
a global choropleth, a compact "climate-law growth" sparkline, and a "What's New" preview. The 30-second
orientation, mirroring the paper monitor's landing.

**Mode 2 — Map.** Choropleth with a **metric toggle**: policy *coverage* (count), CAPMF *stringency*, *carbon
price* level, *net-zero status* (categorical), or *NDC status*. Filters (sector / instrument / status / year /
record_type) recolor live. Click a country → its profile (Mode 8). Stretch: a **subnational** layer for carbon
pricing (state/province ETS) and a **bivariate** map (e.g. emissions × stringency).

**Mode 3 — Trends / Timeline.** The temporal lens:
- **Climate-law growth curve** — cumulative laws/policies adopted globally over time (the canonical
  momentum chart; the single most communicative view).
- **Adoption waves** — stacked area of new policies per year by sector or instrument.
- **Stringency trajectories** — multi-line CAPMF 1990–2023 for selected countries, with policy-area facets.
- **Target milestones** — net-zero target years and NDC submission/ratchet markers on a time axis.

**Mode 4 — Compare.** The analytical workhorse: pick N countries →
- a **country × policy-area stringency heatmap** (dense CAPMF matrix; the researcher's favorite),
- **instrument-mix** small multiples (what policy tools each country relies on),
- side-by-side **targets** (net-zero year, NDC ambition), and
- **gap analysis** — sectors/instruments a country lacks relative to peers.

**Mode 5 — Search / Corpus.** Faceted full-text search over the document corpus (Postgres FTS with
`ts_headline` snippets), facets = country / sector / instrument / status / source / concept; result cards with
source badge + original-PDF link; concept tag-cloud and concept-trend-over-time as corpus overviews.

**Mode 6 — Composition.** "What kind of policy" — a **sector → instrument** treemap/sunburst (or Sankey), status
donut, and instrument distribution. Good for both analysis and explainer graphics.

**Mode 7 — What's New / Live.** The signature **monitor** feature: a reverse-chronological feed of newly
detected policies/laws/NDC updates (driven by §4's real-time cron + `first_seen_at`), with source, country, and a
"🆕 new" badge — the policy analogue of the news observatory's breaking-news stream. Optional weekly digest view.

**Mode 8 — Country Profile (drill-down).** A synthesized per-country page: locator map, stringency trajectory,
policy list, NDC + net-zero + carbon-price status cards, recent activity, and one-click export of that country's
full record set with citation.

**Mode 9 — Data & Transparency.** Harvest stats from `harvest_runs` ("X fetched, Y upserted, last update …" per
source), the data dictionary, per-source license + coverage notes, and **bulk download** (CSV/JSON) — the
reproducibility/credibility surface that matches the paper monitor's transparency ethos.

**Insights layer (cross-cutting).** A curated set of annotated, narrative charts (e.g. "The exponential rise of
climate law," "Where stringency and emissions diverge," "Who has put net-zero into law") — the
science-communication output that distinguishes this from a generic dashboard. Each Insight reuses a Mode chart
with editorial annotation + a short bilingual explainer.

### Candidate "signature" visualizations (highest communicative payoff)
1. Climate-law cumulative growth curve (Mode 3) — instantly legible policy momentum.
2. Country × policy-area stringency heatmap (Mode 4) — dense comparative researcher view.
3. Metric-toggle choropleth (Mode 2) — the universal entry point.
4. Net-zero target-year beeswarm/dot plot (Mode 3) — ambition at a glance across entity types.
5. "What's New" live feed (Mode 7) — the defining monitor behavior.
6. Sector → instrument Sankey/treemap (Mode 6) — compositional explainer.
7. (Experimental) CPR concept co-occurrence network — communication-friendly knowledge-graph view.

## 7. Tech stack decisions

- **Web:** Next.js 14 App Router on Vercel (keep). **Charts:** start with **Recharts** for standard charts;
  adopt **Observable Plot** (or visx/D3) for the heatmap, beeswarm, small multiples, and Sankey where Recharts is
  awkward; **react-simple-maps** + TopoJSON for choropleths (escalate to a vector-tile lib only if subnational
  detail demands it); a force-graph lib for the optional concept network.
- **DB:** Supabase Postgres (you have it). Use `@vercel/postgres`/`pg` from the web layer; **`POSTGRES_URL`** in
  web env, **`DATABASE_URL`** in ingest — document both. Consider Supabase full-text or `pgvector` later for
  semantic search over `full_text`.
- **Ingest:** Python 3.11/3.12 venv; `pandas` + `requests` + `pyarrow` (for CPR Parquet) + `psycopg2-binary`.
- **i18n:** lightweight dictionary-based 中/EN toggle (match `pmonitor`'s approach).

## 8. Licensing & reproducibility

- Default posture **academic / non-commercial** (confirm). Store `license` per row; show it in the UI.
- **CC-BY** sources (CPDB, OECD, Climate Watch, CPR/CCLW, World Bank, Net Zero Tracker) → fine to display +
  redistribute **with attribution**; render the required citation in Mode 9 and on export.
- **FAOLEX** is CC-BY-**NC**-SA → only include if the NC posture holds. **IEA** → link out, don't re-serve.
- Every export carries source + `retrieved_at` + citation; weekly CSV snapshots are git-versioned.

## 9. Roadmap

1. **Foundation** — make it its own repo + `.gitignore`; provision Supabase + run schema; reconcile env vars; pin Python venv.
2. **Core harvesters (Tier A)** — CPDB, OECD CAPMF, Climate Watch, CPR (HF Parquet), World Bank, Net Zero Tracker → normalize → upsert + `harvest_runs`.
3. **Real-time layer (Tier B)** — UNFCCC RSS + EUR-Lex notifications + daily NDC diff → `first_seen_at`.
4. **Web MVP** — Modes 1, 2, 5, 9 (Overview, Map, Search, Transparency) bilingual.
5. **Analytical modes** — 3, 4, 6, 8 (Trends, Compare, Composition, Country profiles) + exports.
6. **Live + Insights** — Mode 7 feed and the curated Insights layer.
7. **Deploy** — Vercel + wire GitHub Actions cron (both cadences) + repo Secrets.
8. **Stretch** — China sources (Tier C), litigation, semantic search (`pgvector`), subnational maps, concept network.

## 10. Open decisions (for confirmation)

- **MVP source scope:** Tier A first, then add Tier B real-time? (recommended)
- **China sources** (pcet.cn / ccchina) in MVP or later? (more fragile)
- **Licensing posture:** academic / non-commercial assumed → governs FAOLEX + IEA handling.
- **Primary mode emphasis:** lean analyst-dashboard, communicator-narrative, or the hybrid above? (hybrid recommended)
