import { NextResponse } from 'next/server';
import { queryPolicies, countByCountry } from '../../../lib/db';

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  if (p.get('agg') === 'country') {
    return NextResponse.json(await countByCountry());
  }
  const rows = await queryPolicies({
    country: p.get('country'), sector: p.get('sector'),
    status: p.get('status'), docType: p.get('docType'),
  });
  return NextResponse.json(rows);
}
