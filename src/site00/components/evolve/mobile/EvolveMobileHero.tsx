import { EVOLVE_SELECTION_HERO_COPY } from '../../../config/evolve-diagnostic';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { EvolveHeroArtwork } from './EvolveHeroArtwork';

export function EvolveMobileHero() {
  return (
    <header className="site00-evolve-mobile-hero">
      <div className="site00-evolve-mobile-hero__meta">
        <Site00ThreeCornerMark className="site00-evolve-mobile-hero__mark" />
        <p className="site00-evolve-mobile-hero__location">{EVOLVE_SELECTION_HERO_COPY.location}</p>
      </div>
      <div className="site00-evolve-mobile-hero__grid">
        <div className="site00-evolve-mobile-hero__copy">
          <p className="site00-evolve-mobile-hero__kicker">{EVOLVE_SELECTION_HERO_COPY.kicker}</p>
          <h1 className="site00-evolve-mobile-hero__headline">
            {EVOLVE_SELECTION_HERO_COPY.headlineLine1}
            <br />
            {EVOLVE_SELECTION_HERO_COPY.headlineLine2}
          </h1>
          <span className="site00-evolve-mobile-hero__divider" aria-hidden="true" />
          <p className="site00-evolve-mobile-hero__subhead">{EVOLVE_SELECTION_HERO_COPY.subhead}</p>
        </div>
        <EvolveHeroArtwork className="site00-evolve-mobile-hero__art" />
      </div>
    </header>
  );
}
