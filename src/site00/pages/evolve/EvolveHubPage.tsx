import { Link } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { SITE00_ROUTES } from '../../config/routes';
import {
  EVOLVE_FRAMEWORK_PILLARS,
  EVOLVE_HUB_SECTIONS,
  EVOLVE_PROCESS_STEPS,
  EVOLVE_HOMEPAGE_EXPANDED,
} from '../../config/evolve';
import { getCapabilitiesByCategory } from '../../config/capability-registry';
import { EvolvePathIcon } from '../../components/evolve/EvolvePathIcon';

const capabilityGroups = getCapabilitiesByCategory('evolve');

export default function EvolveHubPage() {
  return (
    <Site00PublicShell mobileActiveNav="origin">
      <div className="site00-page site00-page--evolve-hub">
        <PageIntro
          title={<BracketHeading>EVOLVE</BracketHeading>}
          subtitle={EVOLVE_HOMEPAGE_EXPANDED.subtitle}
        />
        <nav className="site00-evolve-hub-nav" aria-label="EVOLVE sections">
          {EVOLVE_HUB_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="site00-evolve-hub-nav__link">
              {section.label}
            </a>
          ))}
        </nav>

        <section id="overview" className="site00-evolve-hub-section">
          <p className="site00-label-red">OVERVIEW</p>
          <p className="site00-body">{EVOLVE_HOMEPAGE_EXPANDED.overview}</p>
        </section>

        <section id="paths" className="site00-evolve-hub-section">
          <p className="site00-label-red">PATHS</p>
          <div className="site00-evolve-path-grid">
            {EVOLVE_FRAMEWORK_PILLARS.map((pillar) => (
              <article key={pillar.id} className="site00-evolve-path-card">
                <EvolvePathIcon id={pillar.icon} title={pillar.title} size={56} />
                <h2 className="site00-heading">{pillar.title}</h2>
                <p className="site00-body">{pillar.description}</p>
                <Link to={SITE00_ROUTES.evolveState} className="site00-link-red">
                  SELECT PATH →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="site00-evolve-hub-section">
          <p className="site00-label-red">PROCESS</p>
          <ol className="site00-bldr-step-list">
            {EVOLVE_PROCESS_STEPS.map((step) => (
              <li key={step.num} className="site00-bldr-step-list__item">
                <span className="site00-bldr-step-list__num">{step.num}</span>
                <div>
                  <h2 className="site00-bldr-step-list__title">{step.title}</h2>
                  <p className="site00-bldr-step-list__body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="systems" className="site00-evolve-hub-section">
          <p className="site00-label-red">SYSTEMS</p>
          {Object.entries(capabilityGroups).map(([category, entries]) => (
            <div key={category} className="site00-evolve-capability-group">
              <h3 className="site00-label">{category}</h3>
              <ul className="site00-evolve-capability-list">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <span className="site00-heading">{entry.name}</span>
                    <span className="site00-body"> — {entry.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="cases" className="site00-evolve-hub-section">
          <p className="site00-label-red">CASE STUDIES</p>
          <p className="site00-body">PUBLISHED EVOLVE CASE STUDIES COMING SOON.</p>
        </section>

        <section id="faq" className="site00-evolve-hub-section">
          <p className="site00-label-red">FAQ</p>
          <dl className="site00-evolve-faq">
            <dt className="site00-heading">DO I NEED TO REBUILD FROM ZERO?</dt>
            <dd className="site00-body">NO — EVOLVE WORKS WITH YOUR EXISTING PROPERTY.</dd>
            <dt className="site00-heading">WHEN IS TECHNICAL ASSESSMENT REQUIRED?</dt>
            <dd className="site00-body">BEFORE FINAL SCOPE FOR INSTALL AND TRANSFORM ENGAGEMENTS.</dd>
          </dl>
        </section>

        <section id="start" className="site00-page-banner">
          <p className="site00-label-red">START EVOLVE</p>
          <Link to={SITE00_ROUTES.evolveState} className="site00-link-red">
            START EVOLVE →
          </Link>
        </section>
      </div>
    </Site00PublicShell>
  );
}
