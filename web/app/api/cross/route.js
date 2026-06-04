import { NextResponse } from 'next/server';
import { adoptionByYear } from '../../../lib/db';
import { papersByYear, newsByYear } from '../../../lib/crossdb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [policy, papers, news] = await Promise.all([
      adoptionByYear(), papersByYear(), newsByYear(),
    ]);
    return NextResponse.json({ policy, papers, news });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), policy: [], papers: [], news: [] });
  }
}
