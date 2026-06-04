'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import TrendsView from '../../components/TrendsView';

export default function TrendsPage() {
  const { t } = useT();
  const [d, setD] = useState({ adoption: [], stringency: [] });
  useEffect(() => {
    fetch('/api/trends').then((r) => r.json()).then((x) => setD(x || {})).catch(() => {});
  }, []);
  return (
    <div>
      <h2>{t('nav_trends')}</h2>
      <TrendsView adoption={d.adoption} stringency={d.stringency} />
    </div>
  );
}
