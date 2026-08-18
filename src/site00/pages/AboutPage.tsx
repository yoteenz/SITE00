import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../components/pages/Site00PagePrimitives';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';

const PRINCIPLES = [
  { title: 'BUILT FOR BUILDERS', description: 'TOOLS AND INFRASTRUCTURE DESIGNED FOR CREATORS WHO SHIP.' },
  { title: 'PRIVACY FIRST', description: 'YOUR DATA AND PROJECTS REMAIN UNDER YOUR CONTROL.' },
  { title: 'DESIGNED TO SCALE', description: 'FROM FIRST LAUNCH TO ENTERPRISE-GRADE SYSTEMS.' },
];

export default function AboutPage() {
  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--about">
        <PageIntro
          title={<BracketHeading>ABOUT</BracketHeading>}
          subtitle="THE MISSION, TECHNOLOGY, AND PRINCIPLES BEHIND SITE 00."
        />
        <section className="site00-about-mission">
          <div>
            <p className="site00-label-red">00 MISSION</p>
            <p className="site00-body site00-about-mission__statement">
              SITE 00 IS A SPATIAL OPERATING ENVIRONMENT FOR DESIGNING, BUILDING, AND LAUNCHING DIGITAL PLACES —
              IDENTITY, INFRASTRUCTURE, AND EXPERIENCE IN ONE CONNECTED SYSTEM.
            </p>
            <Link to={SITE00_ROUTES.journal} className="site00-link-red">
              LEARN MORE →
            </Link>
          </div>
          <div className="site00-about-mission__visual" aria-hidden="true" />
        </section>
        <div className="site00-principles-grid">
          {PRINCIPLES.map((p) => (
            <article key={p.title} className="site00-principle-card">
              <h2 className="site00-principle-card__title">{p.title}</h2>
              <p className="site00-principle-card__desc">{p.description}</p>
            </article>
          ))}
        </div>
        <footer className="site00-about-meta">
          <div>
            <p className="site00-label">SITE 00</p>
            <p className="site00-micro">EST. 2024</p>
          </div>
          <div>
            <p className="site00-label">HEADQUARTERS</p>
            <p className="site00-micro">FORT WORTH</p>
          </div>
          <div>
            <p className="site00-label">CONTACT</p>
            <a href="mailto:hello@site00.com" className="site00-link-red">
              hello@site00.com
            </a>
          </div>
        </footer>
      </div>
    </Site00PublicShell>
  );
}
