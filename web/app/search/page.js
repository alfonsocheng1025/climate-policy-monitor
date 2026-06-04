'use client';
import { useState } from 'react';

export default function Search() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState([]);
  const go = async () => {
    const r = await fetch('/api/search?q=' + encodeURIComponent(q));
    setRes(await r.json());
  };
  return (
    <div>
      <h3>政策全文检索</h3>
      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="输入关键词，如 carbon tax / 碳市场"
        style={{ padding: 8, width: 320 }} />
      <button onClick={go} style={{ padding: '8px 16px', marginLeft: 8 }}>搜索</button>
      <ul>
        {res.map(d => (
          <li key={d.doc_id} style={{ margin: '12px 0' }}>
            <strong>{d.title}</strong> <em>({d.country_iso})</em>
            <div dangerouslySetInnerHTML={{ __html: d.snippet }} style={{ color: '#444' }} />
            {d.source_pdf_url && <a href={d.source_pdf_url} target="_blank">原文 PDF</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}
