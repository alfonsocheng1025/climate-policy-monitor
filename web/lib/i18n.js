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
