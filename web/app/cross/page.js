'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CrossMonitor from '../../components/CrossMonitor';
import ExportButton from '../../components/ExportButton';

export default function CrossPage() {
  const { t } = useT();
  const [d, setD] = useState({ policy: [], papers: [], news: [] });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/cross').then((r) => r.json()).then((x) => setD(x || {}))
      .catch(() => {}).finally(() => setLoaded(true));
  }, []);
  const crossRows = (() => {
    const m = {};
    const put = (arr, key) => (arr || []).forEach((r) => {
      const y = r.year; if (y == null) return;
      m[y] = m[y] || { year: y };
      m[y][key] = r.n ?? r.count ?? r.value;
    });
    put(d.policy, 'policy'); put(d.papers, 'papers'); put(d.news, 'news');
    return Object.values(m).sort((a, b) => a.year - b.year);
  })();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{t('nav_cross')}</h2>
        <ExportButton rows={crossRows} name="cross_by_year" />
      </div>
      <p className="muted">{t('cross_blurb')}</p>
      {loaded ? <CrossMonitor policy={d.policy} papers={d.papers} news={d.news} />
        : <div className="skeleton skel-box" />}
      <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>{t('cross_note')}</p>
    </div>
  );
}
