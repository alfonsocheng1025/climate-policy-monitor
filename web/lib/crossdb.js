import postgres from 'postgres';

// Lazy postgres.js clients for the OTHER two monitors' Supabase DBs (separate projects,
// possibly separate orgs — each is just a pooler connection string). Set on Vercel as
// PAPERS_DATABASE_URL (pmonitor) and NEWS_DATABASE_URL (monitor). Missing env -> [].
function client(url, key) {
  if (!url) return null;
  if (!globalThis[key]) {
    globalThis[key] = postgres(url, { prepare: false, ssl: 'require', max: 2, idle_timeout: 20, connect_timeout: 15 });
  }
  return globalThis[key];
}

export async function papersByYear() {
  const sql = client(process.env.PAPERS_DATABASE_URL, '__papersSql');
  if (!sql) return [];
  try {
    return await sql`
      SELECT extract(year from publication_date)::int AS year, sum(paper_count)::int AS n
      FROM daily_paper_counts WHERE publication_date IS NOT NULL
      GROUP BY 1 ORDER BY 1`;
  } catch (e) {
    return [];
  }
}

export async function newsByYear() {
  const sql = client(process.env.NEWS_DATABASE_URL, '__newsSql');
  if (!sql) return [];
  try {
    return await sql`
      SELECT extract(year from published_at)::int AS year, count(*)::int AS n
      FROM climate.articles
      WHERE published_at IS NOT NULL AND published_at >= '2015-01-01'
      GROUP BY 1 ORDER BY 1`;
  } catch (e) {
    return [];
  }
}
