import { composition, withTimeout } from '../../lib/db';
import CompositionClient from '../../components/CompositionClient';

// ISR: embed composition data in the static HTML, regenerated every 30 min.
export const revalidate = 1800;

async function getData() {
  try {
    return JSON.parse(JSON.stringify(await withTimeout(composition())));
  } catch (e) {
    return { sectors: [], instruments: [], types: [], statuses: [] };
  }
}

export default async function Page() {
  return <CompositionClient data={await getData()} />;
}
