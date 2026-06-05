'use client';
import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';
import CompositionView from './CompositionView';
import ExportButton from './ExportButton';

export default function CompositionClient({ data }) {
  const { t, lang } = useT();
  const [d, setD] = useState(data || {});
  // Server embeds the data; only fetch if it's missing (build without DB access).
  useEffect(() => {
    const has = d && ((d.sectors && d.sectors.length) || (d.instruments && d.instruments.length));
    if (!has) {
      fetch('/api/composition').then((r) => r.json()).then((x) => { if (x) setD(x); }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const sectors = (d && d.sectors) || [];
  const instruments = (d && d.instruments) || [];
  const types = (d && d.types) || [];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{t('nav_composition')}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <ExportButton rows={sectors} name="composition_sectors" label={lang === 'zh' ? '↓ 部门' : '↓ Sectors'} />
          <ExportButton rows={instruments} name="composition_instruments" label={lang === 'zh' ? '↓ 工具' : '↓ Instruments'} />
          <ExportButton rows={types} name="composition_types" label={lang === 'zh' ? '↓ 类型' : '↓ Types'} />
        </div>
      </div>
      <CompositionView sectors={sectors} instruments={instruments} types={types} />
    </div>
  );
}
