import { NextResponse } from 'next/server';
import { getKpis, adoptionByYear } from '../../../lib/db';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [kpis, adoption] = await Promise.all([getKpis(), adoptionByYear()]);
    return NextResponse.json({ kpis, adoption }, { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), kpis: null, adoption: [] });
  }
}
