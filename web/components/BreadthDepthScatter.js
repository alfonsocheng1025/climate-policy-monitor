'use client';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts';
import { useT } from '../lib/i18n';

export default function BreadthDepthScatter({ rows }) {
  const { t } = useT();
  const data = (rows || []).map((r) => ({ x: Number(r.policies), y: Number(r.stringency), iso: r.country_iso }));
  if (!data.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  const tip = ({ payload }) => (payload && payload[0]
    ? <div style={{ background: '#fff', border: '1px solid #ccc', padding: 6, fontSize: 12 }}>
        <b>{payload[0].payload.iso}</b> · {payload[0].payload.x} {t('bd_x')} · {t('bd_y')} {payload[0].payload.y}
      </div> : null);
  return (
    <ResponsiveContainer width="100%" height={420}>
      <ScatterChart margin={{ top: 10, right: 24, bottom: 30, left: 8 }}>
        <CartesianGrid stroke="#eee" />
        <XAxis type="number" dataKey="x" tick={{ fontSize: 11 }}
          label={{ value: t('bd_x'), position: 'insideBottom', offset: -16, fontSize: 12 }} />
        <YAxis type="number" dataKey="y" domain={[0, 10]} tick={{ fontSize: 11 }}
          label={{ value: t('bd_y'), angle: -90, position: 'insideLeft', fontSize: 12 }} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={tip} />
        <Scatter data={data} fill="#0b3d2e" fillOpacity={0.7}>
          <LabelList dataKey="iso" position="top" style={{ fontSize: 9, fill: '#567' }} />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
