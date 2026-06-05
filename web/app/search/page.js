'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import { cname, ALL } from '../../lib/iso';

export default function Search() {
  const { t, lang } = useT();
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');
  const [source, setSource] = useState('');
  const [facets, setFacets] = useState({ types: [], sources: [] });
  const [res, setRes] = useState([]);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/search-facets').then((r) => r.json())
      .then((d) => setFacets({ types: d.types || [], sources: d.sources || [] })).catch(() => {});
  }, []);

  const go = async () => {
    if (!q.trim()) return;
    setBusy(true);
    const p = new URLSearchParams({ q });
    if (country) p.set('country', country);
    if (type) p.set('type', type);
    if (source) p.set('source', source);
    try {
      const r = await fetch('/api/search?' + p.toString());
      const d = await r.json();
      setRes(Array.isArray(d) ? d : []);
    } catch (e) { setRes([]); }
    setDone(true); setBusy(false);
  };

  return (
    <div>
      <h3>{t('nav_search')}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder={t('search_ph')} style={{ padding: 8, minWidth: 280, flex: '1 1 280px' }} />
        <button onClick={go} className="btn btn--primary">{t('search_btn')}</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0' }}>
        <select value={country} onChange={(e) => setCountry(e.target.value)} style={{ minWidth: 150 }}>
          <option value="">{t('f_country')}</option>
          {ALL.map((c) => <option key={c.iso} value={c.iso}>{lang === 'zh' ? c.zh : c.en}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ minWidth: 150 }}>
          <option value="">{t('f_type')}</option>
          {facets.types.map((x) => <option key={x.record_type} value={x.record_type}>{x.record_type} ({x.n})</option>)}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} style={{ minWidth: 150 }}>
          <option value="">{t('f_source')}</option>
          {facets.sources.map((x) => <option key={x.source} value={x.source}>{x.source} ({x.n})</option>)}
        </select>
      </div>
      {busy && <p className="muted">{t('loading')}</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {res.map((d) => (
          <li key={d.doc_id} style={{ margin: '14px 0', borderBottom: '1px solid var(--color-divider)', paddingBottom: 10 }}>
            <strong>{d.title}</strong>{' '}
            <em className="muted">({d.country_iso ? cname(d.country_iso, lang) : '—'} · {d.source})</em>
            <div dangerouslySetInnerHTML={{ __html: d.snippet || '' }}
              className="muted" style={{ fontSize: 13, margin: '4px 0' }} />
            {(d.source_pdf_url || d.source_url) && (
              <a href={d.source_pdf_url || d.source_url} target="_blank" rel="noreferrer">{t('pdf')}</a>
            )}
          </li>
        ))}
        {done && !busy && !res.length && <li className="muted">{t('nodata')}</li>}
      </ul>
    </div>
  );
}
