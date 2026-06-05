import { NextResponse } from 'next/server';
import { diffusion } from '../../../lib/db';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await diffusion(), { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
