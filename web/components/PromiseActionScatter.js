'use client';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useT } from '../lib/i18n';

const LF_COLOR = { 1: '#cccccc', 2: '#c9a227', 3: '#5bb38a', 4: '#1d6b4f', 5: '#0b3d2e' };

export default function PromiseActionScatter({ rows }) {
  const { t } = useT();
  const data = (rows || [])
    .map((r) => ({ x: Number(r.stringency), y: Number(r.legal_force) || 0, iso: r.country_iso, yr: r.target_year }))
    .filter((d) => !Number.isNaN(d.x));
  if (!data.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  const lf = (v) => t('lf' + v) || v;
  const tip = ({ payload }) => (payload && payload[0]
    ? <div style={{ background: '#fff', border: '1px solid #ccc', padding: 6, fontSize: 12 }}>
        <b>{payload[0].payload.iso}</b> · {t('bd_y')} {payload[0].payload.x} · {lf(payload[0].payload.y)}
        {payload[0].payload.yr ? ' · ' + payload[0].payload.yr : ''}
      </div> : null);
  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 10, right: 24, bottom: 30, left: 30 }}>
        <CartesianGrid stroke="#eee" />
        <XAxis type="number" dataKey="x" domain={[0, 10]} tick={{ fontSize: 11 }}
          label={{ value: t('bd_y'), position: 'insideBottom', offset: -16, fontSize: 12 }} />
        <YAxis type="number" dataKey="y" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
          tickFormatter={lf} width={72} tick={{ fontSize: 10 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={tip} />
        <Scatter data={data}>
          {data.map((d, i) => <Cell key={i} fill={LF_COLOR[d.y] || '#999'} fillOpacity={0.8} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
