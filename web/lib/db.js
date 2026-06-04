import { sql } from '@vercel/postgres';

// Allowed map metrics (guards the dynamic branch below).
const METRICS = new Set(['coverage', 'stringency', 'price', 'netzero']);

export async function getKpis() {
  const { rows } = await sql`
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
  const { rows } = await sql`
    SELECT year, sum(n)::int AS n FROM agg_adoption_by_year
    WHERE year IS NOT NULL GROUP BY year ORDER BY year`;
  return rows;
}

export async function mapMetric(metric) {
  if (!METRICS.has(metric)) metric = 'coverage';
  if (metric === 'stringency') {
    const { rows } = await sql`SELECT country_iso, round(avg(metric_value)::numeric, 2) AS value
      FROM records WHERE metric_name LIKE 'capmf_pol_stringency%' AND country_iso IS NOT NULL
      GROUP BY country_iso`;
    return rows;
  }
  if (metric === 'price') {
    const { rows } = await sql`SELECT country_iso, max(metric_value) AS value
      FROM records WHERE metric_name='carbon_price' AND country_iso IS NOT NULL GROUP BY country_iso`;
    return rows;
  }
  if (metric === 'netzero') {
    const { rows } = await sql`SELECT country_iso, min(metric_value) AS value
      FROM records WHERE record_type='net_zero' AND country_iso IS NOT NULL GROUP BY country_iso`;
    return rows;
  }
  const { rows } = await sql`SELECT country_iso, count(*)::int AS value
    FROM records WHERE country_iso IS NOT NULL GROUP BY country_iso`;
  return rows;
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
  const { rows } = await sql.query(q, vals);
  return rows;
}

export async function fullTextSearch(term) {
  const { rows } = await sql`
    SELECT doc_id, record_type, country_iso, title, source, source_pdf_url, source_url,
           ts_headline('simple', coalesce(full_text, coalesce(title,'')),
                       plainto_tsquery('simple', ${term})) AS snippet
    FROM records
    WHERE to_tsvector('simple',
            coalesce(title,'') || ' ' || coalesce(title_en,'') || ' ' || coalesce(full_text,''))
          @@ plainto_tsquery('simple', ${term})
    LIMIT 100`;
  return rows;
}

export async function whatsNew(limit = 30) {
  const lim = Math.min(Number(limit) || 30, 100);
  const { rows } = await sql.query(
    `SELECT doc_id, record_type, country_iso, title, source, source_pdf_url, source_url,
            first_seen_at, decision_date
     FROM records ORDER BY first_seen_at DESC NULLS LAST LIMIT $1`, [lim]);
  return rows;
}

export async function harvestRuns() {
  const { rows } = await sql`
    SELECT DISTINCT ON (source) source, fetched, upserted, new_records, errors, status, finished_at
    FROM harvest_runs ORDER BY source, finished_at DESC`;
  return rows;
}
