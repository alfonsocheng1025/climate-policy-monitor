'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useT } from '../../../lib/i18n';
import RecordTable from '../../../components/RecordTable';

export default function CountryPage() {
  const { t } = useT();
  const params = useParams();
  const iso = String(params.iso || '').toUpperCase();
  const [d, setD] = useState(null);

  useEffect(() => {
    if (iso) fetch('/api/country?iso=' + iso).then((r) => r.json()).then(setD).catch(() => {});
  }, [iso]);

  const k = (d && d.kpis) || {};
  const traj = ((d && d.trajectory) || []).map((x) => ({ year: String(x.year), v: Number(x.v) }));
  const cards = [
    [t('ctry_policies'), k.policies],
    [t('ctry_avgstr'), k.avg_stringency ? k.avg_stringency + '/10' : '—'],
    [t('ctry_netzero'), k.net_zero_year || '—'],
    [t('ctry_price'), k.carbon_price ? Number(k.carbon_price).toFixed(2) + ' USD/tCO2e' : '—'],
  ];

  return (
    <div>
      <Link href="/map" style={{ color: '#1d6b4f' }}>&larr; {t('nav_map')}</Link>
      <h2>{iso}</h2>
      <div className="kpi-grid">
        {cards.map(([l, v]) => (
          <div key={l} className="kpi">
            <div className="kpi__val">{v ?? '—'}</div>
            <div className="kpi__label">{l}</div>
          </div>
        ))}
      </div>
      <h3>{t('ctry_traj')}</h3>
      {traj.length ? (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={traj}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} width={36} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="v" stroke="#1d6b4f" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : <p style={{ color: '#789' }}>{t('nodata')}</p>}
      <h3 style={{ marginTop: 24 }}>{t('ctry_records')} ({(d && d.records && d.records.length) || 0})</h3>
      <RecordTable rows={(d && d.records) || []} />
    </div>
  );
}
