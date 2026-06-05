'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useT } from '../lib/i18n';

const NAV = [
  ['/', 'nav_dashboard'], ['/map', 'nav_map'], ['/trends', 'nav_trends'],
  ['/compare', 'nav_compare'], ['/composition', 'nav_composition'], ['/analysis', 'nav_analysis'],
  ['/cross', 'nav_cross'], ['/live', 'whatsnew'], ['/search', 'nav_search'],
  ['/insights', 'nav_insights'], ['/data', 'nav_data'],
];

export default function Shell({ children }) {
  const { t, lang, setLang } = useT();
  const [theme, setTheme] = useState('dark');
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
          <Link href="/" className="brand">
            <span className="brand__logo">🌍</span>
            <span className="brand__name"><b>{t('brand')}</b><small>ZJU-CMIC</small></span>
          </Link>
          <nav className="nav">
            {NAV.map(([href, key]) => <Link key={href} href={href}>{t(key)}</Link>)}
          </nav>
          <div className="spacer" />
          <button className="icon-btn" onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <main className="container">{children}</main>
      <footer className="footer">
        <div className="container footer__inner">{t('foot')} · {t('program')}</div>
      </footer>
    </>
  );
}
