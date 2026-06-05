'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CountryPicker from '../../components/CountryPicker';
import CompareView from '../../components/CompareView';

export default function ComparePage() {
  const { t } = useT();
  const [sel, setSel] = useState(['DEU', 'CHN', 'USA']);
  const [data, setData] = useState(null);
  useEffect(() => {
    if (sel.length) {
      fetch('/api/compare?c=' + sel.join(',')).then((r) => r.json()).then(setData).catch(() => {});
    } else setData(null);
  }, [sel]);
  return (
    <div>
      <h2>{t('nav_compare')}</h2>
      <p className="muted">{t('cmp_pick')}</p>
      <CountryPicker value={sel} onChange={setSel} max={6} />
      <div style={{ marginTop: 16 }}>
        {data && (data.countries && data.countries.length
          ? <CompareView data={data} />
          : <p className="muted">{t('nodata')}</p>)}
      </div>
    </div>
  );
}
