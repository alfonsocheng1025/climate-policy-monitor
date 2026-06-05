'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CompositionView from '../../components/CompositionView';
import ExportButton from '../../components/ExportButton';

export default function CompositionPage() {
  const { t, lang } = useT();
  const [d, setD] = useState({ sectors: [], instruments: [], types: [], statuses: [] });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/composition').then((r) => r.json()).then((x) => setD(x || {}))
      .catch(() => {}).finally(() => setLoaded(true));
  }, []);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{t('nav_composition')}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <ExportButton rows={d.sectors} name="composition_sectors" label={lang === 'zh' ? '↓ 部门' : '↓ Sectors'} />
          <ExportButton rows={d.instruments} name="composition_instruments" label={lang === 'zh' ? '↓ 工具' : '↓ Instruments'} />
          <ExportButton rows={d.types} name="composition_types" label={lang === 'zh' ? '↓ 类型' : '↓ Types'} />
        </div>
      </div>
      {loaded
        ? <CompositionView sectors={d.sectors} instruments={d.instruments} types={d.types} />
        : <div className="skeleton skel-box" style={{ height: 340 }} />}
    </div>
  );
}
