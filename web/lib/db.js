import { sql } from '@vercel/postgres';

export async function queryPolicies({ country, sector, status, docType, limit = 500 }) {
  const where = [];
  const vals = [];
  let i = 1;
  if (country) { where.push(`country_iso = $${i++}`); vals.push(country); }
  if (sector)  { where.push(`sector = $${i++}`); vals.push(sector); }
  if (status)  { where.push(`status = $${i++}`); vals.push(status); }
  if (docType) { where.push(`doc_type = $${i++}`); vals.push(docType); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const q = `SELECT doc_id, country_iso, title, doc_type, sector,
             policy_instrument, status, decision_date, capmf_score, source_pdf_url
             FROM policies ${clause} LIMIT ${limit}`;
  const { rows } = await sql.query(q, vals);
  return rows;
}

export async function countByCountry() {
  const { rows } = await sql`SELECT country_iso, COUNT(*)::int AS n
    FROM policies GROUP BY country_iso`;
  return rows;
}

export async function fullTextSearch(term) {
  const { rows } = await sql`
    SELECT doc_id, country_iso, title, doc_type, source_pdf_url,
           ts_headline('simple', coalesce(full_text,''),
                       plainto_tsquery('simple', ${term})) AS snippet
    FROM policies
    WHERE to_tsvector('simple', coalesce(title,'')||' '||coalesce(full_text,''))
          @@ plainto_tsquery('simple', ${term})
    LIMIT 100`;
  return rows;
}
