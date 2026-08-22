import { Link } from 'react-router-dom';
import { MARKETING_CONTENT_SERVICES } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { Site00PublicShell } from '../../../components/shell/Site00PublicShell';
import { site00EvolveMarketingIntake } from '../../../config/routes';
import type { MarketingServiceCategory } from '../../../../../shared/site00-marketing/types';

function ServiceCard({ service }: { service: (typeof MARKETING_CONTENT_SERVICES)[number] }) {
  return (
    <article className="site00-marketing-service-card">
      <span className="site00-marketing-service-card__num">{service.code}</span>
      <h2>{service.title}</h2>
      <p className="site00-marketing-service-card__tag">{service.tagline}</p>
      <p className="site00-body">{service.whatItIs}</p>
      <div className="site00-marketing-service-card__meta">
        <p><strong>BEST FOR</strong> {service.bestFor}</p>
        <p><strong>PLATFORMS</strong> {service.platforms.join(' · ')}</p>
      </div>
      <ul className="site00-marketing-service-card__produces">
        {service.produces.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <Link className="site00-btn site00-btn--ghost" to={site00EvolveMarketingIntake(service.id as MarketingServiceCategory)}>
        {service.selectCta}
      </Link>
    </article>
  );
}

export default function MarketingServicesPage() {
  return (
    <Site00PublicShell>
      <div className="site00-marketing-services">
        <header>
          <p className="site00-label-red">EVOLVE / MARKETING & CONTENT</p>
          <h1 className="site00-panel-title">SELECT PRODUCTION SERVICE</h1>
          <p className="site00-body">CAMPAIGN DIRECTION AND CONTENT PRODUCTION — NOT GENERIC AI OUTPUT.</p>
        </header>
        <div className="site00-marketing-services__grid">
          {MARKETING_CONTENT_SERVICES.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </Site00PublicShell>
  );
}
