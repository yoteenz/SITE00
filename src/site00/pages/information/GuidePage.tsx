import { Link } from 'react-router-dom';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';
import { Site00ExperiencePage } from '../../components/experience/Site00ExperiencePage';
import { SITE00_GUIDE_SECTIONS_SEED } from '../../config/seed/site00-page-seed';

export default function GuidePage() {
  return (
    <Site00ExperiencePage pageClassName="site00-page--guide" pageLabel="GUIDE">
      <PageIntro
        title={<BracketHeading>GUIDE</BracketHeading>}
        subtitle="ORIENT WITHIN SITE 00 — SPATIAL PATHS AND ENTRY POINTS."
      />
      <div className="site00-guide-sections">
        {SITE00_GUIDE_SECTIONS_SEED.map((section) => (
          <Link key={section.id} to={section.href} className="site00-guide-section">
            <h2 className="site00-guide-section__title">{section.title}</h2>
            <p className="site00-guide-section__desc">{section.description}</p>
            <span className="site00-guide-section__cta" aria-hidden="true">
              ›
            </span>
          </Link>
        ))}
      </div>
    </Site00ExperiencePage>
  );
}
