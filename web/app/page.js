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
    fetch('/api/stats').then((r) => r.json()).then((d) => setStats(d || {})).catch(() => {});
    fetch('/api/map?metric=coverage').then((r) => r.json())
      .then((d) => setMap(Array.isArray(d) ? d : [])).catch(() => {});
    fetch('/api/whatsnew?limit=8').then((r) => r.json())
      .then((d) => setNews(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div>
      <KpiStrip kpis={stats.kpis} />
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 540px' }}>
          <h3>{t('coverage_title')}</h3>
          <MetricMap data={map} />
          <h3 style={{ marginTop: 24 }}>{t('growth')}</h3>
          <AdoptionChart data={stats.adoption} />
        </div>
        <div style={{ flex: '1 1 320px' }}>
          <h3>🆕 {t('whatsnew')}</h3>
          <WhatsNewFeed rows={news} limit={8} />
        </div>
      </section>
    </div>
  );
}
