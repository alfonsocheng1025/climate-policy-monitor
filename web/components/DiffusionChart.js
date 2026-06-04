'use client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useT } from '../lib/i18n';

const FAMILIES = ['carbon_pricing', 'regulation', 'subsidy_fiscal', 'target_governance',
  'rdd_innovation', 'information_voluntary'];
const COLORS = {
  carbon_pricing: '#0b3d2e', regulation: '#b8860b', subsidy_fiscal: '#1d6b4f',
  target_governance: '#8aa', rdd_innovation: '#3a8f6c', information_voluntary: '#c9a227',
};

export default function DiffusionChart({ rows }) {
  const { t } = useT();
  const byYear = {};
  (rows || []).forEach((r) => {
    const y = String(r.year);
    byYear[y] = byYear[y] || { year: y };
    byYear[y][r.canon_instrument] = Number(r.cumulative_adopters);
  });
  const series = Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year));
  if (!series.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} minTickGap={28} />
        <YAxis tick={{ fontSize: 11 }} width={36} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {FAMILIES.map((f) => (
          <Line key={f} type="monotone" dataKey={f} name={f} stroke={COLORS[f]}
            strokeWidth={2} dot={false} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
