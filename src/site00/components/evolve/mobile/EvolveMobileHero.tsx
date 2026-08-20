import { EVOLVE_MOBILE_HERO_COPY } from '../../../config/evolve-diagnostic';
import { EvolveHeroArtwork } from './EvolveHeroArtwork';

export function EvolveMobileHero() {
  return (
    <header className="site00-evolve-mobile-hero">
      <div className="site00-evolve-mobile-hero__copy">
        <p className="site00-evolve-mobile-hero__kicker">{EVOLVE_MOBILE_HERO_COPY.kicker}</p>
        <h1 className="site00-evolve-mobile-hero__title">{EVOLVE_MOBILE_HERO_COPY.title}</h1>
        <span className="site00-evolve-mobile-hero__divider" aria-hidden="true" />
        <p className="site00-evolve-mobile-hero__question">{EVOLVE_MOBILE_HERO_COPY.headline}</p>
        <p className="site00-evolve-mobile-hero__desc">{EVOLVE_MOBILE_HERO_COPY.subhead}</p>
      </div>
      <EvolveHeroArtwork />
    </header>
  );
}
