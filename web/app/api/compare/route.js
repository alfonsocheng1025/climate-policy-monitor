import { NextResponse } from 'next/server';
import { compareCountries } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const c = (new URL(req.url).searchParams.get('c') || '')
    .split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  try {
    return NextResponse.json(await compareCountries(c));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), countries: [], sectorCounts: [], stringency: [], netzero: [] });
  }
}
