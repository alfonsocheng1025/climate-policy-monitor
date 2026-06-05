'use client';
import { useT } from '../lib/i18n';

export default function CompareView({ data }) {
  const { t } = useT();
  const { countries = [], sectorCounts = [], stringency = [], netzero = [] } = data || {};
  if (!countries.length) return null;

  const sectors = [...new Set(sectorCounts.map((r) => r.sector))].sort();
  const cell = {};
  sectorCounts.forEach((r) => { cell[`${r.country_iso}|${r.sector}`] = Number(r.n); });
  const max = Math.max(1, ...sectorCounts.map((r) => Number(r.n)));
  const strMap = Object.fromEntries(stringency.map((r) => [r.country_iso, r.v]));
  const nzMap = Object.fromEntries(netzero.map((r) => [r.country_iso, r.y]));
  const color = (n) => (!n ? '#141d29' : `rgba(61,169,217,${0.15 + 0.8 * n / max})`);

  return (
    <div>
      <h3>{t('cmp_heatmap')}</h3>
      <div style={{ overflow: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 6 }} />
              {countries.map((c) => <th key={c} style={{ padding: 6 }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {sectors.map((s) => (
              <tr key={s}>
                <td style={{ padding: 6, whiteSpace: 'nowrap' }}>{s}</td>
                {countries.map((c) => {
                  const n = cell[`${c}|${s}`];
                  return (
                    <td key={c} style={{ textAlign: 'center', padding: 6, background: color(n),
                      color: n && n / max > 0.6 ? '#0a0f14' : '#cdd6e2' }}>{n || ''}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: 24 }}>{t('cmp_stringency')} &amp; {t('cmp_netzero')}</h3>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          <tr>
            <td style={{ padding: 6 }} />
            {countries.map((c) => <td key={c} style={{ padding: 6, fontWeight: 600 }}>{c}</td>)}
          </tr>
          <tr>
            <td style={{ padding: 6 }}>{t('cmp_stringency')}</td>
            {countries.map((c) => (
              <td key={c} style={{ padding: 6, textAlign: 'center' }}>
                {strMap[c] != null ? Number(strMap[c]).toFixed(2) : '—'}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ padding: 6 }}>{t('cmp_netzero')}</td>
            {countries.map((c) => (
              <td key={c} style={{ padding: 6, textAlign: 'center' }}>{nzMap[c] || '—'}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
