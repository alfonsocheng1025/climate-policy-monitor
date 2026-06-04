'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CrossMonitor from '../../components/CrossMonitor';

export default function CrossPage() {
  const { t } = useT();
  const [d, setD] = useState({ policy: [], papers: [], news: [] });
  useEffect(() => {
    fetch('/api/cross').then((r) => r.json()).then((x) => setD(x || {})).catch(() => {});
  }, []);
  return (
    <div>
      <h2>{t('nav_cross')}</h2>
      <p style={{ color: '#567' }}>{t('cross_blurb')}</p>
      <CrossMonitor policy={d.policy} papers={d.papers} news={d.news} />
      <p style={{ color: '#789', fontSize: 12, marginTop: 8 }}>{t('cross_note')}</p>
    </div>
  );
}
