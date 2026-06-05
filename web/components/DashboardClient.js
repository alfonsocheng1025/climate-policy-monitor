'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useT } from '../lib/i18n';
import KpiStrip from './KpiStrip';
import WhatsNewFeed from './WhatsNewFeed';

// Code-split the heavy map (react-simple-maps + d3-geo) and chart (recharts) so
// they aren't in the landing page's initial JS bundle.
const MetricMap = dynamic(() => import('./MetricMap'), {
  ssr: false, loading: () => <div className="skeleton skel-box" />,
});
const AdoptionChart = dynamic(() => import('./AdoptionChart'), {
  ssr: false, loading: () => <div className="skeleton skel-box" />,
});

export default function DashboardClient({ data }) {
  const { t } = useT();
  const router = useRouter();
  const [d, setD] = useState(data || {});
  // Normally the data is embedded by the server (no round-trip). Only if it's
  // missing (e.g. the build couldn't reach the DB) do we fetch it client-side.
  useEffect(() => {
    if (!d || !d.kpis) {
      fetch('/api/dashboard').then((r) => r.json()).then((x) => { if (x) setD(x); }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const kpis = (d && d.kpis) || null;
  const adoption = (d && d.adoption) || [];
  const map = (d && d.map) || [];
  const news = (d && d.news) || [];

  return (
    <div>
      <section className="hero">
        <div className="hero__bg" /><div className="hero__grid" />
        <div className="hero__inner">
          <div className="eyebrow">{t('org')} · Climate Policy Monitor</div>
          <h1 className="hero__title">{t('hero_title')}</h1>
          <p className="hero__sub">{t('hero_sub')}</p>
        </div>
      </section>

      <KpiStrip kpis={kpis} />

      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 540px', minWidth: 0 }}>
          <div className="card">
            <div className="eyebrow">MAP</div>
            <h3 style={{ marginTop: 0 }}>{t('coverage_title')}</h3>
            <p className="card__desc">{t('m_coverage_desc')}</p>
            <MetricMap data={map} onSelect={(iso) => router.push('/country/' + iso)} />
          </div>
          <div className="card">
            <div className="eyebrow">TREND</div>
            <h3 style={{ marginTop: 0 }}>{t('growth')}</h3>
            <AdoptionChart data={adoption} />
          </div>
        </div>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div className="card">
            <div className="eyebrow">🆕 LIVE</div>
            <h3 style={{ marginTop: 0 }}>{t('whatsnew')}</h3>
            <WhatsNewFeed rows={news} limit={8} />
          </div>
        </div>
      </section>
    </div>
  );
}
