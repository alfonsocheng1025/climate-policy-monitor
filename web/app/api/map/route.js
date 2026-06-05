import { NextResponse } from 'next/server';
import { mapMetric } from '../../../lib/db';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const metric = new URL(req.url).searchParams.get('metric') || 'coverage';
  try {
    return NextResponse.json(await mapMetric(metric), { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
