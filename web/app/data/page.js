'use client';
import { useEffect, useState } from 'react';
import { useT } from '../../lib/i18n';
import HarvestTable from '../../components/HarvestTable';

const LICENSES = [
  ['CPDB', 'CC-BY-4.0', 'https://climatepolicydatabase.org'],
  ['OECD CAPMF', 'OECD terms', 'https://www.oecd.org'],
  ['Climate Watch', 'CC-BY-4.0', 'https://www.climatewatchdata.org'],
  ['CPR/CCLW', 'CC-BY-4.0', 'https://climatepolicyradar.org'],
  ['World Bank', 'CC-BY-4.0', 'https://carbonpricingdashboard.worldbank.org'],
  ['Net Zero Tracker', 'CC-BY', 'https://zerotracker.net'],
];

export default function DataPage() {
  const { t } = useT();
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch('/api/harvest').then((r) => r.json())
      .then((d) => setRuns(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div>
      <h3>{t('data_title')}</h3>
      <h4>{t('harvest')}</h4>
      <HarvestTable rows={runs} />
      <h4 style={{ marginTop: 24 }}>{t('license_h')}</h4>
      <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
        <tbody>
          {LICENSES.map(([s, l, u]) => (
            <tr key={s} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 16px 6px 0', fontWeight: 600 }}>{s}</td>
              <td style={{ padding: '6px 16px 6px 0' }}>{l}</td>
              <td><a href={u} target="_blank" rel="noreferrer">{u}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4 style={{ marginTop: 24 }}>{t('download')}</h4>
      <p style={{ fontSize: 13 }}>
        <a href="/api/records?limit=1000">/api/records?limit=1000</a> ·{' '}
        <a href="/api/harvest">/api/harvest</a>
      </p>
    </div>
  );
}
