'use client';
import { useState } from 'react';

const SECTORS = ['', 'Electricity and heat', 'Transport', 'Industry', 'Buildings', 'Agriculture'];
const STATUS = ['', 'In force', 'Planned', 'Ended'];
const TYPES = ['', 'policy', 'law', 'NDC'];

export default function FilterPanel({ onChange }) {
  const [f, setF] = useState({});
  const upd = (k, v) => { const n = { ...f, [k]: v }; if (!v) delete n[k]; setF(n); onChange(n); };
  const sel = (k, opts) => (
    <select onChange={e => upd(k, e.target.value)} style={{ padding: 6, marginRight: 8 }}>
      {opts.map(o => <option key={o} value={o}>{o || `全部 ${k}`}</option>)}
    </select>
  );
  return (
    <div style={{ margin: '16px 0' }}>
      <input placeholder="国家 ISO-3 (如 CHN)" onChange={e => upd('country', e.target.value.toUpperCase())}
        style={{ padding: 6, marginRight: 8, width: 160 }} />
      {sel('sector', SECTORS)}
      {sel('status', STATUS)}
      {sel('docType', TYPES)}
    </div>
  );
}
