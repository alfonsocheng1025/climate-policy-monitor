import { NextResponse } from 'next/server';
import { diffusion } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await diffusion());
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) });
  }
}
