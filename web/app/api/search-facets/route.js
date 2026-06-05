import { NextResponse } from 'next/server';
import { searchFacets } from '../../../lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export async function GET() {
  try {
    const d = await searchFacets();
    return NextResponse.json(d, {
      headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400' },
    });
  } catch (e) {
    return NextResponse.json({ types: [], sources: [], error: String(e?.message || e) });
  }
}
