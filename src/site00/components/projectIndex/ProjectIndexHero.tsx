import { Site00OrbitalMark } from '../auth/Site00OrbitalMark';

export function ProjectIndexHero() {
  return (
    <header className="site00-pidx-hero">
      <div className="site00-pidx-hero__grid">
        <div className="site00-pidx-hero__copy">
          <p className="site00-pidx-hero__brand">
            SITE 00 <span className="site00-pidx-hero__brand-mark" aria-hidden="true">◆</span>
          </p>
          <p className="site00-pidx-hero__verbs">
            <span>CREATE</span>
            <span>BUILD</span>
            <span>EVOLVE</span>
          </p>
          <p className="site00-pidx-hero__kicker">
            <span className="site00-pidx-hero__kicker-red">PROJECTS /</span>
          </p>
          <h1 className="site00-pidx-hero__title">PROJECTS</h1>
          <span className="site00-pidx-hero__divider" aria-hidden="true" />
          <p className="site00-pidx-hero__tagline">ALL PROJECTS. ONE SYSTEM.</p>
          <p className="site00-pidx-hero__support">
            IDEAS BECOME ENVIRONMENTS. ENVIRONMENTS CREATE OPPORTUNITY.
          </p>
        </div>

        <div className="site00-pidx-hero__visual-col">
          <div className="site00-pidx-hero__visual-frame">
            <div className="site00-pidx-hero__grid-lines" aria-hidden="true" />
            <Site00OrbitalMark className="site00-pidx-hero__orbital" />
          </div>
          <div className="site00-pidx-hero__rail" aria-hidden="true">
            <span>PLAN</span>
            <span>PRODUCE</span>
            <span>PUBLISH</span>
            <span>REPEAT</span>
          </div>
          <p className="site00-pidx-hero__rail-sub">BUILDING BIGGER WORLDS</p>
          <span className="site00-pidx-hero__index-num">00</span>
        </div>
      </div>
    </header>
  );
}
