import { trends, diffusion, withTimeout } from '../../lib/db';
import TrendsClient from '../../components/TrendsClient';

// ISR: embed trends + diffusion data in the static HTML, regenerated every 30 min
// (no client-side /api round-trip on load).
export const revalidate = 1800;

async function getData() {
  try {
    const [tr, di] = await withTimeout(Promise.all([trends(), diffusion()]));
    return JSON.parse(JSON.stringify({
      adoption: (tr && tr.adoption) || [],
      stringency: (tr && tr.stringency) || [],
      diffusion: Array.isArray(di) ? di : [],
    }));
  } catch (e) {
    return { adoption: [], stringency: [], diffusion: [] };
  }
}

export default async function Page() {
  return <TrendsClient data={await getData()} />;
}
