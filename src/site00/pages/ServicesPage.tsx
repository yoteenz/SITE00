import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../components/pages/Site00PagePrimitives';
import { SITE00_SERVICES_SEED } from '../config/seed/site00-page-seed';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';

export default function ServicesPage() {
  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--services">
        <PageIntro title={<BracketHeading>SERVICES</BracketHeading>} subtitle="WHAT WE BUILD." />
        <div className="site00-services-grid site00-services-grid--capabilities">
          {SITE00_SERVICES_SEED.map((service) => (
            <article key={service.id} id={service.id} className="site00-service-card site00-service-card--capability">
              <h2 className="site00-service-card__title">{service.title}</h2>
              <p className="site00-service-card__desc">{service.description}</p>
              <Link to={service.href} className="site00-link-red">
                {service.cta}
              </Link>
            </article>
          ))}
        </div>
        <section className="site00-page-banner">
          <p className="site00-label-red">NEED SOMETHING ELSE?</p>
          <Link to={SITE00_ROUTES.support} className="site00-link-red">
            CONTACT SUPPORT →
          </Link>
        </section>
      </div>
    </Site00PublicShell>
  );
}
