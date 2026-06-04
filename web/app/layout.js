export const metadata = {
  title: 'Climate Policy Platform',
  description: '全球气候政策可视化与检索平台',
};
export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header style={{ padding: '16px 24px', background: '#0b3d2e', color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>🌍 全球气候政策平台</h1>
          <nav style={{ marginTop: 8 }}>
            <a href="/" style={{ color: '#cde', marginRight: 16 }}>看板</a>
            <a href="/search" style={{ color: '#cde' }}>全文检索</a>
          </nav>
        </header>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  );
}
