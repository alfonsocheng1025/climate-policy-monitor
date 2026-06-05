'use client';
import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';
import KpiStrip from '../components/KpiStrip';
import MetricMap from '../components/MetricMap';
import AdoptionChart from '../components/AdoptionChart';
import WhatsNewFeed from '../components/WhatsNewFeed';

export default function Dashboard() {
  const { t } = useT();
  const [stats, setStats] = useState({ kpis: null, adoption: [] });
  const [map, setMap] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((d) => {
      setStats({ kpis: d.kpis, adoption: d.adoption || [] });
      setMap(Array.isArray(d.map) ? d.map : []);
      setNews(Array.isArray(d.news) ? d.news : []);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <KpiStrip kpis={stats.kpis} />
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 540px', minWidth: 0 }}>
          <div className="card">
            <div className="eyebrow">MAP</div>
            <h3 style={{ marginTop: 0 }}>{t('coverage_title')}</h3>
            <MetricMap data={map} />
          </div>
          <div className="card">
            <div className="eyebrow">TREND</div>
            <h3 style={{ marginTop: 0 }}>{t('growth')}</h3>
            <AdoptionChart data={stats.adoption} />
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
