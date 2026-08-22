import { BracketHeading } from '../../pages/Site00PagePrimitives';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { EVOLVE_HOMEPAGE_EXPANDED } from '../../../config/evolve';
import { EVOLVE_HUB_MOBILE_COPY } from '../../../config/evolve-hub-mobile';
import { EvolveHeroArtwork } from '../mobile/EvolveHeroArtwork';

export function EvolveHubHero() {
  return (
    <header className="site00-evolve-hub-hero" id="overview">
      <div className="site00-evolve-hub-hero__meta">
        <Site00ThreeCornerMark className="site00-evolve-hub-hero__mark" />
        <p className="site00-evolve-hub-hero__location">{EVOLVE_HUB_MOBILE_COPY.location}</p>
      </div>
      <div className="site00-evolve-hub-hero__grid">
        <div className="site00-evolve-hub-hero__copy">
          <BracketHeading className="site00-evolve-hub-hero__title">EVOLVE</BracketHeading>
          <span className="site00-evolve-hub-hero__rule" aria-hidden="true" />
          <p className="site00-evolve-hub-hero__tagline">{EVOLVE_HOMEPAGE_EXPANDED.subtitle}</p>
        </div>
        <EvolveHeroArtwork className="site00-evolve-hub-hero__art" />
      </div>
    </header>
  );
}
