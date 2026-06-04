import { NextResponse } from 'next/server';
import { breadthDepth, netzeroLadder } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [bd, nz] = await Promise.all([breadthDepth(), netzeroLadder()]);
    return NextResponse.json({ breadthDepth: bd, netzero: nz });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), breadthDepth: [], netzero: [] });
  }
}
