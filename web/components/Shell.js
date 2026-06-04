'use client';
import Link from 'next/link';
import { useT } from '../lib/i18n';

export default function Shell({ children }) {
  const { t, lang, setLang } = useT();
  const link = { color: '#cde', textDecoration: 'none' };
  return (
    <>
      <header style={{ padding: '14px 24px', background: '#0b3d2e', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 18 }}>🌍 {t('brand')}</strong>
        <nav style={{ display: 'flex', gap: 16, fontSize: 14 }}>
          <Link href="/" style={link}>{t('nav_dashboard')}</Link>
          <Link href="/map" style={link}>{t('nav_map')}</Link>
          <Link href="/trends" style={link}>{t('nav_trends')}</Link>
          <Link href="/compare" style={link}>{t('nav_compare')}</Link>
          <Link href="/composition" style={link}>{t('nav_composition')}</Link>
          <Link href="/analysis" style={link}>{t('nav_analysis')}</Link>
          <Link href="/live" style={link}>{t('whatsnew')}</Link>
          <Link href="/search" style={link}>{t('nav_search')}</Link>
          <Link href="/insights" style={link}>{t('nav_insights')}</Link>
          <Link href="/data" style={link}>{t('nav_data')}</Link>
        </nav>
        <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #6a9',
            color: '#cde', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}>
          {lang === 'zh' ? 'EN' : '中'}
        </button>
      </header>
      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>{children}</main>
      <footer style={{ padding: '16px 24px', color: '#789', fontSize: 12, textAlign: 'center' }}>
        {t('foot')} · {t('program')}
      </footer>
    </>
  );
}
