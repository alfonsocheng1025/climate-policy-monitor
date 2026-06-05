'use client';
import { useT } from '../lib/i18n';

const BADGE = { ok: '#4dbfa3', partial: '#f5cd5b', error: '#ff6b8a' };

export default function HarvestTable({ rows }) {
  const { t } = useT();
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) return <p className="muted">{t('db_note')}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t('th_src')}</th><th>{t('th_fetched')}</th><th>{t('th_upserted')}</th><th>{t('th_new')}</th>
            <th>{t('th_err')}</th><th>{t('th_lastrun')}</th><th>{t('th_status2')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.source}>
              <td style={{ fontWeight: 600 }}>{r.source}</td>
              <td>{r.fetched ?? '—'}</td>
              <td>{r.upserted ?? '—'}</td>
              <td>{r.new_records ?? '—'}</td>
              <td>{r.errors ?? 0}</td>
              <td>{r.finished_at ? String(r.finished_at).slice(0, 16).replace('T', ' ') : '—'}</td>
              <td><span style={{ color: BADGE[r.status] || 'var(--color-text-muted)' }}>● {r.status || '—'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
