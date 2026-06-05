const base = 'https://cpmonitor.newsfindsme.com';
const paths = [
  '', '/map', '/trends', '/compare', '/composition', '/analysis',
  '/cross', '/live', '/search', '/insights', '/methodology', '/about', '/data',
];

export default function sitemap() {
  return paths.map((p) => ({
    url: base + p,
    changeFrequency: p === '' ? 'daily' : 'weekly',
    priority: p === '' ? 1 : 0.7,
  }));
}
