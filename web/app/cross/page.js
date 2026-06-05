'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CrossMonitor from '../../components/CrossMonitor';

export default function CrossPage() {
  const { t } = useT();
  const [d, setD] = useState({ policy: [], papers: [], news: [] });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/cross').then((r) => r.json()).then((x) => setD(x || {}))
      .catch(() => {}).finally(() => setLoaded(true));
  }, []);
  return (
    <div>
      <h2>{t('nav_cross')}</h2>
      <p className="muted">{t('cross_blurb')}</p>
      {loaded ? <CrossMonitor policy={d.policy} papers={d.papers} news={d.news} />
        : <div className="skeleton skel-box" />}
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t('cross_note')}</p>
    </div>
  );
}
