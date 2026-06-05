import { NextResponse } from 'next/server';
import { fullTextSearch } from '../../../lib/db';
import { CACHE_SHORT } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const q = p.get('q') || '';
  if (!q) return NextResponse.json([]);
  try {
    const rows = await fullTextSearch(q, {
      country: p.get('country') || null,
      type: p.get('type') || null,
      source: p.get('source') || null,
    });
    return NextResponse.json(rows, { headers: CACHE_SHORT });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
