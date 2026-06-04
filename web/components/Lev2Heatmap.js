'use client';
import { useT } from '../lib/i18n';

export default function Lev2Heatmap({ rows }) {
  const { t } = useT();
  const list = rows || [];
  if (!list.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  const areas = [...new Set(list.map((r) => r.area))].sort();
  const countries = [...new Set(list.map((r) => r.country_iso))];
  const cell = {};
  list.forEach((r) => { cell[`${r.country_iso}|${r.area}`] = Number(r.stringency); });
  const color = (v) => (v == null ? '#f5f5f5' : `rgba(11,61,46,${0.12 + 0.085 * v})`); // v in 0..10
  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 6 }} />
            {countries.map((c) => <th key={c} style={{ padding: 6 }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {areas.map((a) => (
            <tr key={a}>
              <td style={{ padding: 6, whiteSpace: 'nowrap', maxWidth: 280 }}>{a}</td>
              {countries.map((c) => {
                const v = cell[`${c}|${a}`];
                return (
                  <td key={c} style={{ textAlign: 'center', padding: 6, background: color(v),
                    color: v > 6 ? '#fff' : '#333' }}>{v != null ? v.toFixed(1) : ''}</td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
