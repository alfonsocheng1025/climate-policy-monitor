import postgres from 'postgres';

// postgres.js client for Supabase. Works with the Transaction Pooler (:6543) — which
// REQUIRES prepare:false — and the Session Pooler (:5432). Supabase requires SSL.
// (We moved off @vercel/postgres, which is Neon-only and cannot reach Supabase.)
const sql = globalThis.__cpmSql || postgres(process.env.POSTGRES_URL || '', {
  prepare: false,
  ssl: 'require',
  max: 3,
  idle_timeout: 20,
  connect_timeout: 15,
});
globalThis.__cpmSql = sql;

// Cap a DB call so build-time static generation can never hang (the Vercel build
// sandbox may not reach Supabase). On timeout the caller's try/catch falls back to
// empty data; ISR + the client self-heal then fill it in at runtime, where the DB
// is reachable.
export function withTimeout(promise, ms = 12000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const id = setTimeout(() => reject(new Error('db timeout')), ms);
      if (id && id.unref) id.unref();
    }),
  ]);
}

const METRICS = new Set(['coverage', 'stringency', 'price', 'netzero']);

// Dashboard reads precomputed materialized views (db/perf.sql) — fast, refreshed on ingest.
export async function getKpis() {
  const rows = await sql`SELECT * FROM mv_kpis`;
  return rows[0];
}

export async function adoptionByYear() {
  return await sql`SELECT year, n FROM mv_adoption ORDER BY year`;
}

export async function mapMetric(metric) {
  const col = METRICS.has(metric) ? metric : 'coverage';
  // col is from the fixed METRICS set, not user free-text.
  return await sql.unsafe(
    `SELECT country_iso, ${col} AS value FROM mv_map_metrics WHERE ${col} IS NOT NULL`);
}

