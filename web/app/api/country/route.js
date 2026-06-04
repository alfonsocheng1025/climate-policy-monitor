import { NextResponse } from 'next/server';
import { countryProfile } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const iso = (new URL(req.url).searchParams.get('iso') || '').toUpperCase();
  if (!iso) return NextResponse.json({ error: 'iso required' });
  try {
    return NextResponse.json(await countryProfile(iso));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
