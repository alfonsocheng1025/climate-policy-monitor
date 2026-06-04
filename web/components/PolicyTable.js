'use client';
export default function PolicyTable({ rows }) {
  return (
    <div style={{ maxHeight: 480, overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
        <thead><tr style={{ background: '#f0f4f2', textAlign: 'left' }}>
          <th style={{ padding: 6 }}>国家</th><th>政策</th><th>部门</th><th>状态</th><th>CAPMF</th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.doc_id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 6 }}>{r.country_iso}</td>
              <td>{r.source_pdf_url ? <a href={r.source_pdf_url} target="_blank">{r.title}</a> : r.title}</td>
              <td>{r.sector}</td><td>{r.status}</td>
              <td>{r.capmf_score ? Number(r.capmf_score).toFixed(2) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
