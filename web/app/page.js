import { getKpis, adoptionByYear, mapMetric, whatsNew } from '../lib/db';
import DashboardClient from '../components/DashboardClient';

// ISR: render the dashboard to static HTML with the data already embedded,
// regenerated on the server every 30 min. This removes the client-side
// /api/dashboard round-trip — one fewer slow request on poor networks.
export const revalidate = 1800;

async function getData() {
  try {
    const [kpis, adoption, map, news] = await Promise.all([
      getKpis(), adoptionByYear(), mapMetric('coverage'), whatsNew(8),
    ]);
    // JSON-normalize so postgres.js rows / Date values serialize cleanly to the
    // client component.
    return JSON.parse(JSON.stringify({ kpis, adoption, map, news }));
  } catch (e) {
    // Build/dev without DB reachability falls back to empty; ISR fills it in on
    // the server (Vercel) where Postgres is reachable.
    return { kpis: null, adoption: [], map: [], news: [] };
  }
}

export default async function Page() {
  const data = await getData();
  return <DashboardClient data={data} />;
}
