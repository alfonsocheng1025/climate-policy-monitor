# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Direction:** This repo is being re-architected as the "Climate Policy Monitor" (3rd sibling to the
> `newsfindsme.com` news/paper monitors). The forward-looking plan — broadened data sources, schema, and the
> visualization design/modes — lives in [`PLAN.md`](./PLAN.md). The sections below document the **current
> scaffold's** code as it exists today.

## What this is

A global climate-policy aggregation and visualization platform with three parts that share one Postgres table:

- **`ingest/`** — Python scripts that pull from three external sources, normalize to one schema, and upsert to Postgres.
- **`db/schema.sql`** — the single `policies` table all layers read/write.
- **`web/`** — a Next.js 14 (App Router) app deployed on Vercel that queries Postgres and renders a map + table + full-text search.

GitHub Actions (`.github/workflows/ingest.yml`) runs the ingest pipeline on a cron and commits CSV snapshots back to the repo.

## Commands

### Ingest (Python 3.11)
Run scripts in this order — `normalize.py` consumes the raw CSVs the `fetch_*` scripts produce, and `load_to_db.py` consumes `normalize.py`'s output. Scripts resolve paths via `__file__`, so they work from any cwd.
```bash
cd ingest
pip install -r requirements.txt
python fetch_cpdb.py          # -> data/cpdb_raw.csv
python fetch_oecd_capmf.py    # -> data/oecd_capmf_raw.csv  (needs a real OECD URL, see below)
python fetch_cpr.py           # -> data/cpr_documents.csv   (no-op unless CPR_DATASET_URL is set)
python normalize.py           # merges all raw CSVs -> data/policies_normalized.csv
python load_to_db.py          # upserts into Postgres (requires DATABASE_URL)
```

### Web (Next.js)
```bash
cd web
npm install
npm run dev      # local dev server
npm run build    # production build (also Vercel's build command)
npm start        # serve production build
```

There are **no tests and no linter configured** in this repo — don't invent `npm test`/`pytest` commands.

## Architecture & data flow

```
fetch_cpdb.py ─┐
fetch_cpr.py ──┼─> data/*_raw.csv ─> normalize.py ─> data/policies_normalized.csv ─> load_to_db.py ─> Postgres ─> web/ (API routes ─> components)
fetch_oecd ────┘
```

**Three-source fusion model.** Each source contributes different columns of the unified `policies` row (see `docs/data_dictionary.csv` for the field→source map):
- **CPDB** (NewClimate, via `cpdb-api` pip package) → structured fields: sector, instrument, status, decision_date.
- **CPR** (Climate Policy Radar) → full text, knowledge-graph `concepts`, and `source_pdf_url`.
- **OECD CAPMF** (SDMX REST API) → quantitative `capmf_score`.

**`doc_id` is the source-prefixed primary key** (`cpdb:<id>`, `cpr:<id>`). This is how `load_to_db.py`'s `ON CONFLICT (doc_id) DO UPDATE` upsert keeps rows stable across re-ingests.

**CAPMF scores are country-level averages, not per-policy.** `normalize.py` computes `mean(OBS_VALUE)` grouped by `REF_AREA` and maps it onto every row by `country_iso`. The same score appears on all of a country's policies — do not treat `capmf_score` as policy-specific.

**Full-text search uses the `'simple'` Postgres config** (no stemming) deliberately, because content is multilingual (English + Chinese). It lives in `web/lib/db.js::fullTextSearch`, backed by the `idx_fts` GIN index in `schema.sql`, and returns `ts_headline` snippets that the search page renders via `dangerouslySetInnerHTML`.

**The web layer reads only from Postgres**, never from the CSV snapshots. Two API routes wrap `web/lib/db.js`:
- `GET /api/policies` — filtered list (`country`/`sector`/`status`/`docType`); `?agg=country` returns per-country counts for the choropleth map.
- `GET /api/search?q=` — full-text search.

## Things to keep in sync

These four places define the same column set; changing one usually means changing all of them:
1. `db/schema.sql` (table DDL)
2. `ingest/normalize.py` `COLUMNS`
3. `ingest/load_to_db.py` `COLS`
4. `docs/data_dictionary.csv`

`web/lib/db.js` `SELECT`s a subset — update its queries if you rename/remove a column it uses.

## Gotchas

- **The git repo root is the parent `Downloads/` folder, not `climate-policy-platform/`.** `git status` will be flooded with hundreds of unrelated files. Scope every `git add` explicitly (the CI workflow does `git add data/*.csv`) — never `git add -A` / `git add .`.
- **Two different DB env-var names.** Ingest reads `DATABASE_URL` (`load_to_db.py`). The web layer uses `@vercel/postgres`, which reads `POSTGRES_URL` (auto-injected on Vercel). `.env.example` only documents `DATABASE_URL`; for local web dev you must set `POSTGRES_URL`.
- **Placeholders that need real values before ingest works:**
  - `fetch_oecd_capmf.py` `CAPMF_URL` is a template — replace it with the real URL from OECD Data Explorer → Developer API (the API caps at 20 downloads/hour).
  - `fetch_cpr.py` does nothing unless `CPR_DATASET_URL` points at a CPR open-data release.
- **`normalize.py` column mappings are defensive** (`r.get(a, r.get(b, ""))`) because the real upstream CSV column names vary by release; the CAPMF join branch (`REF_AREA`/`OBS_VALUE`) is illustrative and may need adjusting to the actual SDMX output.
- The CI ingest steps for OECD and CPR are allowed to fail (`|| echo "skipped"`); CPDB, normalize, and load are not.
