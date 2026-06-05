'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useT } from '../../../lib/i18n';
import { cname } from '../../../lib/iso';
import RecordTable from '../../../components/RecordTable';
import InstrumentMix from '../../../components/InstrumentMix';

export default function CountryPage() {
  const { t, lang } = useT();
  const params = useParams();
  const iso = String(params.iso || '').toUpperCase();
  const [d, setD] = useState(null);
  const [mix, setMix] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!iso) return;
    setLoaded(false);
    fetch('/api/country?iso=' + iso).then((r) => r.json()).then(setD).catch(() => {}).finally(() => setLoaded(true));
    fetch('/api/instrument-mix?c=' + iso).then((r) => r.json())
      .then((x) => setMix(Array.isArray(x) ? x : [])).catch(() => {});
  }, [iso]);

  const k = (d && d.kpis) || {};
  const traj = ((d && d.trajectory) || []).map((x) => ({ year: String(x.year), v: Number(x.v) }));
  const records = (d && d.records) || [];
  const cards = [
    [t('ctry_policies'), k.policies],
    [t('ctry_avgstr'), k.avg_stringency ? k.avg_stringency + '/10' : '—'],
    [t('ctry_netzero'), k.net_zero_year || '—'],
    [t('ctry_price'), k.carbon_price ? Number(k.carbon_price).toFixed(2) + ' USD/tCO₂e' : '—'],
  ];

  return (
    <div>
      <Link href="/map" className="muted">&larr; {t('nav_map')}</Link>
      <h2 style={{ marginTop: 8 }}>
        {cname(iso, lang)}{' '}
        <span className="muted" style={{ fontSize: '0.6em', fontFamily: 'var(--font-mono)' }}>{iso}</span>
      </h2>

      {loaded
        ? (
          <div className="kpi-grid">
            {cards.map(([l, v]) => (
              <div key={l} className="kpi">
                <div className="kpi__val">{v ?? '—'}</div>
                <div className="kpi__label">{l}</div>
              </div>
            ))}
          </div>
        )
        : <div className="kpi-grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="kpi skeleton skel-kpi" />)}</div>}

      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 8 }}>
        <div className="card" style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div className="eyebrow">STRINGENCY</div>
          <h3 style={{ marginTop: 0 }}>{t('ctry_traj')}</h3>
          {!loaded ? <div className="skeleton skel-box" style={{ height: 240 }} />
            : traj.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={traj}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} width={36} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="v" stroke="#3da9d9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="muted">{t('nodata')}</p>}
        </div>
        <div className="card" style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div className="eyebrow">MIX</div>
          <h3 style={{ marginTop: 0 }}>{t('mix_title')}</h3>
          <InstrumentMix rows={mix} />
        </div>
      </section>

      <div className="card">
        <div className="eyebrow">RECORDS</div>
        <h3 style={{ marginTop: 0 }}>{t('ctry_records')} ({records.length})</h3>
        {!loaded ? <div className="skeleton skel-box" /> : <RecordTable rows={records} />}
      </div>
    </div>
  );
}
