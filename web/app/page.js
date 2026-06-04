'use client';
import { useEffect, useState } from 'react';
import FilterPanel from '../components/FilterPanel';
import PolicyMap from '../components/PolicyMap';
import PolicyTable from '../components/PolicyTable';

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [agg, setAgg] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const qs = new URLSearchParams(filters).toString();
    fetch('/api/policies?' + qs).then(r => r.json()).then(setRows);
  }, [filters]);

  useEffect(() => {
    fetch('/api/policies?agg=country').then(r => r.json()).then(setAgg);
  }, []);

  return (
    <div>
      <FilterPanel onChange={setFilters} />
      <section style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 540px' }}>
          <h3>各国政策覆盖</h3>
          <PolicyMap data={agg} />
        </div>
        <div style={{ flex: '1 1 360px' }}>
          <h3>政策列表 ({rows.length})</h3>
          <PolicyTable rows={rows} />
        </div>
      </section>
    </div>
  );
}
