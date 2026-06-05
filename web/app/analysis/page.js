'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import BreadthDepthScatter from '../../components/BreadthDepthScatter';
import PromiseActionScatter from '../../components/PromiseActionScatter';
import NetZeroLadder from '../../components/NetZeroLadder';
import BivariateMap from '../../components/BivariateMap';
import InstrumentMix from '../../components/InstrumentMix';
import Lev2Heatmap from '../../components/Lev2Heatmap';
import CountryPicker from '../../components/CountryPicker';

export default function AnalysisPage() {
  const { t } = useT();
  const [a, setA] = useState({ breadthDepth: [], netzero: [], promiseAction: [], bivariate: [] });
  const [mixSel, setMixSel] = useState(['DEU', 'CHN', 'USA', 'JPN', 'GBR', 'FRA', 'IND', 'BRA']);
  const [mix, setMix] = useState([]);
  const [heatSel, setHeatSel] = useState(['DEU', 'CHN', 'USA', 'JPN', 'GBR', 'FRA']);
  const [heat, setHeat] = useState([]);
  useEffect(() => { fetch('/api/analysis').then((r) => r.json()).then((x) => setA(x || {})).catch(() => {}); }, []);
  useEffect(() => {
    if (mixSel.length) fetch('/api/instrument-mix?c=' + mixSel.join(',')).then((r) => r.json())
      .then((x) => setMix(Array.isArray(x) ? x : [])).catch(() => {}); else setMix([]);
  }, [mixSel]);
  useEffect(() => {
    if (heatSel.length) fetch('/api/lev2?c=' + heatSel.join(',')).then((r) => r.json())
      .then((x) => setHeat(Array.isArray(x) ? x : [])).catch(() => {}); else setHeat([]);
  }, [heatSel]);

  const H = ({ k }) => (
    <>
      <h3 style={{ marginTop: 28 }}>{t(k + '_title')}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{t(k + '_blurb')}</p>
    </>
  );

  return (
    <div>
      <h2>{t('nav_analysis')}</h2>
      <p className="muted">{t('analysis_blurb')}</p>
      <H k="bd" /><BreadthDepthScatter rows={a.breadthDepth} />
      <H k="pa" /><PromiseActionScatter rows={a.promiseAction} />
      <H k="nz" /><NetZeroLadder rows={a.netzero} />
      <H k="bivar" /><BivariateMap rows={a.bivariate} />
      <H k="mix" /><CountryPicker value={mixSel} onChange={setMixSel} max={10} /><InstrumentMix rows={mix} />
      <H k="lev2" /><CountryPicker value={heatSel} onChange={setHeatSel} max={8} /><Lev2Heatmap rows={heat} />
    </div>
  );
}
