'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import BreadthDepthScatter from '../../components/BreadthDepthScatter';
import PromiseActionScatter from '../../components/PromiseActionScatter';
import NetZeroLadder from '../../components/NetZeroLadder';
import BivariateMap from '../../components/BivariateMap';
import Lev2Heatmap from '../../components/Lev2Heatmap';
import Archetypes from '../../components/Archetypes';

export default function AnalysisPage() {
  const { t } = useT();
  const [a, setA] = useState({ breadthDepth: [], netzero: [], promiseAction: [], bivariate: [] });
  const [arch, setArch] = useState({ clusters: [], families: [] });
  const [hq, setHq] = useState('DEU,CHN,USA,JPN,GBR,FRA');
  const [heat, setHeat] = useState([]);
  const loadHeat = (q) => fetch('/api/lev2?c=' + encodeURIComponent(q))
    .then((r) => r.json()).then((x) => setHeat(Array.isArray(x) ? x : [])).catch(() => {});
  useEffect(() => {
    fetch('/api/analysis').then((r) => r.json()).then((x) => setA(x || {})).catch(() => {});
    fetch('/api/archetypes').then((r) => r.json()).then((x) => setArch(x || {})).catch(() => {});
    loadHeat('DEU,CHN,USA,JPN,GBR,FRA');
  }, []);

  const H = ({ k }) => (
    <>
      <h3 style={{ marginTop: 28 }}>{t(k + '_title')}</h3>
      <p style={{ color: '#567', fontSize: 13 }}>{t(k + '_blurb')}</p>
    </>
  );

  return (
    <div>
      <h2>{t('nav_analysis')}</h2>
      <p style={{ color: '#567' }}>{t('analysis_blurb')}</p>

      <H k="bd" /><BreadthDepthScatter rows={a.breadthDepth} />
      <H k="pa" /><PromiseActionScatter rows={a.promiseAction} />
      <H k="nz" /><NetZeroLadder rows={a.netzero} />
      <H k="bivar" /><BivariateMap rows={a.bivariate} />
      <H k="arch" /><Archetypes clusters={arch.clusters} families={arch.families} />

      <H k="lev2" />
      <div style={{ margin: '8px 0' }}>
        <input value={hq} onChange={(e) => setHq(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && loadHeat(hq)} style={{ padding: 6, width: 280 }} />
        <button onClick={() => loadHeat(hq)} style={{ padding: '6px 14px', marginLeft: 8,
          background: '#0b3d2e', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
          {t('cmp_go')}
        </button>
      </div>
      <Lev2Heatmap rows={heat} />
    </div>
  );
}
