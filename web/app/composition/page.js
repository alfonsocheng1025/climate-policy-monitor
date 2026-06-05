'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CompositionView from '../../components/CompositionView';

export default function CompositionPage() {
  const { t } = useT();
  const [d, setD] = useState({ sectors: [], instruments: [], types: [], statuses: [] });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/composition').then((r) => r.json()).then((x) => setD(x || {}))
      .catch(() => {}).finally(() => setLoaded(true));
  }, []);
  return (
    <div>
      <h2>{t('nav_composition')}</h2>
      {loaded
        ? <CompositionView sectors={d.sectors} instruments={d.instruments} types={d.types} />
        : <div className="skeleton skel-box" style={{ height: 340 }} />}
    </div>
  );
}
