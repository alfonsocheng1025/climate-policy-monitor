'use client';
import { useT } from '../lib/i18n';

const FAM_LABEL = {
  carbon_pricing: ['碳定价', 'Carbon pricing'], regulation: ['管制标准', 'Regulation'],
  subsidy_fiscal: ['补贴财政', 'Subsidies'], target_governance: ['目标治理', 'Targets/gov'],
  rdd_innovation: ['研发', 'RD&D'], information_voluntary: ['信息自愿', 'Information'],
};

export default function Archetypes({ clusters, families }) {
  const { t, lang } = useT();
  const fams = families || Object.keys(FAM_LABEL);
  const lab = (f) => (FAM_LABEL[f] ? FAM_LABEL[f][lang === 'zh' ? 0 : 1] : f);
  if (!clusters || !clusters.length) return <p style={{ color: '#789' }}>{t('nodata')}</p>;
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {clusters.map((c) => (
        <div key={c.id} style={{ flex: '1 1 260px', border: '1px solid #e0e8e4', borderRadius: 10, padding: 14 }}>
          <div style={{ fontWeight: 700, color: '#0b3d2e' }}>{lab(c.dominant)} {t('arch_type')}</div>
          <div style={{ fontSize: 12, color: '#567', margin: '6px 0' }}>{c.members.length} {t('arch_countries')}</div>
          <div style={{ margin: '8px 0' }}>
            {fams.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, margin: '2px 0' }}>
                <span style={{ width: 64, color: '#678' }}>{lab(f)}</span>
                <span style={{ flex: 1, background: '#eef4f1', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: (c.centroid[f] || 0) + '%', height: 8, background: '#1d6b4f' }} />
                </span>
                <span style={{ width: 28, textAlign: 'right', color: '#789' }}>{c.centroid[f] || 0}%</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#445', lineHeight: 1.7 }}>
            {c.members.slice(0, 40).map((m) => (
              <span key={m} style={{ display: 'inline-block', background: '#f0f4f2', borderRadius: 4, padding: '0 5px', margin: '2px 2px' }}>{m}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
