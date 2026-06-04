-- Unified schema for the Climate Policy Monitor (see PLAN.md §5).
-- One heterogeneous `records` table discriminated by `record_type`, a `harvest_runs`
-- transparency table, and convenience aggregate views for the web layer.

CREATE TABLE IF NOT EXISTS records (
    doc_id            TEXT PRIMARY KEY,        -- source-prefixed, e.g. 'cpdb:123'
    record_type       TEXT NOT NULL,           -- law|policy|ndc|net_zero|carbon_price|litigation|stringency_score
    country_iso       TEXT,                    -- ISO-3 (fusion key)
    subnational       TEXT,                    -- state/province/city, if any
    title             TEXT,
    title_en          TEXT,
    sector            TEXT,
    policy_instrument TEXT,
    status            TEXT,
    decision_date     TEXT,
    submission_date   TEXT,
    version           TEXT,
    metric_name       TEXT,                    -- e.g. 'capmf_stringency', 'carbon_price'
    metric_value      DOUBLE PRECISION,
    metric_unit       TEXT,
    metric_year       INTEGER,
    concepts          JSONB,
    full_text         TEXT,
    source_url        TEXT,
    source_pdf_url    TEXT,
    source            TEXT,                    -- 'CPDB', 'OECD CAPMF', ...
    license           TEXT,
    retrieved_at      TIMESTAMPTZ,
    first_seen_at     TIMESTAMPTZ DEFAULT now(),
    last_updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rec_country ON records(country_iso);
CREATE INDEX IF NOT EXISTS idx_rec_type    ON records(record_type);
CREATE INDEX IF NOT EXISTS idx_rec_sector  ON records(sector);
CREATE INDEX IF NOT EXISTS idx_rec_status  ON records(status);
CREATE INDEX IF NOT EXISTS idx_rec_source  ON records(source);
CREATE INDEX IF NOT EXISTS idx_rec_metric  ON records(country_iso, metric_name, metric_year);
CREATE INDEX IF NOT EXISTS idx_rec_seen    ON records(first_seen_at DESC);

-- Multilingual-safe full-text index (no stemming) over title(s) + full_text.
CREATE INDEX IF NOT EXISTS idx_rec_fts ON records USING gin(
    to_tsvector('simple',
        coalesce(title,'') || ' ' || coalesce(title_en,'') || ' ' || coalesce(full_text,''))
);

-- Per-run harvest transparency (powers the Mode 9 dashboard).
CREATE TABLE IF NOT EXISTS harvest_runs (
    id          BIGSERIAL PRIMARY KEY,
    source      TEXT NOT NULL,
    fetched     INTEGER,
    upserted    INTEGER,
    new_records INTEGER,
    errors      INTEGER DEFAULT 0,
    status      TEXT,                          -- ok|partial|error
    version     TEXT,
    message     TEXT,
    started_at  TIMESTAMPTZ,
    finished_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_runs_source ON harvest_runs(source, finished_at DESC);

-- Convenience aggregates (web reads cheap pre-aggregated rows; refresh implicitly as views).
CREATE OR REPLACE VIEW agg_country_record AS
    SELECT country_iso, record_type, COUNT(*)::int AS n
    FROM records WHERE country_iso IS NOT NULL
    GROUP BY country_iso, record_type;

CREATE OR REPLACE VIEW agg_adoption_by_year AS
    SELECT substring(decision_date from '\d{4}') AS year, sector, COUNT(*)::int AS n
    FROM records
    WHERE record_type IN ('law','policy') AND decision_date ~ '\d{4}'
    GROUP BY 1, 2;

CREATE OR REPLACE VIEW agg_latest_metric AS
    SELECT DISTINCT ON (country_iso, metric_name)
           country_iso, metric_name, metric_value, metric_unit, metric_year
    FROM records
    WHERE metric_value IS NOT NULL AND country_iso IS NOT NULL
    ORDER BY country_iso, metric_name, metric_year DESC NULLS LAST;
