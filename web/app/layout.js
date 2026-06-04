import { LangProvider } from '../lib/i18n';
import Shell from '../components/Shell';

export const metadata = {
  title: 'Climate Policy Monitor · 全球气候政策监测',
  description: '全球气候政策可视化与检索平台 · ZJU-CMIC Program on Climate and Science Communication',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, color: '#1a1a1a' }}>
        <LangProvider>
          <Shell>{children}</Shell>
        </LangProvider>
      </body>
    </html>
  );
}
