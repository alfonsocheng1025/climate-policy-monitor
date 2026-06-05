'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import { mergeByKey } from '../../lib/csv';
import TrendsView from '../../components/TrendsView';
import DiffusionChart from '../../components/DiffusionChart';
import ExportButton from '../../components/ExportButton';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{t('nav_trends')}</h2>
        <ExportButton rows={mergeByKey('year', d.adoption || [], d.stringency || [])} name="trends" />
      </div>
      {loaded ? <TrendsView adoption={d.adoption} stringency={d.stringency} /> : <div className="skeleton skel-box" />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
        <h3 style={{ margin: 0 }}>{t('diff_title')}</h3>
        <ExportButton rows={diff} name="diffusion" />
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{t('diff_blurb')}</p>
      {loaded ? <DiffusionChart rows={diff} /> : <div className="skeleton skel-box" />}
    </div>
  );
}
