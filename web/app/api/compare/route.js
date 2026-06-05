import { NextResponse } from 'next/server';
import { compareCountries } from '../../../lib/db';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const c = (new URL(req.url).searchParams.get('c') || '')
    .split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  try {
    return NextResponse.json(await compareCountries(c), { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), countries: [], sectorCounts: [], stringency: [], netzero: [] });
  }
}
