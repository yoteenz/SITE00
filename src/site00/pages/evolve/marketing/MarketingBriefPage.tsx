import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMarketingService } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { Site00AccountRouteGuard } from '../../../components/guards/Site00AccountRouteGuard';
import { HubLegacySkin, PublicHubPage } from '../../../components/public-redesign/PublicHubLayouts';
import { site00EvolveMarketingEngagement, site00EvolveMarketingIntake } from '../../../config/routes';
import type { MarketingEngagementPayload } from '../../../../../shared/site00-marketing/types';
import { marketingEngagementApi } from '../../../services/marketingEngagementApi';

export default function MarketingBriefPage() {
  const { engagementId = '' } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<MarketingEngagementPayload | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!engagementId) return;
    void marketingEngagementApi.detail(engagementId).then(setData).catch(() => setData(null));
  }, [engagementId]);

  if (!data) {
    return (
      <PublicHubPage section="evolve" page="evolve-marketing-brief" tone="daylight" crumb="EVOLVE / MARKETING & CONTENT" title="CAMPAIGN BRIEF SUMMARY" width="narrow">
        <p className="s00pr-hubstatus" role="status">LOADING BRIEF…</p>
      </PublicHubPage>
    );
  }

  const service = getMarketingService(data.serviceCategory);
  const intake = data.intake ?? {};

  async function handleAuthorize() {
    setBusy(true);
    try {
      await marketingEngagementApi.authorize(data!.id);
      await marketingEngagementApi.confirmPayment(data!.id);
      await marketingEngagementApi.provision(data!.id);
      navigate(site00EvolveMarketingEngagement(data!.id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Site00AccountRouteGuard>
      <PublicHubPage section="evolve" page="evolve-marketing-brief" tone="daylight" crumb="EVOLVE / MARKETING & CONTENT" title="CAMPAIGN BRIEF SUMMARY" width="default">
        <HubLegacySkin kind="brief" className="site00-marketing-brief">

          {data.reusedIdentity ? (
            <div className="site00-marketing-brief__reuse">
              <p className="site00-label-red">IDENTITY FOUND.</p>
              <p>SITE 00 CAN CARRY YOUR EXISTING APPROVED IDENTITY INTO THIS EVOLUTION.</p>
            </div>
          ) : data.brandSetupRequired ? (
            <div className="site00-marketing-brief__reuse site00-marketing-brief__reuse--warn">
              <p className="site00-label-red">BRAND SETUP REQUIRED</p>
            </div>
          ) : null}

          <dl className="site00-marketing-brief__grid">
            <div><dt>OBJECTIVE</dt><dd>{intake.campaignObjective ?? '—'}</dd></div>
            <div><dt>SERVICE</dt><dd>{service?.title ?? data.serviceCategory}</dd></div>
            <div><dt>PLATFORMS</dt><dd>{(intake.platforms ?? []).join(' · ') || '—'}</dd></div>
            <div><dt>DELIVERABLES</dt><dd>{(intake.deliverableTypes ?? []).join(' · ') || '—'}</dd></div>
            <div><dt>TIMELINE</dt><dd>{intake.deadline ?? intake.quantityCadence ?? '—'}</dd></div>
            <div><dt>SCOPE STATUS</dt><dd>{data.status.replace(/_/g, ' ')}</dd></div>
          </dl>

          <div className="site00-marketing-brief__actions">
            <Link className="site00-btn site00-btn--ghost" to={site00EvolveMarketingIntake(data.serviceCategory)}>
              EDIT
            </Link>
            <button type="button" className="site00-btn site00-btn--primary" disabled={busy} onClick={() => void handleAuthorize()}>
              AUTHORIZE & ENTER YOUR SPACE →
            </button>
          </div>
          <p className="site00-marketing-note">Production provisions only after server-side payment confirmation.</p>
        </HubLegacySkin>
      </PublicHubPage>
    </Site00AccountRouteGuard>
  );
}
