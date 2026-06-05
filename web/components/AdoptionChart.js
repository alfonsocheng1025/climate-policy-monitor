'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Cumulative climate-law growth curve (PLAN.md Mode 3 signature chart).
export default function AdoptionChart({ data }) {
  const sorted = [...(Array.isArray(data) ? data : [])]
    .filter((d) => d.year)
    .sort((a, b) => String(a.year).localeCompare(String(b.year)));
  let cum = 0;
  const series = sorted.map((d) => ({ year: String(d.year), cumulative: (cum += Number(d.n) || 0) }));
  if (!series.length) return <p style={{ color: '#789' }}>—</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3da9d9" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#3da9d9" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis dataKey="year" tick={{ fontSize: 11 }} minTickGap={24} />
        <YAxis tick={{ fontSize: 11 }} width={40} />
        <Tooltip />
        <Area type="monotone" dataKey="cumulative" stroke="#3da9d9" fill="url(#g)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
