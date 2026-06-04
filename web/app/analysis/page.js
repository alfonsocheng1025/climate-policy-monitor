'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import BreadthDepthScatter from '../../components/BreadthDepthScatter';
import NetZeroLadder from '../../components/NetZeroLadder';
import Lev2Heatmap from '../../components/Lev2Heatmap';

export default function AnalysisPage() {
  const { t } = useT();
  const [a, setA] = useState({ breadthDepth: [], netzero: [] });
  const [hq, setHq] = useState('DEU,CHN,USA,JPN,GBR,FRA');
  const [heat, setHeat] = useState([]);
  const loadHeat = (q) => fetch('/api/lev2?c=' + encodeURIComponent(q))
    .then((r) => r.json()).then((x) => setHeat(Array.isArray(x) ? x : [])).catch(() => {});
  useEffect(() => {
    fetch('/api/analysis').then((r) => r.json()).then((x) => setA(x || {})).catch(() => {});
    loadHeat('DEU,CHN,USA,JPN,GBR,FRA');
  }, []);
  return (
    <div>
      <h2>{t('nav_analysis')}</h2>
      <p style={{ color: '#567' }}>{t('analysis_blurb')}</p>

      <h3 style={{ marginTop: 20 }}>{t('bd_title')}</h3>
      <p style={{ color: '#567', fontSize: 13 }}>{t('bd_blurb')}</p>
      <BreadthDepthScatter rows={a.breadthDepth} />

      <h3 style={{ marginTop: 28 }}>{t('nz_title')}</h3>
      <p style={{ color: '#567', fontSize: 13 }}>{t('nz_blurb')}</p>
      <NetZeroLadder rows={a.netzero} />

      <h3 style={{ marginTop: 28 }}>{t('lev2_title')}</h3>
      <p style={{ color: '#567', fontSize: 13 }}>{t('lev2_blurb')}</p>
      <div style={{ margin: '8px 0' }}>
        <input value={hq} onChange={(e) => setHq(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && loadHeat(hq)}
          style={{ padding: 6, width: 280 }} />
        <button onClick={() => loadHeat(hq)} style={{ padding: '6px 14px', marginLeft: 8,
          background: '#0b3d2e', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
          {t('cmp_go')}
        </button>
      </div>
      <Lev2Heatmap rows={heat} />
    </div>
  );
}
