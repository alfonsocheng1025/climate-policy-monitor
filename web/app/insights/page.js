'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import TrendsView from '../../components/TrendsView';
import DiffusionChart from '../../components/DiffusionChart';
import BreadthDepthScatter from '../../components/BreadthDepthScatter';
import NetZeroLadder from '../../components/NetZeroLadder';

const STORIES = [
  {
    n: '01', zh: '气候立法的指数级增长', en: 'The exponential rise of climate law',
    bz: '自 2015 年《巴黎协定》前后,全球气候法律与政策累计数量加速上升,而平均政策强度的提升更为缓慢——“立法多”不等于“力度强”。',
    be: 'Cumulative climate laws and policies accelerated around the 2015 Paris Agreement, while average stringency rises more slowly — more laws ≠ stronger laws.',
    chart: 'trends',
  },
  {
    n: '02', zh: '政策工具如何在各国扩散', en: 'How policy instruments spread across countries',
    bz: '碳定价、上网电价、净零目标等工具呈典型 S 曲线扩散:少数先行者之后加速、再饱和。碳定价的采纳国从 1990 年约 10 个增至 2023 年近 70 个。',
    be: 'Instruments diffuse along classic S-curves — a few pioneers, then acceleration, then saturation. Carbon pricing grew from ~10 adopter countries in 1990 to ~70 by 2023.',
    chart: 'diffusion',
  },
  {
    n: '03', zh: '广度不等于深度', en: 'Breadth is not depth',
    bz: '横轴政策数量、纵轴 CAPMF 强度。有的国家政策众多却强度平平,有的国家政策不多但力度很强——数量无法替代力度。',
    be: 'Policy count (x) vs CAPMF stringency (y): some countries have many but weak policies, others few but strong — quantity is no substitute for stringency.',
    chart: 'breadth',
  },
  {
    n: '04', zh: '承诺与法律之间的鸿沟', en: 'The gap between pledges and statutes',
    bz: '净零目标年 × 法律效力。大量国家停留在“宣示/政策文件”,真正“写入法律”的仍是少数——口头承诺与具约束力的立法之间存在明显差距。',
    be: 'Net-zero target year × legal force. Many countries sit at "declaration / policy"; only a minority have it "in law" — a clear gap between pledges and binding statutes.',
    chart: 'netzero',
  },
];

export default function InsightsPage() {
  const { t, lang } = useT();
  const [trends, setTrends] = useState({ adoption: [], stringency: [] });
  const [diff, setDiff] = useState([]);
  const [analysis, setAnalysis] = useState({ breadthDepth: [], netzero: [] });
  useEffect(() => {
    fetch('/api/trends').then((r) => r.json()).then((x) => setTrends(x || {})).catch(() => {});
    fetch('/api/diffusion').then((r) => r.json()).then((x) => setDiff(Array.isArray(x) ? x : [])).catch(() => {});
    fetch('/api/analysis').then((r) => r.json()).then((x) => setAnalysis(x || {})).catch(() => {});
  }, []);
  const chartFor = (k) => {
    if (k === 'trends') return <TrendsView adoption={trends.adoption} stringency={trends.stringency} />;
    if (k === 'diffusion') return <DiffusionChart rows={diff} />;
    if (k === 'breadth') return <BreadthDepthScatter rows={analysis.breadthDepth} />;
    if (k === 'netzero') return <NetZeroLadder rows={analysis.netzero} />;
    return null;
  };
  return (
    <div>
      <h2>{t('nav_insights')}</h2>
      <p className="muted">{t('ins_blurb')}</p>
      {STORIES.map((s) => (
        <div key={s.n} className="card">
          <div className="eyebrow">{s.n}</div>
          <h3 style={{ marginTop: 0 }}>{lang === 'zh' ? s.zh : s.en}</h3>
          <p className="card__desc">{lang === 'zh' ? s.bz : s.be}</p>
          {chartFor(s.chart)}
        </div>
      ))}
    </div>
  );
}
