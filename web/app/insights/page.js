'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import TrendsView from '../../components/TrendsView';

export default function InsightsPage() {
  const { t } = useT();
  const [d, setD] = useState({ adoption: [], stringency: [] });
  useEffect(() => {
    fetch('/api/trends').then((r) => r.json()).then((x) => setD(x || {})).catch(() => {});
  }, []);
  return (
    <div>
      <h2>{t('nav_insights')}</h2>
      <p style={{ color: '#567' }}>{t('ins_blurb')}</p>
      <section style={{ borderLeft: '3px solid #3da9d9', padding: '4px 0 4px 16px', margin: '18px 0' }}>
        <h3>The exponential rise of climate law / 气候立法的指数级增长</h3>
        <p style={{ color: '#444', fontSize: 14 }}>
          Cumulative climate laws and policies have grown sharply, accelerating around the 2015
          Paris Agreement — while average policy stringency rises more gradually.
          自 2015 年《巴黎协定》前后，全球气候法律与政策累计数量加速上升，而平均政策强度的提升则更为缓慢。
        </p>
        <TrendsView adoption={d.adoption} stringency={d.stringency} />
      </section>
    </div>
  );
}
