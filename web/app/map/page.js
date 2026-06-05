'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/i18n';
import { cname } from '../../lib/iso';
import MetricMap from '../../components/MetricMap';
import FilterPanel from '../../components/FilterPanel';
import RecordTable from '../../components/RecordTable';

const METRICS = ['coverage', 'stringency', 'price', 'netzero'];

export default function MapPage() {
  const { t, lang } = useT();
  const [metric, setMetric] = useState('coverage');
  const [map, setMap] = useState([]);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetch('/api/map?metric=' + metric).then((r) => r.json())
      .then((d) => setMap(Array.isArray(d) ? d : [])).catch(() => {});
  }, [metric]);
  useEffect(() => {
    const qs = new URLSearchParams(filters).toString();
    fetch('/api/records?' + qs).then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : [])).catch(() => {});
  }, [filters]);

  const priceFmt = (v) => '$' + (Math.round(v * 10) / 10);

  return (
    <div>
      <h2>{t('nav_map')}</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span className="muted" style={{ alignSelf: 'center' }}>{t('metric')}:</span>
        {METRICS.map((m) => (
          <button key={m} onClick={() => setMetric(m)}
            className={'chip' + (metric === m ? ' chip--active' : '')}
            style={{ cursor: 'pointer', fontSize: 13, padding: '6px 12px', border: 0 }}>
            {t('m_' + m)}
          </button>
        ))}
      </div>
      <p className="card__desc">{t('m_' + metric + '_desc')}</p>
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 560px', minWidth: 0 }}>
          <MetricMap data={map} invert={metric === 'netzero'}
            fmt={metric === 'price' ? priceFmt : undefined}
            onSelect={(iso) => setFilters((p) => ({ ...p, country: iso }))} />
        </div>
        <div style={{ flex: '1 1 380px', minWidth: 0 }}>
          <FilterPanel value={filters} onChange={setFilters} />
          {filters.country && (
            <div className="muted" style={{ fontSize: 13, margin: '4px 0' }}>
              <b style={{ color: 'var(--color-text)' }}>{cname(filters.country, lang)}</b> ({filters.country}) ·{' '}
              <Link href={'/country/' + filters.country} style={{ color: 'var(--color-primary)' }}>{t('detail')} →</Link>
            </div>
          )}
          <div className="muted" style={{ fontSize: 13, margin: '4px 0' }}>{t('listcount')} ({rows.length})</div>
          <RecordTable rows={rows} />
        </div>
      </section>
    </div>
  );
}
