import { NextResponse } from 'next/server';
import { composition } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await composition());
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), sectors: [], instruments: [], types: [], statuses: [] });
  }
}
