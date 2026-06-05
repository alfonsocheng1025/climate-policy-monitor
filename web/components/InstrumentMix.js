'use client';
import { useT } from '../lib/i18n';

const FAM = ['carbon_pricing', 'regulation', 'subsidy_fiscal', 'target_governance',
  'rdd_innovation', 'information_voluntary'];
const COLORS = {
  carbon_pricing: '#3da9d9', regulation: '#ff7a3d', subsidy_fiscal: '#6ee0c8',
  target_governance: '#f5cd5b', rdd_innovation: '#b285ff', information_voluntary: '#ff6b8a',
};
const LABEL = {
  carbon_pricing: ['碳定价', 'Carbon pricing'], regulation: ['管制标准', 'Regulation'],
  subsidy_fiscal: ['补贴财政', 'Subsidies'], target_governance: ['目标治理', 'Targets/gov'],
  rdd_innovation: ['研发', 'RD&D'], information_voluntary: ['信息自愿', 'Information'],
};

export default function InstrumentMix({ rows }) {
  const { t, lang } = useT();
  const lab = (f) => (LABEL[f] ? LABEL[f][lang === 'zh' ? 0 : 1] : f);
  const by = {};
  (rows || []).forEach((r) => {
    by[r.country_iso] = by[r.country_iso] || {};
    by[r.country_iso][r.canon_instrument] = Number(r.n);
  });
  const countries = Object.keys(by);
  if (!countries.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, margin: '4px 0 10px' }}>
        {FAM.map((f) => (
          <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 12, height: 12, background: COLORS[f], display: 'inline-block' }} />{lab(f)}
          </span>
        ))}
      </div>
      {countries.map((c) => {
        const tot = FAM.reduce((s, f) => s + (by[c][f] || 0), 0) || 1;
        return (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
            <span style={{ width: 42, fontSize: 12, fontWeight: 600 }}>{c}</span>
            <span style={{ flex: 1, display: 'flex', height: 18, borderRadius: 4, overflow: 'hidden', border: '1px solid #eee' }}>
              {FAM.map((f) => {
                const w = ((by[c][f] || 0) / tot) * 100;
                return w > 0
                  ? <span key={f} title={`${lab(f)} ${Math.round(w)}%`} style={{ width: w + '%', background: COLORS[f] }} />
                  : null;
              })}
            </span>
            <span style={{ width: 40, fontSize: 11, color: '#789', textAlign: 'right' }}>{tot}</span>
          </div>
        );
      })}
    </div>
  );
}
