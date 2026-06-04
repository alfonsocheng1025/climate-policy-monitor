-- ============================================================================
-- Performance: materialized views for the dashboard.
-- Turns per-request 673k-row scans into reads of tiny precomputed tables.
-- Run ONCE in Supabase (creates + populates immediately). load_to_db.py REFRESHes
-- them after each ingest, so they stay current. Safe to re-run.
-- ============================================================================

-- Helps the stringency aggregates + any metric_name LIKE 'prefix%' lookup.
CREATE INDEX IF NOT EXISTS idx_rec_metric_name ON records (metric_name);

-- Per-country map metrics (coverage = laws/policies only — meaningful + small).
DROP MATERIALIZED VIEW IF EXISTS mv_map_metrics;
CREATE MATERIALIZED VIEW mv_map_metrics AS
SELECT cov.country_iso, cov.coverage, s.stringency, p.price, n.netzero
FROM (SELECT country_iso, count(*)::int AS coverage FROM records
      WHERE country_iso IS NOT NULL AND record_type IN ('law','policy') GROUP BY 1) cov
LEFT JOIN (SELECT country_iso, round(avg(metric_value)::numeric, 2) AS stringency FROM records
      WHERE metric_name LIKE 'capmf_pol_stringency%' AND country_iso IS NOT NULL GROUP BY 1) s USING (country_iso)
LEFT JOIN (SELECT country_iso, max(metric_value) AS price FROM records
      WHERE metric_name='carbon_price' AND country_iso IS NOT NULL GROUP BY 1) p USING (country_iso)
LEFT JOIN (SELECT country_iso, min(metric_value) AS netzero FROM records
      WHERE record_type='net_zero' AND country_iso IS NOT NULL GROUP BY 1) n USING (country_iso);
CREATE UNIQUE INDEX IF NOT EXISTS mv_map_metrics_pk ON mv_map_metrics (country_iso);

-- Single-row dashboard KPIs.
DROP MATERIALIZED VIEW IF EXISTS mv_kpis;
CREATE MATERIALIZED VIEW mv_kpis AS
SELECT
  (SELECT count(*) FROM records WHERE record_type IN ('law','policy'))                       AS policies,
  (SELECT count(DISTINCT country_iso) FROM records WHERE country_iso IS NOT NULL)             AS countries,
  (SELECT count(*) FROM records WHERE record_type IN ('law','policy')
     AND left(decision_date,4) = to_char(now(),'YYYY'))                                      AS new_this_year,
  (SELECT round(avg(metric_value)::numeric,1) FROM records
     WHERE metric_name LIKE 'capmf_pol_stringency%')                                         AS avg_stringency,
  (SELECT count(*) FROM records WHERE record_type='net_zero')                                AS net_zero,
  (SELECT max(finished_at) FROM harvest_runs)                                                AS last_harvest;

-- Adoption-by-year (cumulative-growth chart).
DROP MATERIALIZED VIEW IF EXISTS mv_adoption;
CREATE MATERIALIZED VIEW mv_adoption AS
SELECT year, sum(n)::int AS n FROM agg_adoption_by_year WHERE year IS NOT NULL GROUP BY year;
CREATE UNIQUE INDEX IF NOT EXISTS mv_adoption_pk ON mv_adoption (year);
