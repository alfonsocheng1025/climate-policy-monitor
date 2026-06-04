'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import CompositionView from '../../components/CompositionView';

export default function CompositionPage() {
  const { t } = useT();
  const [d, setD] = useState({ sectors: [], instruments: [], types: [], statuses: [] });
  useEffect(() => {
    fetch('/api/composition').then((r) => r.json()).then((x) => setD(x || {})).catch(() => {});
  }, []);
  return (
    <div>
      <h2>{t('nav_composition')}</h2>
      <CompositionView sectors={d.sectors} instruments={d.instruments} types={d.types} />
    </div>
  );
}
