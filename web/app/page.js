'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useT } from '../lib/i18n';
import KpiStrip from '../components/KpiStrip';
import WhatsNewFeed from '../components/WhatsNewFeed';

// Code-split the heavy map (react-simple-maps + d3-geo) and chart (recharts) so
// they aren't in the landing page's initial JS bundle — faster first paint.
const MetricMap = dynamic(() => import('../components/MetricMap'), {
  ssr: false, loading: () => <div className="skeleton skel-box" />,
});
const AdoptionChart = dynamic(() => import('../components/AdoptionChart'), {
  ssr: false, loading: () => <div className="skeleton skel-box" />,
});

export default function Dashboard() {
  const { t } = useT();
  const router = useRouter();
  const [stats, setStats] = useState({ kpis: null, adoption: [] });
  const [map, setMap] = useState([]);
  const [news, setNews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((d) => {
      setStats({ kpis: d.kpis, adoption: d.adoption || [] });
      setMap(Array.isArray(d.map) ? d.map : []);
      setNews(Array.isArray(d.news) ? d.news : []);
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="hero__bg" /><div className="hero__grid" />
        <div className="hero__inner">
          <div className="eyebrow">ZJU-CMIC · CLIMATE POLICY MONITOR</div>
          <h1 className="hero__title">{t('hero_title')}</h1>
          <p className="hero__sub">{t('hero_sub')}</p>
        </div>
      </section>

      {loaded
        ? <KpiStrip kpis={stats.kpis} />
        : <div className="kpi-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="kpi skeleton skel-kpi" />)}</div>}

      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 540px', minWidth: 0 }}>
          <div className="card">
            <div className="eyebrow">MAP</div>
            <h3 style={{ marginTop: 0 }}>{t('coverage_title')}</h3>
            <p className="card__desc">{t('m_coverage_desc')}</p>
            {loaded ? <MetricMap data={map} onSelect={(iso) => router.push('/country/' + iso)} />
              : <div className="skeleton skel-box" />}
          </div>
          <div className="card">
            <div className="eyebrow">TREND</div>
            <h3 style={{ marginTop: 0 }}>{t('growth')}</h3>
            {loaded ? <AdoptionChart data={stats.adoption} /> : <div className="skeleton skel-box" />}
          </div>
        </div>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div className="card">
            <div className="eyebrow">🆕 LIVE</div>
            <h3 style={{ marginTop: 0 }}>{t('whatsnew')}</h3>
            {loaded ? <WhatsNewFeed rows={news} limit={8} /> : <div className="skeleton skel-box" style={{ height: 300 }} />}
          </div>
        </div>
      </section>
    </div>
  );
}
