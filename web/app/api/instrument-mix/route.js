import { NextResponse } from 'next/server';
import { instrumentMix } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const c = (new URL(req.url).searchParams.get('c') || 'DEU,CHN,USA,JPN,GBR,FRA,IND,BRA')
    .split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  try {
    return NextResponse.json(await instrumentMix(c));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
