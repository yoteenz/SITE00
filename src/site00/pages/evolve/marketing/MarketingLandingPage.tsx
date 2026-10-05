import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../../../components/shell/Site00PublicShell';
import { EVOLVE_MARKETING_CAPABILITY } from '../../../config/marketing-content';
import { MARKETING_CONTENT_SERVICES } from '../../../../../shared/site00-marketing/serviceTaxonomy';
import { SITE00_ROUTES } from '../../../config/routes';

export default function MarketingLandingPage() {
  return (
    <Site00PublicShell>
      <div className="site00-marketing-landing">
        <header className="site00-marketing-landing__hero">
          <p className="site00-label-red">{EVOLVE_MARKETING_CAPABILITY.locationLabel}</p>
          <h1 className="site00-marketing-landing__headline">
            {EVOLVE_MARKETING_CAPABILITY.entryHeadlineLine1}
            <br />
            {EVOLVE_MARKETING_CAPABILITY.entryHeadlineLine2}
          </h1>
          <p className="site00-body site00-marketing-landing__sub">{EVOLVE_MARKETING_CAPABILITY.entrySubhead}</p>
          <Link className="site00-btn site00-btn--primary" to={SITE00_ROUTES.evolveMarketingServices}>
            {EVOLVE_MARKETING_CAPABILITY.startCta}
          </Link>
        </header>

        <section className="site00-marketing-landing__position">
          <p className="site00-label-red">HUMAN-CENTERED PRODUCTION</p>
          <p className="site00-body">
            CREATIVE DIRECTION · CAMPAIGN THINKING · VISUAL CONSISTENCY · STORYTELLING · CONTROLLED APPROVAL.
            AI IS PRODUCTION INFRASTRUCTURE — THE PROMISE IS PROFESSIONAL CREATIVE OUTPUT.
          </p>
        </section>

        <section className="site00-marketing-services-preview">
          <p className="site00-label-red">PRODUCTION CAPABILITIES</p>
          <div className="site00-marketing-services-preview__grid">
            {MARKETING_CONTENT_SERVICES.slice(0, 4).map((s) => (
              <article key={s.id} className="site00-marketing-service-card site00-marketing-service-card--compact">
                <span className="site00-marketing-service-card__num">{s.code}</span>
                <h2>{s.title}</h2>
                <p>{s.tagline}</p>
              </article>
            ))}
          </div>
          <Link className="site00-action-link site00-action-link--red" to={SITE00_ROUTES.evolveMarketingServices}>
            VIEW ALL SERVICES →
          </Link>
        </section>
      </div>
    </Site00PublicShell>
  );
}
