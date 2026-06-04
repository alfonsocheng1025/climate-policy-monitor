'use client';
import { useT } from '../lib/i18n';

const BADGE = { ok: '#1d6b4f', partial: '#b8860b', error: '#b00020' };

export default function HarvestTable({ rows }) {
  const { t } = useT();
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return <p style={{ color: '#789' }}>{t('db_note')}</p>;
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#f0f4f2', textAlign: 'left' }}>
          <th style={{ padding: 8 }}>{t('th_src')}</th>
          <th>{t('th_fetched')}</th><th>{t('th_upserted')}</th><th>{t('th_new')}</th>
          <th>{t('th_err')}</th><th>{t('th_lastrun')}</th><th>{t('th_status2')}</th>
        </tr>
      </thead>
      <tbody>
        {list.map((r) => (
          <tr key={r.source} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: 8, fontWeight: 600 }}>{r.source}</td>
            <td>{r.fetched ?? '—'}</td>
            <td>{r.upserted ?? '—'}</td>
            <td>{r.new_records ?? '—'}</td>
            <td>{r.errors ?? 0}</td>
            <td>{r.finished_at ? String(r.finished_at).slice(0, 16).replace('T', ' ') : '—'}</td>
            <td><span style={{ color: BADGE[r.status] || '#567' }}>● {r.status || '—'}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
