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
      <button onClick={go} className="btn btn--primary" style={{ marginLeft: 8 }}>{t('cmp_go')}</button>
      <div style={{ marginTop: 16 }}>
        {data && (data.countries && data.countries.length
          ? <CompareView data={data} />
          : <p style={{ color: '#789' }}>{t('nodata')}</p>)}
      </div>
    </div>
  );
}
