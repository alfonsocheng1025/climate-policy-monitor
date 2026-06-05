'use client';
import { useT } from '../lib/i18n';

export default function RecordTable({ rows }) {
  const { t } = useT();
  const list = Array.isArray(rows) ? rows : [];
  return (
    <div className="table-wrap" style={{ maxHeight: 520 }}>
      <table>
        <thead>
          <tr>
            <th>{t('th_country')}</th><th>{t('th_title')}</th><th>{t('th_type')}</th>
            <th>{t('th_sector')}</th><th>{t('th_status')}</th><th>{t('th_metric')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.doc_id}>
              <td>{r.country_iso || '—'}</td>
              <td>{(r.source_pdf_url || r.source_url)
                ? <a href={r.source_pdf_url || r.source_url} target="_blank" rel="noreferrer">{r.title}</a>
                : r.title}</td>
              <td><span className="chip">{r.record_type}</span></td>
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
