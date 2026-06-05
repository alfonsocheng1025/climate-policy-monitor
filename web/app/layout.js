import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { LangProvider } from '../lib/i18n';
import Shell from '../components/Shell';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const jb = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jb', display: 'swap' });

export const metadata = {
  title: 'Climate Policy Monitor · 全球气候政策监测',
  description: '全球气候政策可视化与检索平台 · ZJU-CMIC Program on Climate and Science Communication',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh" data-theme="dark" className={`${sans.variable} ${jb.variable}`}>
      <body>
        <LangProvider>
          <Shell>{children}</Shell>
        </LangProvider>
      </body>
    </html>
  );
}
