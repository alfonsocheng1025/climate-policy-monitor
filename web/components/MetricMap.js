'use client';
import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { NUM2ISO, cname } from '../lib/iso';
import { useT } from '../lib/i18n';

const GEO = '/countries-110m.json';

// `data` = [{ country_iso, value }]. `invert` darkens lower values. `fmt` formats values.
export default function MetricMap({ data, invert = false, onSelect, fmt }) {
  const { t, lang } = useT();
  const [hover, setHover] = useState(null);
  const map = Object.fromEntries((data || []).map((d) => [d.country_iso, Number(d.value)]));
  const vals = Object.values(map).filter((v) => !Number.isNaN(v));
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 1;
  const f = (v) => (fmt ? fmt(v) : (Math.round(v * 100) / 100));
  const color = (iso) => {
    const v = map[iso];
    if (v === undefined || Number.isNaN(v)) return '#141d29';
    const span = max - min || 1;
    let t = (v - min) / span;
    if (invert) t = 1 - t;
    return `rgba(61,169,217,${0.18 + 0.78 * t})`;
  };
  const isoOf = (geo) => NUM2ISO[String(Number(geo.id))] || geo.properties.iso_a3 || geo.id;

  return (
    <div style={{ position: 'relative' }}>
      <ComposableMap projectionConfig={{ scale: 145 }} style={{ width: '100%', height: 'auto' }}>
        <Geographies geography={GEO}>
          {({ geographies }) => geographies.map((geo) => {
            const iso = isoOf(geo);
            return (
              <Geography key={geo.rsmKey} geography={geo} fill={color(iso)} stroke="#0b1117" strokeWidth={0.3}
                onMouseEnter={() => setHover({ iso, v: map[iso] })}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect && iso && onSelect(iso)}
                style={{ default: { outline: 'none' }, hover: { fill: '#5cc1ef', outline: 'none', cursor: onSelect ? 'pointer' : 'default' },
                  pressed: { outline: 'none' } }} />
            );
          })}
        </Geographies>
      </ComposableMap>

      {hover && (
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 8, padding: '6px 10px', fontSize: 12,
          pointerEvents: 'none', boxShadow: 'var(--shadow-md)' }}>
          <b>{cname(hover.iso, lang)}</b> <span className="muted">{hover.iso}</span><br />
          {hover.v === undefined || Number.isNaN(hover.v)
            ? <span className="muted">{lang === 'zh' ? '无数据' : 'no data'}</span>
            : f(hover.v)}
        </div>
      )}

      <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11, flexWrap: 'wrap' }}>
        <span>{f(min)}</span>
        <span style={{ width: 130, height: 10, borderRadius: 5,
          background: `linear-gradient(90deg, rgba(61,169,217,${invert ? 0.96 : 0.18}), rgba(61,169,217,${invert ? 0.18 : 0.96}))` }} />
        <span>{f(max)}</span>
        <span style={{ marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 12, background: '#141d29', border: '1px solid #2c3a52', display: 'inline-block' }} />
          {lang === 'zh' ? '无数据' : 'no data'}
        </span>
        <span style={{ marginLeft: 'auto' }}>{onSelect ? t('map_click_hint') : ''}</span>
      </div>
    </div>
  );
}
