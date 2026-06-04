import { NextResponse } from 'next/server';
import { harvestRuns } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await harvestRuns());
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
