'use client';
import { useT } from '../lib/i18n';

export default function WhatsNewFeed({ rows, limit }) {
  const { t } = useT();
  const list = (Array.isArray(rows) ? rows : []).slice(0, limit || 999);
  if (!list.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {list.map((d) => {
        const when = (d.first_seen_at || d.decision_date || '').toString().slice(0, 10);
        return (
          <li key={d.doc_id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 12, color: '#789' }}>
              {when} · {d.source} {d.country_iso ? `· ${d.country_iso}` : ''}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{d.title || d.doc_id}</div>
            <div style={{ fontSize: 12, color: '#678' }}>
              <span style={{ background: '#eef4f1', borderRadius: 4, padding: '1px 6px' }}>{d.record_type}</span>
              {(d.source_pdf_url || d.source_url) && (
                <> · <a href={d.source_pdf_url || d.source_url} target="_blank" rel="noreferrer">{t('pdf')}</a></>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
