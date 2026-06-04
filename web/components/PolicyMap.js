'use client';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export default function PolicyMap({ data }) {
  const map = Object.fromEntries((data || []).map(d => [d.country_iso, d.n]));
  const max = Math.max(1, ...Object.values(map));
  const color = n => n ? `rgba(11,61,46,${0.2 + 0.8 * n / max})` : '#eee';
  return (
    <ComposableMap projectionConfig={{ scale: 130 }} style={{ width: '100%', height: 'auto' }}>
      <Geographies geography={GEO_URL}>
        {({ geographies }) => geographies.map(geo => {
          const iso = geo.properties.iso_a3 || geo.id;
          return <Geography key={geo.rsmKey} geography={geo}
            fill={color(map[iso])} stroke="#fff" strokeWidth={0.3} />;
        })}
      </Geographies>
    </ComposableMap>
  );
}
