'use client';
import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';
import { mergeByKey } from '../lib/csv';
import TrendsView from './TrendsView';
import DiffusionChart from './DiffusionChart';
import ExportButton from './ExportButton';

export default function TrendsClient({ data }) {
  const { t } = useT();
  const [d, setD] = useState(data || {});
  // Server embeds the data; only fetch if it's missing (build without DB access).
  useEffect(() => {
    const has = d && ((d.adoption && d.adoption.length) || (d.stringency && d.stringency.length));
    if (!has) {
      Promise.all([
        fetch('/api/trends').then((r) => r.json()).catch(() => null),
        fetch('/api/diffusion').then((r) => r.json()).catch(() => null),
      ]).then(([tr, di]) => setD({
        adoption: (tr && tr.adoption) || [],
        stringency: (tr && tr.stringency) || [],
        diffusion: Array.isArray(di) ? di : [],
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const adoption = (d && d.adoption) || [];
  const stringency = (d && d.stringency) || [];
  const diff = (d && d.diffusion) || [];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{t('nav_trends')}</h2>
        <ExportButton rows={mergeByKey('year', adoption, stringency)} name="trends" />
      </div>
      <TrendsView adoption={adoption} stringency={stringency} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
        <h3 style={{ margin: 0 }}>{t('diff_title')}</h3>
        <ExportButton rows={diff} name="diffusion" />
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{t('diff_blurb')}</p>
      <DiffusionChart rows={diff} />
    </div>
  );
}
