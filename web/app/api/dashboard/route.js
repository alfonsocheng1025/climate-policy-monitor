import { NextResponse } from 'next/server';
import { getKpis, adoptionByYear, mapMetric, whatsNew } from '../../../lib/db';

// One request for the whole dashboard (fewer round-trips/cold starts than 3 calls).
// Data updates monthly, so cache: browser 5 min, CDN 30 min, serve-stale up to a day.
const CACHE = { 'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400' };

export async function GET(req) {
  new URL(req.url); // touch the request so this runs per-request (not at build time)
  try {
    const [kpis, adoption, map, news] = await Promise.all([
      getKpis(), adoptionByYear(), mapMetric('coverage'), whatsNew(8),
    ]);
    return NextResponse.json({ kpis, adoption, map, news }, { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), kpis: null, adoption: [], map: [], news: [] });
  }
}