export async function queryRecords({ country, sector, status, recordType, limit = 200 }) {
  const where = [];
  const vals = [];
  let i = 1;
  if (country)    { where.push(`country_iso = $${i++}`); vals.push(country); }
  if (sector)     { where.push(`sector = $${i++}`);      vals.push(sector); }
  if (status)     { where.push(`status = $${i++}`);      vals.push(status); }
  if (recordType) { where.push(`record_type = $${i++}`); vals.push(recordType); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const lim = Math.min(Number(limit) || 200, 1000);
  const q = `SELECT doc_id, record_type, country_iso, title, sector, policy_instrument,
             status, decision_date, metric_name, metric_value, metric_unit, source,
             source_pdf_url, source_url
             FROM records ${clause} ORDER BY last_updated_at DESC NULLS LAST LIMIT ${lim}`;
  return await sql.unsafe(q, vals);
}

export async function fullTextSearch(term, opts = {}) {
  const { country, type, source } = opts;
  return await sql`
    SELECT doc_id, record_type, country_iso, title, source, source_pdf_url, source_url,
           ts_headline('simple', coalesce(full_text, coalesce(title,'')),
                       plainto_tsquery('simple', ${term})) AS snippet
    FROM records
    WHERE to_tsvector('simple',
            coalesce(title,'') || ' ' || coalesce(title_en,'') || ' ' || coalesce(full_text,''))
          @@ plainto_tsquery('simple', ${term})
      ${country ? sql`AND country_iso = ${country}` : sql``}
      ${type ? sql`AND record_type = ${type}` : sql``}
      ${source ? sql`AND source = ${source}` : sql``}
    LIMIT 100`;
}

export async function searchFacets() {
  const [types, sources] = await Promise.all([
    sql`SELECT record_type, count(*)::int AS n FROM records GROUP BY record_type ORDER BY n DESC`,
    sql`SELECT source, count(*)::int AS n FROM records GROUP BY source ORDER BY n DESC`,
  ]);
  return { types, sources };
}

export async function whatsNew(limit = 30) {
  const lim = Math.min(Number(limit) || 30, 100);
  // `WHERE first_seen_at IS NOT NULL` + plain DESC lets the planner use
  // idx_rec_seen (first_seen_at DESC) for a LIMIT scan, instead of sorting all
  // ~673k rows (which `NULLS LAST` forced, since the index is NULLS FIRST).
  return await sql.unsafe(
    `SELECT doc_id, record_type, country_iso, title, source, source_pdf_url, source_url,
            first_seen_at, decision_date
     FROM records WHERE first_seen_at IS NOT NULL
     ORDER BY first_seen_at DESC LIMIT $1`, [lim]);
}

export async function harvestRuns() {
  return await sql`
    SELECT DISTINCT ON (source) source, fetched, upserted, new_records, errors, status, finished_at
    FROM harvest_runs ORDER BY source, finished_at DESC`;
}

export async function trends() {
  const adoption = await sql`SELECT year, sum(n)::int AS n FROM agg_adoption_by_year
    WHERE year IS NOT NULL GROUP BY year ORDER BY year`;
  const stringency = await sql`SELECT metric_year AS year, round(avg(metric_value)::numeric, 2) AS v
    FROM records WHERE metric_name LIKE 'capmf_pol_stringency%' AND metric_year IS NOT NULL
    GROUP BY metric_year ORDER BY metric_year`;
  return { adoption, stringency };
}

export async function composition() {
  const byCol = async (col, lim) => await sql.unsafe(
    `SELECT ${col} AS k, count(*)::int AS n FROM records WHERE ${col} IS NOT NULL
     GROUP BY ${col} ORDER BY n DESC LIMIT ${lim}`);  // col is a fixed literal, not user input
  const [sectors, instruments, statuses] = await Promise.all([
    byCol('sector', 20), byCol('policy_instrument', 20), byCol('status', 12),
  ]);
  const types = await sql`SELECT record_type AS k, count(*)::int AS n
    FROM records GROUP BY record_type ORDER BY n DESC`;
  return { sectors, instruments, types, statuses };
}

export async function compareCountries(isos) {
  const list = (isos || []).filter(Boolean).slice(0, 6);
  if (!list.length) return { countries: [], sectorCounts: [], stringency: [], netzero: [] };
  const sectorCounts = await sql.unsafe(
    `SELECT country_iso, sector, count(*)::int AS n FROM records
     WHERE country_iso = ANY($1) AND sector IS NOT NULL AND record_type IN ('law','policy')
     GROUP BY country_iso, sector`, [list]);
  const stringency = await sql.unsafe(
    `SELECT country_iso, round(avg(metric_value)::numeric, 2) AS v FROM records
     WHERE country_iso = ANY($1) AND metric_name LIKE 'capmf_pol_stringency%'
     GROUP BY country_iso`, [list]);
  const netzero = await sql.unsafe(
    `SELECT country_iso, min(metric_value)::int AS y FROM records
     WHERE country_iso = ANY($1) AND record_type = 'net_zero' GROUP BY country_iso`, [list]);
  return { countries: list, sectorCounts, stringency, netzero };
}

export async function countryProfile(iso) {
  const kpisRows = await sql.unsafe(
    `SELECT
       (SELECT count(*) FROM records WHERE country_iso=$1 AND record_type IN ('law','policy')) AS policies,
       (SELECT round(avg(metric_value)::numeric,1) FROM records WHERE country_iso=$1 AND metric_name LIKE 'capmf_pol_stringency%') AS avg_stringency,
       (SELECT min(metric_value)::int FROM records WHERE country_iso=$1 AND record_type='net_zero') AS net_zero_year,
       (SELECT max(metric_value) FROM records WHERE country_iso=$1 AND metric_name='carbon_price') AS carbon_price`,
    [iso]);
  const trajectory = await sql.unsafe(
    `SELECT metric_year AS year, round(avg(metric_value)::numeric, 2) AS v FROM records
     WHERE country_iso=$1 AND metric_name LIKE 'capmf_pol_stringency%' AND metric_year IS NOT NULL
     GROUP BY metric_year ORDER BY metric_year`, [iso]);
  const records = await sql.unsafe(
    `SELECT doc_id, record_type, title, sector, policy_instrument, status, decision_date,
            metric_name, metric_value, metric_unit, source, source_pdf_url, source_url
     FROM records WHERE country_iso=$1 ORDER BY last_updated_at DESC NULLS LAST LIMIT 300`, [iso]);
  return { iso, kpis: kpisRows[0], trajectory, records };
}

// ---- Fusion cross-analyses (over fact_* / v_* views from db/fusion.sql) ----

export async function diffusion() {
  return await sql`SELECT canon_instrument, year, cumulative_adopters
    FROM v_diffusion_curve WHERE year IS NOT NULL AND canon_instrument IS NOT NULL
    ORDER BY canon_instrument, year`;
}

export async function breadthDepth() {
  return await sql`
    SELECT p.country_iso, p.n::int AS policies, s.v AS stringency
    FROM (SELECT country_iso, count(*) AS n FROM records
          WHERE record_type IN ('law','policy') AND country_iso IS NOT NULL GROUP BY 1) p
    JOIN (SELECT country_iso, round(avg(metric_value)::numeric, 2) AS v FROM records
          WHERE metric_name LIKE 'capmf_pol_stringency%' GROUP BY 1) s
      ON s.country_iso = p.country_iso`;
}

export async function netzeroLadder() {
  return await sql`
    SELECT country_iso, title, target_year::int AS target_year, legal_force, legal_force_label
    FROM fact_commitment
    WHERE pledge_type='net_zero' AND target_year IS NOT NULL AND country_iso IS NOT NULL
    ORDER BY legal_force DESC, target_year`;
}

export async function lev2Heatmap(isos) {
  const list = (isos || []).filter(Boolean).slice(0, 8);
  if (!list.length) return [];
  return await sql.unsafe(
    `SELECT country_iso, title AS area, metric_value AS stringency
     FROM records
     WHERE source='OECD CAPMF' AND metric_name LIKE 'capmf_pol_stringency%'
       AND split_part(doc_id, ':', 3) ~ '^LEV2_'
       AND country_iso = ANY($1)
       AND metric_year = (SELECT max(metric_year) FROM records WHERE source='OECD CAPMF')`,
    [list]);
}

// Promise × Action: net-zero pledge strength (promise) vs CAPMF stringency (action).
export async function promiseAction() {
  return await sql`
    SELECT s.country_iso, s.v AS stringency, c.legal_force, c.target_year
    FROM (SELECT country_iso, round(avg(metric_value)::numeric, 2) AS v FROM records
          WHERE metric_name LIKE 'capmf_pol_stringency%' GROUP BY 1) s
    JOIN (SELECT country_iso, max(legal_force) AS legal_force, min(target_year)::int AS target_year
          FROM fact_commitment WHERE pledge_type='net_zero' AND country_iso IS NOT NULL
            AND target_year IS NOT NULL GROUP BY 1) c ON c.country_iso = s.country_iso`;
}

// Bivariate map: per country coverage (policy count) + stringency (may be null).
export async function bivariate() {
  return await sql`
    SELECT c.country_iso, c.n::int AS coverage, s.v AS stringency
    FROM (SELECT country_iso, count(*) AS n FROM records
          WHERE country_iso IS NOT NULL AND record_type IN ('law','policy') GROUP BY 1) c
    LEFT JOIN (SELECT country_iso, round(avg(metric_value)::numeric, 2) AS v FROM records
          WHERE metric_name LIKE 'capmf_pol_stringency%' GROUP BY 1) s ON s.country_iso = c.country_iso`;
}

// Per-country instrument-family counts for the (transparent) policy-mix view.
export async function instrumentMix(isos) {
  const list = (isos || []).filter(Boolean).slice(0, 10);
  if (!list.length) return [];
  return await sql.unsafe(
    `SELECT country_iso, canon_instrument, count(*)::int AS n
     FROM v_records_canon
     WHERE canon_instrument IS NOT NULL AND record_type IN ('law','policy') AND country_iso = ANY($1)
     GROUP BY 1, 2`, [list]);
}
