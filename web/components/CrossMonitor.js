'use client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useT } from '../lib/i18n';

export default function CrossMonitor({ policy, papers, news, minYear = 2010 }) {
  const { t } = useT();
  const norm = (arr) => {
    const m = Math.max(1, ...(arr || []).map((d) => Number(d.n)));
    return Object.fromEntries((arr || []).map((d) => [String(d.year), (Number(d.n) / m) * 100]));
  };
  const P = norm(policy); const A = norm(papers); const N = norm(news);
  const years = [...new Set([...Object.keys(P), ...Object.keys(A), ...Object.keys(N)])]
    .map(Number).filter((y) => y >= minYear && y <= 2026).sort((a, b) => a - b);
  const data = years.map((y) => ({
    year: String(y),
    policy: P[y] ?? null, papers: A[y] ?? null, news: N[y] ?? null,
  }));
  if (!data.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={40}
          label={{ value: t('cross_y'), angle: -90, position: 'insideLeft', fontSize: 11 }} />
        <Tooltip formatter={(v) => (v == null ? '—' : Math.round(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="policy" name={t('cross_policy')} stroke="#0b3d2e" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="papers" name={t('cross_papers')} stroke="#1d6b4f" strokeWidth={2} dot={false} connectNulls />
        <Line type="monotone" dataKey="news" name={t('cross_news')} stroke="#c9a227" strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
