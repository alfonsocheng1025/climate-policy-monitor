'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import WhatsNewFeed from '../../components/WhatsNewFeed';

const TYPES = ['', 'law', 'policy', 'ndc', 'lts', 'net_zero', 'carbon_price',
  'carbon_crediting', 'cooperative_approach'];

export default function LivePage() {
  const { t } = useT();
  const [rows, setRows] = useState([]);
  const [type, setType] = useState('');

  useEffect(() => {
    fetch('/api/whatsnew?limit=100').then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const shown = type ? rows.filter((r) => r.record_type === type) : rows;

  return (
    <div>
      <h3>🆕 {t('whatsnew')}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0 14px' }}>
        {TYPES.map((ty) => (
          <button key={ty || 'all'} onClick={() => setType(ty)}
            className={'chip' + (type === ty ? ' chip--active' : '')}
            style={{ cursor: 'pointer', fontSize: 13, padding: '5px 11px', border: 0 }}>
            {ty || t('f_all')}
          </button>
        ))}
      </div>
      <WhatsNewFeed rows={shown} />
    </div>
  );
}
