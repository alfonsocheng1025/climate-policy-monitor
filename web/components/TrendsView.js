'use client';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useT } from '../lib/i18n';

export default function TrendsView({ adoption, stringency }) {
  const { t } = useT();
  const a = [...(adoption || [])].filter((d) => d.year)
    .sort((x, y) => String(x.year).localeCompare(String(y.year)));
  let cum = 0;
  const growth = a.map((d) => ({ year: String(d.year), cumulative: (cum += Number(d.n) || 0) }));
  const str = (stringency || []).filter((d) => d.year)
    .map((d) => ({ year: String(d.year), v: Number(d.v) }));

  return (
    <div>
      <h3>{t('t_growth')}</h3>
      {growth.length ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={growth}>
            <defs>
              <linearGradient id="gt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3da9d9" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#3da9d9" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} minTickGap={24} />
            <YAxis tick={{ fontSize: 11 }} width={48} />
            <Tooltip />
            <Area type="monotone" dataKey="cumulative" stroke="#3da9d9" fill="url(#gt)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      ) : <p style={{ color: '#789' }}>{t('nodata')}</p>}

      <h3 style={{ marginTop: 28 }}>{t('t_stringency')}</h3>
      {str.length ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={str}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} width={36} />
            <Tooltip />
            <Line type="monotone" dataKey="v" stroke="#ff7a3d" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : <p style={{ color: '#789' }}>{t('nodata')}</p>}
    </div>
  );
}
