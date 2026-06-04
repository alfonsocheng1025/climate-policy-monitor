import { NextResponse } from 'next/server';
import { archetypeVectors } from '../../../lib/db';

export const dynamic = 'force-dynamic';

const FAM = ['carbon_pricing', 'regulation', 'subsidy_fiscal', 'target_governance',
  'rdd_innovation', 'information_voluntary'];

const dist = (a, b) => a.reduce((s, x, i) => s + (x - b[i]) * (x - b[i]), 0);

export async function GET() {
  try {
    const rows = await archetypeVectors();
    const by = {};
    rows.forEach((r) => {
      by[r.country_iso] = by[r.country_iso] || {};
      by[r.country_iso][r.canon_instrument] = Number(r.n);
    });
    // per-country normalized share vector over FAM; need >=3 policies to characterize
    const countries = Object.keys(by).map((iso) => {
      const counts = FAM.map((f) => by[iso][f] || 0);
      const tot = counts.reduce((a, b) => a + b, 0);
      return { iso, total: tot, v: counts.map((c) => (tot ? c / tot : 0)) };
    }).filter((c) => c.total >= 3);
    if (countries.length < 6) return NextResponse.json({ clusters: [], families: FAM });

    const k = Math.min(4, countries.length);
    // deterministic init: by total desc, pick k evenly spaced
    const sorted = [...countries].sort((a, b) => b.total - a.total);
    let centroids = [];
    for (let i = 0; i < k; i++) centroids.push(sorted[Math.floor(i * (sorted.length - 1) / (k - 1 || 1))].v.slice());
    const assign = new Array(countries.length).fill(0);
    for (let it = 0; it < 40; it++) {
      let changed = false;
      countries.forEach((c, idx) => {
        let best = 0; let bd = Infinity;
        centroids.forEach((ce, ci) => { const d = dist(c.v, ce); if (d < bd) { bd = d; best = ci; } });
        if (assign[idx] !== best) { assign[idx] = best; changed = true; }
      });
      const sums = centroids.map(() => new Array(FAM.length).fill(0));
      const cnts = centroids.map(() => 0);
      countries.forEach((c, idx) => { cnts[assign[idx]]++; c.v.forEach((x, i) => { sums[assign[idx]][i] += x; }); });
      centroids = centroids.map((ce, ci) => (cnts[ci] ? sums[ci].map((s) => s / cnts[ci]) : ce));
      if (!changed && it > 0) break;
    }
    const clusters = centroids.map((ce, ci) => {
      const members = countries.filter((c, idx) => assign[idx] === ci)
        .sort((a, b) => b.total - a.total).map((c) => c.iso);
      const dom = FAM[ce.indexOf(Math.max(...ce))];
      const centroid = Object.fromEntries(FAM.map((f, i) => [f, Math.round(ce[i] * 100)]));
      return { id: ci, dominant: dom, centroid, members };
    }).filter((c) => c.members.length);
    return NextResponse.json({ clusters, families: FAM });
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e), clusters: [], families: FAM });
  }
}
