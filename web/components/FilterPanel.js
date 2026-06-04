'use client';
import { useState } from 'react';
import { useT } from '../lib/i18n';

const SECTORS = ['', 'Electricity and heat', 'Transport', 'Industry', 'Buildings', 'Agriculture'];
const STATUS = ['', 'In force', 'Planned', 'Ended'];
const TYPES = ['', 'law', 'policy', 'ndc', 'net_zero', 'carbon_price', 'stringency_score'];

export default function FilterPanel({ onChange }) {
  const { t } = useT();
  const [f, setF] = useState({});
  const upd = (k, v) => {
    const n = { ...f, [k]: v };
    if (!v) delete n[k];
    setF(n);
    onChange(n);
  };
  const sel = (k, opts, label) => (
    <select value={f[k] || ''} onChange={(e) => upd(k, e.target.value)}
      style={{ padding: 6, marginRight: 8, marginBottom: 6 }}>
      {opts.map((o) => <option key={o} value={o}>{o || `${t('f_all')} · ${label}`}</option>)}
    </select>
  );
  return (
    <div style={{ margin: '12px 0' }}>
      <input placeholder={t('f_country')} value={f.country || ''}
        onChange={(e) => upd('country', e.target.value.toUpperCase())}
        style={{ padding: 6, marginRight: 8, marginBottom: 6, width: 170 }} />
      {sel('sector', SECTORS, t('f_sector'))}
      {sel('status', STATUS, t('f_status'))}
      {sel('recordType', TYPES, t('f_type'))}
    </div>
  );
}
