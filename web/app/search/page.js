'use client';
import { useState } from 'react';
import { useT } from '../../lib/i18n';

export default function Search() {
  const { t } = useT();
  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);
  const [done, setDone] = useState(false);

  const go = async () => {
    const r = await fetch('/api/search?q=' + encodeURIComponent(q));
    const d = await r.json();
    setRes(Array.isArray(d) ? d : []);
    setDone(true);
  };

  return (
    <div>
      <h3>{t('nav_search')}</h3>
      <input value={q} onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        placeholder={t('search_ph')} style={{ padding: 8, width: 340 }} />
      <button onClick={go} style={{ padding: '8px 16px', marginLeft: 8, background: '#0b3d2e',
        color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
        {t('search_btn')}
      </button>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {res.map((d) => (
          <li key={d.doc_id} style={{ margin: '14px 0', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
            <strong>{d.title}</strong>{' '}
            <em style={{ color: '#789' }}>({d.country_iso || '—'} · {d.source})</em>
            <div dangerouslySetInnerHTML={{ __html: d.snippet || '' }}
              style={{ color: '#444', fontSize: 13, margin: '4px 0' }} />
            {(d.source_pdf_url || d.source_url) && (
              <a href={d.source_pdf_url || d.source_url} target="_blank" rel="noreferrer">{t('pdf')}</a>
            )}
          </li>
        ))}
        {done && !res.length && <li style={{ color: '#789' }}>{t('nodata')}</li>}
      </ul>
    </div>
  );
}
