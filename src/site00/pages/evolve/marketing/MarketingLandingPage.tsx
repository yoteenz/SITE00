import { HubCta, HubPanel, HubTile, HubTileGrid, PublicHubPage } from '../../../components/public-redesign/PublicHubLayouts';
import { EVOLVE_MARKETING_CAPABILITY } from '../../../config/marketing-content';
import { MARKETING_CONTENT_SERVICES } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { SITE00_ROUTES } from '../../../config/routes';

export default function MarketingLandingPage() {
  return (
    <PublicHubPage
      section="evolve"
      page="evolve-marketing"
      envSlotId="ENV.EVOLVE.INTERVENTION_CENTER"
      tone="daylight"
      crumb={EVOLVE_MARKETING_CAPABILITY.locationLabel}
      title={
        <>
          {EVOLVE_MARKETING_CAPABILITY.entryHeadlineLine1}
          <br />
          {EVOLVE_MARKETING_CAPABILITY.entryHeadlineLine2}
        </>
      }
      subtitle={EVOLVE_MARKETING_CAPABILITY.entrySubhead}
      width="wide"
    >
      <div className="s00pr-hubactions s00pr-hubactions--first">
        <HubCta to={SITE00_ROUTES.evolveMarketingServices} variant="solid">
          {EVOLVE_MARKETING_CAPABILITY.startCta.replace(' →', '')}
        </HubCta>
      </div>
      <HubPanel label="HUMAN-CENTERED PRODUCTION">
        <p>
          CREATIVE DIRECTION · CAMPAIGN THINKING · VISUAL CONSISTENCY · STORYTELLING · CONTROLLED APPROVAL. AI IS PRODUCTION INFRASTRUCTURE — THE
          PROMISE IS PROFESSIONAL CREATIVE OUTPUT.
        </p>
      </HubPanel>
      <div className="s00pr-hubspacer" />
      <HubTileGrid columns={3}>
        {MARKETING_CONTENT_SERVICES.slice(0, 4).map((s) => (
          <HubTile key={s.id} code={s.code} title={s.title} description={s.tagline} />
        ))}
      </HubTileGrid>
      <div className="s00pr-hubactions">
        <HubCta to={SITE00_ROUTES.evolveMarketingServices}>VIEW ALL SERVICES</HubCta>
      </div>
    </PublicHubPage>
  );
}
