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

const METRICS = new Set(['coverage', 'stringency', 'price', 'netzero']);

export async function getKpis() {
  const rows = await sql`
    SELECT
      (SELECT count(*) FROM records WHERE record_type IN ('law','policy'))                       AS policies,
      (SELECT count(DISTINCT country_iso) FROM records WHERE country_iso IS NOT NULL)             AS countries,
      (SELECT count(*) FROM records
         WHERE record_type IN ('law','policy')
           AND left(decision_date,4) = to_char(now(),'YYYY'))                                    AS new_this_year,
      (SELECT round(avg(metric_value)::numeric,1) FROM records
         WHERE metric_name LIKE 'capmf_pol_stringency%')                                         AS avg_stringency,
      (SELECT count(*) FROM records WHERE record_type='net_zero')                                AS net_zero,
      (SELECT max(finished_at) FROM harvest_runs)                                                AS last_harvest`;
  return rows[0];
}

export async function adoptionByYear() {
  return await sql`SELECT year, sum(n)::int AS n FROM agg_adoption_by_year
    WHERE year IS NOT NULL GROUP BY year ORDER BY year`;
}

export async function mapMetric(metric) {
  if (!METRICS.has(metric)) metric = 'coverage';
  if (metric === 'stringency') {
    return await sql`SELECT country_iso, round(avg(metric_value)::numeric, 2) AS value
      FROM records WHERE metric_name LIKE 'capmf_pol_stringency%' AND country_iso IS NOT NULL
      GROUP BY country_iso`;
  }
  if (metric === 'price') {
    return await sql`SELECT country_iso, max(metric_value) AS value
      FROM records WHERE metric_name='carbon_price' AND country_iso IS NOT NULL GROUP BY country_iso`;
  }
  if (metric === 'netzero') {
    return await sql`SELECT country_iso, min(metric_value) AS value
      FROM records WHERE record_type='net_zero' AND country_iso IS NOT NULL GROUP BY country_iso`;
  }
  return await sql`SELECT country_iso, count(*)::int AS value
    FROM records WHERE country_iso IS NOT NULL GROUP BY country_iso`;
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

export async function fullTextSearch(term) {
  return await sql`
    SELECT doc_id, record_type, country_iso, title, source, source_pdf_url, source_url,
           ts_headline('simple', coalesce(full_text, coalesce(title,'')),
                       plainto_tsquery('simple', ${term})) AS snippet
    FROM records
    WHERE to_tsvector('simple',
            coalesce(title,'') || ' ' || coalesce(title_en,'') || ' ' || coalesce(full_text,''))
          @@ plainto_tsquery('simple', ${term})
    LIMIT 100`;
}

export async function whatsNew(limit = 30) {
  const lim = Math.min(Number(limit) || 30, 100);
  return await sql.unsafe(
    `SELECT doc_id, record_type, country_iso, title, source, source_pdf_url, source_url,
            first_seen_at, decision_date
     FROM records ORDER BY first_seen_at DESC NULLS LAST LIMIT $1`, [lim]);
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
