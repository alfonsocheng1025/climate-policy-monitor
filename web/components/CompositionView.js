'use client';
import {
  Treemap, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useT } from '../lib/i18n';

const COLORS = ['#3da9d9', '#ff7a3d', '#6ee0c8', '#f5cd5b', '#b285ff', '#ff6b8a',
  '#5cc1ef', '#4dbfa3', '#c89211', '#8a99ad'];

export default function CompositionView({ sectors, instruments, types }) {
  const { t } = useT();
  const tree = (sectors || []).map((s) => ({ name: String(s.k), size: Number(s.n) }));
  const pie = (types || []).map((d) => ({ name: String(d.k), value: Number(d.n) }));
  const inst = (instruments || []).map((d) => ({ k: String(d.k).slice(0, 28), n: Number(d.n) }));
  const box = { flex: '1 1 360px' };
  const empty = <p style={{ color: '#789' }}>{t('nodata')}</p>;

  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
      <div style={box}>
        <h3>{t('comp_sectors')}</h3>
        {tree.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <Treemap data={tree} dataKey="size" nameKey="name" stroke="#fff" fill="#3da9d9" />
          </ResponsiveContainer>
        ) : empty}
      </div>
      <div style={box}>
        <h3>{t('comp_types')}</h3>
        {pie.length ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" outerRadius={110} label>
                {pie.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : empty}
      </div>
      <div style={{ flex: '1 1 100%' }}>
        <h3>{t('comp_instruments')}</h3>
        {inst.length ? (
          <ResponsiveContainer width="100%" height={Math.max(240, inst.length * 22)}>
            <BarChart data={inst} layout="vertical" margin={{ left: 150 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="k" width={150} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="n" fill="#3da9d9" />
            </BarChart>
          </ResponsiveContainer>
        ) : empty}
      </div>
    </div>
  );
}
