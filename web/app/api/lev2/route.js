import { NextResponse } from 'next/server';
import { lev2Heatmap } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const c = (new URL(req.url).searchParams.get('c') || 'DEU,CHN,USA,JPN,GBR,FRA')
    .split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  try {
    return NextResponse.json(await lev2Heatmap(c));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
