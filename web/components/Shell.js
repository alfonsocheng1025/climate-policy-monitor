'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';

const NAV = [
  ['/', 'nav_dashboard'], ['/map', 'nav_map'], ['/trends', 'nav_trends'],
  ['/compare', 'nav_compare'], ['/composition', 'nav_composition'], ['/analysis', 'nav_analysis'],
  ['/cross', 'nav_cross'], ['/live', 'whatsnew'], ['/search', 'nav_search'],
  ['/insights', 'nav_insights'], ['/methodology', 'nav_methodology'], ['/about', 'nav_about'], ['/data', 'nav_data'],
];

const SIBLINGS = [
  ['https://research.newsfindsme.com', 'Research Portal'],
  ['https://monitor.newsfindsme.com', 'News Monitor'],
  ['https://pmonitor.newsfindsme.com', 'Paper Monitor'],
];

export default function Shell({ children }) {
  const { t, lang, setLang } = useT();
  const [theme, setTheme] = useState('dark');
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    let s = null;
    try { s = localStorage.getItem('cpm_theme'); } catch (e) {}
    if (s) { setTheme(s); document.documentElement.setAttribute('data-theme', s); }
  }, []);
  const toggleTheme = () => {
    const n = theme === 'dark' ? 'light' : 'dark';
    setTheme(n);
    document.documentElement.setAttribute('data-theme', n);
    try { localStorage.setItem('cpm_theme', n); } catch (e) {}
  };
  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link href="/" className="brand" onClick={() => setMenu(false)}>
            <span className="brand__logo">🌍</span>
            <span className="brand__name"><b>{t('brand')}</b><small>{t('org')}</small></span>
          </Link>
          <nav className={'nav' + (menu ? ' nav--open' : '')}>
            {NAV.map(([href, key]) => <Link key={href} href={href} onClick={() => setMenu(false)}>{t(key)}</Link>)}
          </nav>
          <div className="spacer" />
          <button className="icon-btn" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button className="icon-btn nav-toggle" onClick={() => setMenu((m) => !m)} aria-label="menu">☰</button>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">
        <div className="container">
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-between', padding: '8px 0' }}>
            <div style={{ maxWidth: 380 }}>
              <div style={{ fontWeight: 600 }}>{t('brand')}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{t('program')}</div>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <Link href="/about">{t('nav_about')}</Link>
              <Link href="/methodology">{t('nav_methodology')}</Link>
              <Link href="/data">{t('nav_data')}</Link>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {SIBLINGS.map(([href, label]) => (
                <a key={href} href={href} target="_blank" rel="noreferrer">{label} ↗</a>
              ))}
            </div>
          </div>
          <div className="muted" style={{ fontSize: 12, borderTop: '1px solid var(--color-divider)', paddingTop: 10, marginTop: 6 }}>
            <div>{t('foot')}</div>
            <div style={{ marginTop: 4 }}>© 2026 {t('program')} · {t('foot_rights')} · {t('foot_disclaimer')}</div>
          </div>
        </div>
      </footer>
    </>
  );
}
