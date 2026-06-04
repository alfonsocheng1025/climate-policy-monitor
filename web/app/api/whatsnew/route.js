import { NextResponse } from 'next/server';
import { whatsNew } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const limit = new URL(req.url).searchParams.get('limit') || 30;
  try {
    return NextResponse.json(await whatsNew(limit));
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
