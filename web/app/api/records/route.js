import { NextResponse } from 'next/server';
import { queryRecords } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  try {
    const rows = await queryRecords({
      country: p.get('country'), sector: p.get('sector'),
      status: p.get('status'), recordType: p.get('recordType'),
      limit: p.get('limit'),
    });
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
