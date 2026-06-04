'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import TrendsView from '../../components/TrendsView';
import DiffusionChart from '../../components/DiffusionChart';

export default function TrendsPage() {
  const { t } = useT();
  const [d, setD] = useState({ adoption: [], stringency: [] });
  const [diff, setDiff] = useState([]);
  useEffect(() => {
    fetch('/api/trends').then((r) => r.json()).then((x) => setD(x || {})).catch(() => {});
    fetch('/api/diffusion').then((r) => r.json())
      .then((x) => setDiff(Array.isArray(x) ? x : [])).catch(() => {});
  }, []);
  return (
    <div>
      <h2>{t('nav_trends')}</h2>
      <TrendsView adoption={d.adoption} stringency={d.stringency} />
      <h3 style={{ marginTop: 28 }}>{t('diff_title')}</h3>
      <p style={{ color: '#567', fontSize: 13 }}>{t('diff_blurb')}</p>
      <DiffusionChart rows={diff} />
    </div>
  );
}
