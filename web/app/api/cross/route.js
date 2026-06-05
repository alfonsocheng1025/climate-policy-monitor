import { NextResponse } from 'next/server';
import { adoptionByYear } from '../../../lib/db';
import { papersByYear, newsByYear } from '../../../lib/crossdb';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [policy, papers, news] = await Promise.all([
      adoptionByYear(), papersByYear(), newsByYear(),
    ]);
    return NextResponse.json({ policy, papers, news }, { headers: CACHE });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), policy: [], papers: [], news: [] });
  }
}
