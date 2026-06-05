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
    <div className="kpi-grid">
      {cells.map(([label, val]) => (
        <div key={label} className="kpi">
          <div className="kpi__val">{val}</div>
          <div className="kpi__label">{label}</div>
        </div>
      ))}
    </div>
  );
}
