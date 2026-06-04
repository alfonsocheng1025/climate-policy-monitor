import { NextResponse } from 'next/server';
import { fullTextSearch } from '../../../lib/db';

export async function GET(req) {
  const q = new URL(req.url).searchParams.get('q') || '';
  if (!q) return NextResponse.json([]);
  return NextResponse.json(await fullTextSearch(q));
}
