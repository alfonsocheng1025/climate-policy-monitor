'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import TrendsView from '../../components/TrendsView';
import DiffusionChart from '../../components/DiffusionChart';

export default function TrendsPage() {
  const { t } = useT();
  const [d, setD] = useState({ adoption: [], stringency: [] });
  const [diff, setDiff] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    Promise.all([
      fetch('/api/trends').then((r) => r.json()).then((x) => setD(x || {})).catch(() => {}),
      fetch('/api/diffusion').then((r) => r.json()).then((x) => setDiff(Array.isArray(x) ? x : [])).catch(() => {}),
    ]).finally(() => setLoaded(true));
  }, []);
  return (
    <div>
      <h2>{t('nav_trends')}</h2>
      {loaded ? <TrendsView adoption={d.adoption} stringency={d.stringency} /> : <div className="skeleton skel-box" />}
      <h3 style={{ marginTop: 28 }}>{t('diff_title')}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{t('diff_blurb')}</p>
      {loaded ? <DiffusionChart rows={diff} /> : <div className="skeleton skel-box" />}
    </div>
  );
}
