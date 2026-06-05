import { NextResponse } from 'next/server';
import { trends } from '../../../lib/db';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await trends(), { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), adoption: [], stringency: [] });
  }
}
