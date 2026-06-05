'use client';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { NUM2ISO } from '../lib/iso';
import { useT } from '../lib/i18n';

const GEO = '/countries-110m.json';
// PAL[stringency tercile 0..2][coverage tercile 0..2]
const PAL = [
  ['#e8e8e8', '#bcd0c7', '#8fb89e'],
  ['#c3b3d8', '#9aa6bf', '#6f9b8e'],
  ['#8c63aa', '#7561a0', '#46877f'],
];

function terciles(arr) {
  const s = arr.filter((v) => v != null && !Number.isNaN(v)).sort((a, b) => a - b);
  if (!s.length) return [0, 0];
  return [s[Math.floor(s.length / 3)], s[Math.floor(2 * s.length / 3)]];
}

export default function BivariateMap({ rows }) {
  const { t } = useT();
  const cov = Object.fromEntries((rows || []).map((d) => [d.country_iso, Number(d.coverage)]));
  const str = Object.fromEntries((rows || []).map((d) => [d.country_iso, d.stringency == null ? null : Number(d.stringency)]));
  const qc = terciles(Object.values(cov));
  const qs = terciles(Object.values(str));
  const bin = (v, q) => (v == null || Number.isNaN(v) ? -1 : (v <= q[0] ? 0 : (v <= q[1] ? 1 : 2)));
  const color = (iso) => {
    const xi = bin(cov[iso], qc);
    if (xi < 0) return '#141d29';
    const yi = bin(str[iso], qs);
    if (yi < 0) return '#2c3a52';
    return PAL[yi][xi];
  };
  return (
    <div>
      <ComposableMap projectionConfig={{ scale: 145 }} style={{ width: '100%', height: 'auto' }}>
        <Geographies geography={GEO}>
          {({ geographies }) => geographies.map((geo) => {
            const iso = NUM2ISO[String(Number(geo.id))] || geo.properties.iso_a3 || geo.id;
            return <Geography key={geo.rsmKey} geography={geo} fill={color(iso)} stroke="#0b1117" strokeWidth={0.3}
              style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }} />;
          })}
        </Geographies>
      </ComposableMap>
      <div style={{ marginTop: 8, fontSize: 10, color: '#567' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,16px)', width: 'max-content' }}>
          {[2, 1, 0].map((yi) => [0, 1, 2].map((xi) => (
            <div key={`${yi}-${xi}`} style={{ width: 16, height: 16, background: PAL[yi][xi] }} />
          )))}
        </div>
        <div>→ {t('bivar_x')} · ↑ {t('bivar_y')}</div>
      </div>
    </div>
  );
}
