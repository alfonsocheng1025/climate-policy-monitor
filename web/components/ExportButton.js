'use client';
import { useT } from '../lib/i18n';
import { downloadCSV } from '../lib/csv';

export default function ExportButton({ rows, name = 'data', label }) {
  const { t } = useT();
  const disabled = !rows || !rows.length;
  return (
    <button
      className="btn btn--ghost"
      style={{ fontSize: 12, padding: '4px 10px', whiteSpace: 'nowrap' }}
      disabled={disabled}
      onClick={() => downloadCSV(name, rows)}
      title={t('export_csv')}
    >
      ↓ {label || t('export_csv')}
    </button>
  );
}
