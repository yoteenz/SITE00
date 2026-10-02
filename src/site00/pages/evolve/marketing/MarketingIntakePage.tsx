import { useNavigate, useParams } from 'react-router-dom';
import { getMarketingService } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import type { MarketingIntakeRecord, MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';
import { formStateToIntakeRecord } from '../../../../../shared/site00-marketing/creativeIntake/fieldMapping';
import { Site00AccountRouteGuard } from '../../../components/guards/Site00AccountRouteGuard';
import { HubCta, HubLegacySkin, PublicHubPage } from '../../../components/public-redesign/PublicHubLayouts';
import { CreativeIntakeEngine } from '../../../components/evolve/creative-intake/CreativeIntakeEngine';
import { SITE00_ROUTES, site00EvolveMarketingBrief } from '../../../config/routes';
import { marketingEngagementApi } from '../../../services/marketingEngagementApi';
import { useState } from 'react';
import '../../../styles/site00-creative-intake.css';

export default function MarketingIntakePage() {
  const { serviceId = 'campaign' } = useParams();
  const navigate = useNavigate();
  const service = getMarketingService(serviceId as MarketingServiceCategory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service) {
    return (
      <PublicHubPage section="evolve" page="evolve-marketing-intake" tone="daylight" crumb="EVOLVE / MARKETING & CONTENT" title="UNKNOWN SERVICE." width="narrow">
        <HubCta to={SITE00_ROUTES.evolveMarketingServices}>SERVICES</HubCta>
      </PublicHubPage>
    );
  }

  async function handleComplete(intake: MarketingIntakeRecord) {
    setBusy(true);
    setError(null);
    try {
      const engagement = await marketingEngagementApi.create(
        service!.id,
        intake.businessName ?? intake.campaignObjective ?? 'UNTITLED PROJECT',
      );
      await marketingEngagementApi.updateIntake(engagement.id, intake, true);
      localStorage.removeItem(`site00_creative_intake_draft_v1_${service!.id}`);
      navigate(site00EvolveMarketingBrief(engagement.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'COULD NOT SAVE INTAKE');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Site00AccountRouteGuard>
      <PublicHubPage
        section="evolve"
        page="evolve-marketing-intake"
        tone="daylight"
        crumb="LOCATION / EVOLVE / MARKETING"
        title={service.title}
        subtitle={service.tagline}
        width="default"
      >
        <HubLegacySkin kind="intake">
          <CreativeIntakeEngine
            service={service}
            busy={busy}
            onComplete={(form) => void handleComplete(formStateToIntakeRecord(form))}
          />
          {error ? <p className="site00-marketing-error">{error.toUpperCase()}</p> : null}
        </HubLegacySkin>
      </PublicHubPage>
    </Site00AccountRouteGuard>
  );
}
