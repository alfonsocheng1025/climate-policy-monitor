'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export const DICT = {
  zh: {
    brand: '全球气候政策监测',
    nav_dashboard: '看板', nav_map: '地图', nav_search: '检索', nav_data: '数据',
    kpi_policies: '政策总数', kpi_countries: '覆盖国家', kpi_new: '今年新增',
    kpi_stringency: '平均强度', kpi_netzero: '净零承诺', kpi_last: '上次采集',
    m_coverage: '覆盖', m_stringency: '强度', m_price: '碳价', m_netzero: '净零',
    metric: '指标', whatsnew: '新动态', viewall: '查看全部', loading: '加载中…',
    nodata: '暂无数据', growth: '累计气候立法 1990→今', coverage_title: '全球政策覆盖',
    search_ph: '输入关键词，如 carbon tax / 碳市场', search_btn: '搜索',
    f_country: '国家 ISO-3（如 CHN）', f_all: '全部', f_sector: '部门', f_status: '状态',
    f_type: '类型', th_country: '国家', th_title: '政策/法律', th_sector: '部门',
    th_status: '状态', th_metric: '指标', th_type: '类型',
    data_title: '数据与透明度', harvest: '采集运行（各源最近一次）', license_h: '许可与引用',
    download: '批量下载', th_src: '来源', th_fetched: '抓取', th_upserted: '入库',
    th_new: '新增', th_err: '错误', th_lastrun: '最近运行', th_status2: '状态',
    pdf: '原文', detail: '详情', listcount: '政策列表',
    db_note: '数据库未配置或为空 —— 配置 Supabase 并运行采集后将自动填充。',
    nav_trends: '趋势', nav_compare: '对比', nav_composition: '构成', nav_insights: '洞察',
    t_growth: '气候立法累计增长', t_stringency: '政策强度趋势（CAPMF 均值）',
    cmp_pick: '国家 ISO-3，逗号分隔（如 DEU,CHN,USA）', cmp_go: '对比',
    cmp_heatmap: '政策覆盖热力图（国家 × 部门）', cmp_stringency: '平均强度', cmp_netzero: '净零目标年',
    comp_sectors: '部门分布', comp_types: '记录类型', comp_instruments: '政策工具（前 20）', comp_status: '状态分布',
    ctry_policies: '政策数', ctry_avgstr: '平均强度', ctry_netzero: '净零年', ctry_price: '碳价',
    ctry_traj: '强度轨迹 1990–2023', ctry_records: '记录清单',
    ins_blurb: '用数据讲述气候政策的故事——在上面的图表上加注解。',
    nav_analysis: '分析',
    diff_title: '政策扩散（累计采纳国数）', diff_blurb: '各类政策工具在各国的扩散——累计采纳国家数随时间变化（典型 S 曲线）。',
    analysis_blurb: '融合多源后才能呈现的交叉分析。',
    bd_title: '广度 × 深度', bd_blurb: '横轴政策数量（广度）、纵轴 CAPMF 平均强度（深度）——“政策多但弱”一眼看穿。',
    bd_x: '政策数量', bd_y: '平均强度（0–10）',
    nz_title: '净零阶梯', nz_blurb: '各国净零目标年（横轴）× 法律效力（纵轴/颜色）。',
    lev2_title: '强度热力图（国家 × CAPMF 15 个政策领域）',
    lev2_blurb: '输入国家 ISO-3（逗号分隔）对比各政策领域的强度（0–10）。',
    lf1: '提议', lf2: '宣示', lf3: '政策', lf4: '立法', lf5: '已实现',
    foot: '数据来源 Sources: CPDB · OECD CAPMF · Climate Watch · CPR/CCLW · World Bank · Net Zero Tracker',
    program: 'ZJU-CMIC 气候与科学传播研究计划',
  },
  en: {
    brand: 'Climate Policy Monitor',
    nav_dashboard: 'Dashboard', nav_map: 'Map', nav_search: 'Search', nav_data: 'Data',
    kpi_policies: 'Policies', kpi_countries: 'Countries', kpi_new: 'New this year',
    kpi_stringency: 'Avg stringency', kpi_netzero: 'Net-zero pledges', kpi_last: 'Last harvest',
    m_coverage: 'Coverage', m_stringency: 'Stringency', m_price: 'Carbon price', m_netzero: 'Net-zero',
    metric: 'Metric', whatsnew: "What's New", viewall: 'View all', loading: 'Loading…',
    nodata: 'No data', growth: 'Cumulative climate laws 1990→now', coverage_title: 'Global policy coverage',
    search_ph: 'Keyword, e.g. carbon tax / 碳市场', search_btn: 'Search',
    f_country: 'Country ISO-3 (e.g. CHN)', f_all: 'All', f_sector: 'Sector', f_status: 'Status',
    f_type: 'Type', th_country: 'Country', th_title: 'Policy / law', th_sector: 'Sector',
    th_status: 'Status', th_metric: 'Metric', th_type: 'Type',
    data_title: 'Data & Transparency', harvest: 'Harvest runs (latest per source)', license_h: 'License & citation',
    download: 'Bulk download', th_src: 'Source', th_fetched: 'Fetched', th_upserted: 'Upserted',
    th_new: 'New', th_err: 'Errors', th_lastrun: 'Last run', th_status2: 'Status',
    pdf: 'PDF', detail: 'Details', listcount: 'Records',
    db_note: 'Database not configured or empty — it will populate once Supabase is set up and ingest runs.',
    nav_trends: 'Trends', nav_compare: 'Compare', nav_composition: 'Composition', nav_insights: 'Insights',
    t_growth: 'Cumulative climate laws & policies', t_stringency: 'Policy stringency trend (avg CAPMF)',
    cmp_pick: 'Country ISO-3, comma-separated (e.g. DEU,CHN,USA)', cmp_go: 'Compare',
    cmp_heatmap: 'Policy coverage heatmap (country × sector)', cmp_stringency: 'Avg stringency', cmp_netzero: 'Net-zero target year',
    comp_sectors: 'By sector', comp_types: 'Record types', comp_instruments: 'Policy instruments (top 20)', comp_status: 'By status',
    ctry_policies: 'Policies', ctry_avgstr: 'Avg stringency', ctry_netzero: 'Net-zero year', ctry_price: 'Carbon price',
    ctry_traj: 'Stringency trajectory 1990–2023', ctry_records: 'Records',
    ins_blurb: 'Telling the climate-policy story with data — annotated views built on the charts.',
    nav_analysis: 'Analysis',
    diff_title: 'Policy diffusion (cumulative adopters)', diff_blurb: 'How instrument families spread across countries over time (the classic S-curve).',
    analysis_blurb: 'Cross-analyses unlocked by fusing the sources.',
    bd_title: 'Breadth × Depth', bd_blurb: 'Policy count (breadth) vs avg CAPMF stringency (depth) — spot "many but weak".',
    bd_x: 'Number of policies', bd_y: 'Avg stringency (0–10)',
    nz_title: 'Net-zero ladder', nz_blurb: 'Net-zero target year (x) × legal force (y / colour).',
    lev2_title: 'Stringency heatmap (country × CAPMF LEV2 areas)',
    lev2_blurb: 'Enter country ISO-3 (comma-separated) to compare stringency by policy area (0–10).',
    lf1: 'Proposed', lf2: 'Declared', lf3: 'In policy', lf4: 'In law', lf5: 'Achieved',
    foot: 'Sources: CPDB · OECD CAPMF · Climate Watch · CPR/CCLW · World Bank · Net Zero Tracker',
    program: 'ZJU-CMIC Program on Climate and Science Communication',
  },
};

const Ctx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('zh');
  useEffect(() => {
    try { const s = localStorage.getItem('cpm_lang'); if (s) setLang(s); } catch (e) {}
  }, []);
  const set = (l) => { setLang(l); try { localStorage.setItem('cpm_lang', l); } catch (e) {} };
  const t = (k) => (DICT[lang] && DICT[lang][k]) || DICT.zh[k] || k;
  return <Ctx.Provider value={{ lang, setLang: set, t }}>{children}</Ctx.Provider>;
}

export function useT() {
  return useContext(Ctx) || { lang: 'zh', setLang: () => {}, t: (k) => k };
}
