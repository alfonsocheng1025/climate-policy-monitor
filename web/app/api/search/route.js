import { NextResponse } from 'next/server';
import { fullTextSearch } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const q = p.get('q') || '';
  if (!q) return NextResponse.json([]);
  try {
    return NextResponse.json(await fullTextSearch(q, {
      country: p.get('country') || null,
      type: p.get('type') || null,
      source: p.get('source') || null,
    }));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
