'use client';
import { useT } from '../../lib/i18n';

const SOURCES = [
  { k: 'CPDB', zh: '结构化政策字段:部门、工具、状态、决策年份(NewClimate 气候政策数据库)。', en: 'Structured policy fields: sector, instrument, status, decision year (NewClimate Climate Policy Database).' },
  { k: 'OECD CAPMF', zh: '政策强度评分(0–10)与政策计数,覆盖约 50 个 OECD/伙伴国,含 4 级政策领域层级。', en: 'Policy stringency scores (0–10) and policy counts for ~50 OECD/partner countries, with a 4-level policy-area hierarchy.' },
  { k: 'Climate Watch', zh: 'NDC / 长期战略 / 净零内容(WRI),按国家的键值对。', en: 'NDC / LTS / net-zero content (WRI), as per-country key–values.' },
  { k: 'CPR / CCLW', zh: '法律与政策目录元数据与知识图谱概念(Climate Policy Radar / LSE);本站仅收录目录,不含全文,但保留可回溯链接。', en: 'Law & policy catalog metadata and knowledge-graph concepts (Climate Policy Radar / LSE). Catalog only — no full text — but with traceable links.' },
  { k: 'World Bank', zh: '碳定价工具的现行价格与覆盖(碳定价仪表盘)。', en: 'Current carbon-pricing instrument prices and coverage (Carbon Pricing Dashboard).' },
  { k: 'Net Zero Tracker', zh: '净零目标年份与法律效力(提议→已实现)。', en: 'Net-zero target years and legal force (proposed → achieved).' },
  { k: 'UNFCCC NDC', zh: '国家自主贡献登记信息(经 openclimatedata 镜像)。', en: 'Nationally Determined Contributions registry (via the openclimatedata mirror).' },
  { k: 'EUR-Lex', zh: '欧盟气候相关法规(CELLAR / EuroVoc 概念)。', en: 'EU climate-related legislation (CELLAR / EuroVoc concepts).' },
];

const METRICS = [
  { k: 'coverage', zh: '覆盖(广度):一国已收录的法律/政策数量。衡量“有多少政策”,不含 NDC 或强度评分。', en: 'Coverage (breadth): number of recorded laws/policies for a country — “how many policies”, excluding NDCs/stringency.' },
  { k: 'stringency', zh: '强度(深度):OECD CAPMF 政策强度 0–10 的均值。衡量“政策有多有力”,仅约 50 国有数据。', en: 'Stringency (depth): mean OECD CAPMF stringency 0–10 — “how strong”, available for ~50 countries.' },
  { k: 'carbon price', zh: '碳价:世界银行碳定价工具的现行价格(USD/tCO₂e),取该国最高值。', en: 'Carbon price: current World Bank pricing-instrument price (USD/tCO₂e), max per country.' },
  { k: 'net-zero', zh: '净零:净零目标年份(越早=颜色越深)与其法律效力。', en: 'Net-zero: target year (earlier = darker) and its legal force.' },
  { k: 'legal force', zh: '法律效力阶梯:提议 → 宣示 → 政策文件 → 写入法律 → 已实现。', en: 'Legal-force ladder: proposed → declared → in policy → in law → achieved.' },
  { k: 'instrument families', zh: '政策工具族(7 类):碳定价、管制、补贴/财政、目标/治理、研发/创新、信息/自愿、国际/资金合作。', en: 'Instrument families (7): carbon pricing, regulation, subsidy/fiscal, target/governance, RD&D/innovation, information/voluntary, international finance/cooperation.' },
  { k: 'diffusion', zh: '政策扩散:某类工具的累计采纳国家数随时间变化(典型 S 曲线)。', en: 'Diffusion: cumulative number of adopter countries for an instrument over time (the classic S-curve).' },
];

const CAVEATS = [
  { zh: 'CAPMF 强度是“国家级平均”,并非逐条政策的分数——同一国家的所有政策显示同一均值。', en: 'CAPMF stringency is a country-level average, not per-policy — every policy of a country shows the same mean.' },
  { zh: 'CPR 仅收录目录元数据,不含全文(保留来源链接以便回溯)。', en: 'CPR is catalog metadata only, no full text (source links retained for traceability).' },
  { zh: '全文检索使用 Postgres simple 配置(不做词干还原),以兼容多语言(中英混合)内容。', en: 'Full-text search uses the Postgres “simple” config (no stemming) for multilingual (Chinese + English) content.' },
  { zh: '跨监测对比中,政策/新闻/论文三条线各按自身峰值归一化(0–100),只比趋势形状,不比绝对量。', en: 'In the cross-monitor view, the policy/news/papers lines are each normalized to their own peak (0–100) — compare trend shape, not absolute volume.' },
];

export default function MethodologyPage() {
  const { t, lang } = useT();
  const zh = lang === 'zh';
  const DL = ({ rows }) => (
    <dl style={{ margin: 0 }}>
      {rows.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <dt style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.k}</dt>
          <dd className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{zh ? r.zh : r.en}</dd>
        </div>
      ))}
    </dl>
  );
  return (
    <div>
      <h2>{zh ? '数据与指标说明' : 'Data & Methodology'}</h2>
      <p className="muted">{zh ? '本站如何获取数据、各指标的含义,以及需要注意的口径问题。' : 'How the data is sourced, what each metric means, and important caveats.'}</p>

      <div className="card">
        <div className="eyebrow">{zh ? '数据来源' : 'Data sources'}</div>
        <h3 style={{ marginTop: 0 }}>{zh ? '每个源贡献什么' : 'What each source contributes'}</h3>
        <DL rows={SOURCES} />
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '指标说明' : 'Metric definitions'}</div>
        <h3 style={{ marginTop: 0 }}>{zh ? '图表里的指标含义' : 'What the metrics mean'}</h3>
        <DL rows={METRICS} />
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '重要注意' : 'Caveats'}</div>
        <ul className="muted" style={{ fontSize: 13, lineHeight: 1.85 }}>
          {CAVEATS.map((c, i) => <li key={i}>{zh ? c.zh : c.en}</li>)}
        </ul>
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '更新频率' : 'Update cadence'}</div>
        <p className="card__desc">{zh
          ? '批量数据每月经 GitHub Actions 全量重采;实时性较强的源每日增量更新。看板与图表数据在服务端每 30 分钟再生一次。'
          : 'Bulk datasets are re-harvested monthly via GitHub Actions; faster-moving sources update daily. Dashboard and chart data are regenerated server-side every 30 minutes.'}</p>
      </div>

      <div className="card">
        <div className="eyebrow">{zh ? '建议引用' : 'Suggested citation'}</div>
        <p className="card__desc" style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          {zh
            ? '气候与科学传播研究计划(2026).全球气候政策监测. https://cpmonitor.newsfindsme.com'
            : 'Program on Climate and Science Communication (2026). Climate Policy Monitor. https://cpmonitor.newsfindsme.com'}
        </p>
        <p className="muted" style={{ fontSize: 12 }}>{t('foot_disclaimer')}</p>
      </div>
    </div>
  );
}
