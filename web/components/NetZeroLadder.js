'use client';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useT } from '../lib/i18n';

const LF_COLOR = { 1: '#4d5b71', 2: '#f5cd5b', 3: '#6ee0c8', 4: '#3da9d9', 5: '#ff7a3d' };

export default function NetZeroLadder({ rows }) {
  const { t } = useT();
  const data = (rows || [])
    .filter((r) => r.target_year > 1990 && r.target_year < 2120)
    .map((r) => ({ x: Number(r.target_year), y: Number(r.legal_force) || 0, iso: r.country_iso, label: r.legal_force_label }));
  if (!data.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  const lf = (v) => t('lf' + v) || v;
  const tip = ({ payload }) => (payload && payload[0]
    ? <div style={{ background: '#0f1620', border: '1px solid #1f2b3d', color: '#e6edf5', padding: 6, fontSize: 12 }}>
        <b>{payload[0].payload.iso}</b> · {payload[0].payload.x} · {payload[0].payload.label || lf(payload[0].payload.y)}
      </div> : null);
  return (
    <div>
    <ResponsiveContainer width="100%" height={360}>
      <ScatterChart margin={{ top: 10, right: 24, bottom: 10, left: 30 }}>
        <CartesianGrid stroke="#eee" />
        <XAxis type="number" dataKey="x" name="year" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} />
        <YAxis type="number" dataKey="y" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
          tickFormatter={lf} width={72} tick={{ fontSize: 10 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={tip} />
        <Scatter data={data}>
          {data.map((d, i) => <Cell key={i} fill={LF_COLOR[d.y] || '#999'} fillOpacity={0.8} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
    <div className="muted" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, background: LF_COLOR[v], display: 'inline-block', borderRadius: 2 }} />{t('lf' + v)}
        </span>
      ))}
    </div>
    </div>
  );
}
