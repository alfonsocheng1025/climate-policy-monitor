'use client';
import { useT } from '../lib/i18n';

export default function WhatsNewFeed({ rows, limit }) {
  const { t } = useT();
  const list = (Array.isArray(rows) ? rows : []).slice(0, limit || 999);
  if (!list.length) return <p className="muted">{t('nodata')}</p>;
  return (
    <ul className="feed">
      {list.map((d) => {
        const when = (d.first_seen_at || d.decision_date || '').toString().slice(0, 10);
        return (
          <li key={d.doc_id} className="feed__item">
            <div className="feed__meta">
              {when} · {d.source}{d.country_iso ? ` · ${d.country_iso}` : ''}
            </div>
            <div className="feed__title">{d.title || d.doc_id}</div>
            <div style={{ fontSize: 12 }}>
              <span className="chip">{d.record_type}</span>
              {(d.source_pdf_url || d.source_url) && (
                <> {' '}<a href={d.source_pdf_url || d.source_url} target="_blank" rel="noreferrer">{t('pdf')}</a></>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
