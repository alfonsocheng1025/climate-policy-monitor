'use client';
import { useT } from '../lib/i18n';

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—';
  return v;
}

export default function KpiStrip({ kpis }) {
  const { t } = useT();
  const k = kpis || {};
  const last = k.last_harvest ? String(k.last_harvest).slice(0, 10) : '—';
  const cells = [
    [t('kpi_policies'), fmt(k.policies)],
    [t('kpi_countries'), fmt(k.countries)],
    [t('kpi_new'), fmt(k.new_this_year)],
    [t('kpi_stringency'), k.avg_stringency ? `${k.avg_stringency}/10` : '—'],
    [t('kpi_netzero'), fmt(k.net_zero)],
    [t('kpi_last'), last],
  ];
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '8px 0 20px' }}>
      {cells.map(([label, val]) => (
        <div key={label} style={{ flex: '1 1 150px', minWidth: 130, background: '#f0f4f2',
          border: '1px solid #e0e8e4', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#0b3d2e' }}>{val}</div>
          <div style={{ fontSize: 12, color: '#567' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}
