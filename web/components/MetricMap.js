'use client';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// Served from /public (same-origin) — avoids the jsdelivr CDN being blocked/slow in China.
const GEO_URL = '/countries-110m.json';

// `data` = [{ country_iso, value }]. `invert` (e.g. net-zero target year) darkens lower values.
export default function MetricMap({ data, invert = false, onSelect }) {
  const map = Object.fromEntries((data || []).map((d) => [d.country_iso, Number(d.value)]));
  const vals = Object.values(map).filter((v) => !Number.isNaN(v));
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 1;
  const color = (iso) => {
    const v = map[iso];
    if (v === undefined || Number.isNaN(v)) return '#141d29';
    const span = max - min || 1;
    let t = (v - min) / span;
    if (invert) t = 1 - t;
    return `rgba(61,169,217,${0.18 + 0.78 * t})`;
  };
  return (
    <ComposableMap projectionConfig={{ scale: 145 }} style={{ width: '100%', height: 'auto' }}>
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const iso = geo.properties.iso_a3 || geo.id;
            return (
              <Geography key={geo.rsmKey} geography={geo}
                fill={color(iso)} stroke="#0b1117" strokeWidth={0.3}
                onClick={() => onSelect && iso && onSelect(iso)}
                style={{ default: { outline: 'none' }, hover: { fill: '#5cc1ef', outline: 'none', cursor: onSelect ? 'pointer' : 'default' },
                  pressed: { outline: 'none' } }} />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}
