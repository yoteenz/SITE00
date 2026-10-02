import { HubCta, PublicHubPage } from '../../../components/public-redesign/PublicHubLayouts';
import { MARKETING_CONTENT_SERVICES } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { site00EvolveMarketingIntake } from '../../../config/routes';
import type { MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';

function ServiceCard({ service }: { service: (typeof MARKETING_CONTENT_SERVICES)[number] }) {
  return (
    <article className="s00pr-hubtile s00pr-hubtile--service">
      <span className="s00pr-hubtile__corner" aria-hidden="true" />
      <span className="s00pr-hubtile__head">
        <b className="s00pr-hubtile__code">{service.code}</b>
      </span>
      <strong className="s00pr-hubtile__title">{service.title}</strong>
      <span className="s00pr-hubtile__tag">{service.tagline}</span>
      <span className="s00pr-hubtile__desc">{service.whatItIs}</span>
      <span className="s00pr-hubtile__desc">
        <b>BEST FOR</b> {service.bestFor}
      </span>
      <span className="s00pr-hubtile__desc">
        <b>PLATFORMS</b> {service.platforms.join(' · ')}
      </span>
      <ul className="s00pr-hubtile__list">
        {service.produces.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <HubCta to={site00EvolveMarketingIntake(service.id as MarketingServiceCategory)}>{service.selectCta.replace(/\s*[→›]\s*$/, '')}</HubCta>
    </article>
  );
}

export default function MarketingServicesPage() {
  return (
    <PublicHubPage
      section="evolve"
      page="evolve-marketing-services"
      envSlotId="ENV.EVOLVE.INTERVENTION_CENTER"
      tone="daylight"
      crumb="EVOLVE / MARKETING & CONTENT"
      title="SELECT PRODUCTION SERVICE"
      subtitle="CAMPAIGN DIRECTION AND CONTENT PRODUCTION — NOT GENERIC AI OUTPUT."
      width="wide"
    >
      <div className="s00pr-hubgrid s00pr-hubgrid--3">
        {MARKETING_CONTENT_SERVICES.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </PublicHubPage>
  );
}
