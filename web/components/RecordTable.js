'use client';
import { useT } from '../lib/i18n';

export default function RecordTable({ rows }) {
  const { t } = useT();
  const list = Array.isArray(rows) ? rows : [];
  return (
    <div style={{ maxHeight: 520, overflow: 'auto', border: '1px solid #eee', borderRadius: 8 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f0f4f2', textAlign: 'left', position: 'sticky', top: 0 }}>
            <th style={{ padding: 8 }}>{t('th_country')}</th>
            <th>{t('th_title')}</th>
            <th>{t('th_type')}</th>
            <th>{t('th_sector')}</th>
            <th>{t('th_status')}</th>
            <th>{t('th_metric')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.doc_id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{r.country_iso || '—'}</td>
              <td>{(r.source_pdf_url || r.source_url)
                ? <a href={r.source_pdf_url || r.source_url} target="_blank" rel="noreferrer">{r.title}</a>
                : r.title}</td>
              <td style={{ color: '#678' }}>{r.record_type}</td>
              <td>{r.sector || '—'}</td>
              <td>{r.status || '—'}</td>
              <td>{r.metric_value != null
                ? `${Number(r.metric_value).toFixed(2)}${r.metric_unit ? ' ' + r.metric_unit : ''}`
                : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
