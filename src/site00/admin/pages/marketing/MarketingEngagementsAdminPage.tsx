import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../../utils/api';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { MarketingEngagementRecord } from '../../../../../shared/site00-marketing/types';

export default function MarketingEngagementsAdminPage() {
  const [engagements, setEngagements] = useState<MarketingEngagementRecord[]>([]);
  const [integrationStatus, setIntegrationStatus] = useState('MOCKED');

  useEffect(() => {
    void apiFetch('/api/admin/site00-marketing?action=list')
      .then((r) => r.json())
      .then((d: { engagements: MarketingEngagementRecord[]; integrationStatus: string }) => {
        setEngagements(d.engagements ?? []);
        setIntegrationStatus(d.integrationStatus ?? 'MOCKED');
      })
      .catch(() => setEngagements([]));
  }, []);

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="00 / CONTROL · EVOLVE"
        title="MARKETING & CONTENT ENGAGEMENTS"
        subtitle={`STUDIO WORLD: ${integrationStatus}`}
      />
      <table className="site00-admin-table">
        <thead>
          <tr>
            <th>CODE</th>
            <th>CAMPAIGN</th>
            <th>SERVICE</th>
            <th>STATUS</th>
            <th>PAYMENT</th>
            <th>SW ID</th>
          </tr>
        </thead>
        <tbody>
          {engagements.map((e) => (
            <tr key={e.id}>
              <td><Link to={SITE00_ADMIN_ROUTES.marketingEngagement(e.id)}>{e.engagementCode}</Link></td>
              <td>{e.campaignName}</td>
              <td>{e.serviceCategory}</td>
              <td>{e.status}</td>
              <td>{e.paymentState}</td>
              <td>{e.studioWorldCampaignId ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Site00AdminShell>
  );
}
