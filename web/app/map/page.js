'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '../../lib/i18n';
import MetricMap from '../../components/MetricMap';
import FilterPanel from '../../components/FilterPanel';
import RecordTable from '../../components/RecordTable';

const METRICS = ['coverage', 'stringency', 'price', 'netzero'];

export default function MapPage() {
  const { t } = useT();
  const router = useRouter();
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

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ alignSelf: 'center', color: '#567' }}>{t('metric')}:</span>
        {METRICS.map((m) => (
          <button key={m} onClick={() => setMetric(m)}
            style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
              border: '1px solid ' + (metric === m ? '#0b3d2e' : '#ccc'),
              background: metric === m ? '#0b3d2e' : '#fff',
              color: metric === m ? '#fff' : '#333' }}>
            {t('m_' + m)}
          </button>
        ))}
      </div>
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 560px' }}>
          <MetricMap data={map} invert={metric === 'netzero'}
            onSelect={(iso) => router.push('/country/' + iso)} />
        </div>
        <div style={{ flex: '1 1 380px' }}>
          <FilterPanel onChange={setFilters} />
          <div style={{ fontSize: 13, color: '#567', margin: '4px 0' }}>
            {t('listcount')} ({rows.length})
          </div>
          <RecordTable rows={rows} />
        </div>
      </section>
    </div>
  );
}
