import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../../../../utils/api';
import { ControlPageHeader } from '../../components/control/ControlPageHeader';
import { Site00AdminShell } from '../../components/shell/Site00AdminShell';
import { SITE00_ADMIN_ROUTES } from '../../config/routes';
import type { MarketingEngagementPayload } from '../../../../../shared/site00-marketing/types';

export default function MarketingEngagementAdminDetailPage() {
  const { engagementId = '' } = useParams();
  const [data, setData] = useState<MarketingEngagementPayload | null>(null);

  useEffect(() => {
    if (!engagementId) return;
    void apiFetch(`/api/admin/site00-marketing?action=detail&id=${encodeURIComponent(engagementId)}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [engagementId]);

  async function adminAction(action: string) {
    await apiFetch('/api/admin/site00-marketing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id: engagementId }),
    });
    const refreshed = await apiFetch(`/api/admin/site00-marketing?action=detail&id=${encodeURIComponent(engagementId)}`).then((r) => r.json());
    setData(refreshed);
  }

  if (!data) {
    return (
      <Site00AdminShell>
        <p>Loading…</p>
      </Site00AdminShell>
    );
  }

  return (
    <Site00AdminShell>
      <ControlPageHeader
        kicker="MARKETING ENGAGEMENT"
        title={data.campaignName}
        subtitle={data.engagementCode}
        actions={<Link to={SITE00_ADMIN_ROUTES.marketingEngagements}>← LIST</Link>}
      />
      <dl className="site00-admin-dl">
        <dt>STATUS</dt><dd>{data.status}</dd>
        <dt>PAYMENT</dt><dd>{data.paymentState}</dd>
        <dt>PROVISIONING</dt><dd>{data.provisioningState}</dd>
        <dt>STUDIO WORLD</dt><dd>{data.studioWorldCampaignId ?? 'NOT LINKED'}</dd>
        <dt>SYNC</dt><dd>{data.externalSyncStatus}</dd>
        <dt>CLIENT ACTION</dt><dd>{data.clientActionRequired ? data.clientActionLabel : '—'}</dd>
      </dl>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button type="button" className="site00-admin-btn" onClick={() => void adminAction('confirm-payment')}>CONFIRM PAYMENT</button>
        <button type="button" className="site00-admin-btn" onClick={() => void adminAction('provision')}>PROVISION</button>
        <button type="button" className="site00-admin-btn" onClick={() => void adminAction('sync')}>SYNC</button>
      </div>
    </Site00AdminShell>
  );
}
