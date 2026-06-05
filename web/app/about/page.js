'use client';
import { useT } from '../../lib/i18n';

const SIBLINGS = [
  { href: 'https://research.newsfindsme.com', zh: '研究门户', en: 'Research Portal', dz: '计划总入口', de: 'Program hub' },
  { href: 'https://monitor.newsfindsme.com', zh: '新闻监测', en: 'News Monitor', dz: '气候新闻实时监测', de: 'Real-time climate news' },
  { href: 'https://pmonitor.newsfindsme.com', zh: '论文监测', en: 'Paper Monitor', dz: '气候学术论文监测', de: 'Climate research papers' },
];

const SOURCES = [
  ['CPDB', 'NewClimate Institute — Climate Policy Database'],
  ['OECD CAPMF', 'OECD — Climate Actions and Policies Measurement Framework'],
  ['Climate Watch', 'World Resources Institute (WRI)'],
  ['CPR / CCLW', 'Climate Policy Radar · Grantham Research Institute, LSE'],
  ['World Bank', 'World Bank — Carbon Pricing Dashboard'],
  ['Net Zero Tracker', 'NewClimate / Oxford Net Zero / ECIU / Data-Driven EnviroLab'],
  ['UNFCCC NDC', 'UNFCCC NDC Registry (via openclimatedata)'],
  ['EUR-Lex', 'EU Publications Office (CELLAR / EuroVoc)'],
];

export default function AboutPage() {
  const { t, lang } = useT();
  const zh = lang === 'zh';
  return (
    <div>
      <h2>{t('nav_about')}</h2>

      <div className="card">
        <div className="eyebrow">{zh ? '项目说明' : 'About'}</div>
        <h3 style={{ marginTop: 0 }}>{t('brand')}</h3>
        <p className="card__desc">{zh
          ? '全球气候政策监测整合 7+ 个权威数据源、约 67 万条记录,对全球气候相关的法律、政策、NDC 与净零承诺、碳定价等进行统一采集、归一化、可视化与交叉分析,服务研究、教学与政策观察。'
          : 'The Climate Policy Monitor unifies 7+ authoritative sources and ~670k records — climate laws & policies, NDCs and net-zero pledges, carbon pricing and more — into one harvested, normalized, visualized and cross-analyzable platform for research, teaching and policy watching.'}</p>
        <p className="card__desc">{zh
          ? '本站是「气候与科学传播研究计划 (Program on Climate and Science Communication)」监测家族的一员,与新闻监测、论文监测互为补充,共同观察气候议题在政策、媒体与学界之间的流动。'
          : 'It is part of the Program on Climate and Science Communication’s family of monitors — alongside the news and paper monitors — together tracking how climate issues move across policy, media and research.'}</p>
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '监测家族' : 'Monitor family'}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
          {SIBLINGS.map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="card"
              style={{ flex: '1 1 220px', textDecoration: 'none', margin: 0 }}>
              <div style={{ fontWeight: 600 }}>{(zh ? s.zh : s.en)} ↗</div>
              <div className="muted" style={{ fontSize: 13 }}>{zh ? s.dz : s.de}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '数据致谢' : 'Data acknowledgements'}</div>
        <p className="card__desc">{zh
          ? '本站汇集并再加工以下机构公开发布的数据,谨致谢忱。各数据集的权利归原机构所有,使用请遵循其各自的许可与引用要求:'
          : 'This monitor aggregates and re-processes openly published data from the following organizations, with gratitude. Rights in each dataset remain with the originating organization; please follow their respective licenses and citation requirements:'}</p>
        <ul className="muted" style={{ fontSize: 13, lineHeight: 1.85 }}>
          {SOURCES.map(([a, b]) => <li key={a}><b style={{ color: 'var(--color-text)' }}>{a}</b> — {b}</li>)}
        </ul>
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '免责声明' : 'Disclaimer'}</div>
        <p className="card__desc">{zh
          ? '本站仅供研究与教育用途。数据经自动采集与归一化处理,可能存在延迟、缺失、重复或映射误差,按“现状”提供,不作任何明示或默示的保证,亦不构成法律、投资或政策建议。一切以官方原始来源为准。'
          : 'This site is for research and educational use only. Data is automatically harvested and normalized and may contain latency, gaps, duplication or mapping errors. It is provided “as is” without warranty of any kind and does not constitute legal, investment or policy advice. Always defer to the official primary sources.'}</p>
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '权属与许可' : 'Ownership & license'}</div>
        <p className="card__desc">{zh
          ? '本平台的代码、设计与衍生可视化由「气候与科学传播研究计划」开发与维护,由浙江大学 CMIC 运营。原始数据集的著作权归各数据提供方所有。衍生的聚合视图与图表可在注明出处的前提下用于非商业的研究与教学。'
          : 'The platform’s code, design and derived visualizations are developed and maintained by the Program on Climate and Science Communication (operated by ZJU-CMIC). Copyright in the underlying datasets belongs to their respective providers. Derived aggregate views and charts may be used for non-commercial research and teaching with attribution.'}</p>
        <p className="muted" style={{ fontSize: 12 }}>© 2026 {t('program')} · {t('foot_rights')}</p>
      </div>
    </div>
  );
}
