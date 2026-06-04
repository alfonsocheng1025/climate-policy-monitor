'use client';
import { useState } from 'react';
import { useT } from '../../lib/i18n';
import CompareView from '../../components/CompareView';

export default function ComparePage() {
  const { t } = useT();
  const [q, setQ] = useState('DEU,CHN,USA');
  const [data, setData] = useState(null);
  const go = async () => {
    const r = await fetch('/api/compare?c=' + encodeURIComponent(q));
    setData(await r.json());
  };
  return (
    <div>
      <h2>{t('nav_compare')}</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        placeholder={t('cmp_pick')} style={{ padding: 8, width: 340 }} />
      <button onClick={go} style={{ padding: '8px 16px', marginLeft: 8, background: '#0b3d2e',
        color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>{t('cmp_go')}</button>
      <div style={{ marginTop: 16 }}>
        {data && (data.countries && data.countries.length
          ? <CompareView data={data} />
          : <p style={{ color: '#789' }}>{t('nodata')}</p>)}
      </div>
    </div>
  );
}
