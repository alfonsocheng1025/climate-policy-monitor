import { NextResponse } from 'next/server';
import { breadthDepth, netzeroLadder, promiseAction, bivariate } from '../../../lib/db';
import { CACHE } from '../../../lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [bd, nz, pa, bv] = await Promise.all([
      breadthDepth(), netzeroLadder(), promiseAction(), bivariate(),
    ]);
    return NextResponse.json({ breadthDepth: bd, netzero: nz, promiseAction: pa, bivariate: bv }, { headers: CACHE });
  } catch (e) {
    return NextResponse.json({
      error: String(e?.message || e), breadthDepth: [], netzero: [], promiseAction: [], bivariate: [],
    });
  }
}
