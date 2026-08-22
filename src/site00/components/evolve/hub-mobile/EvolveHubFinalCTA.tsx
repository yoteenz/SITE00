import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../config/routes';
import { EVOLVE_HUB_FINAL_CTA } from '../../../config/evolve-hub-mobile';
import { EvolveHeroArtwork } from '../mobile/EvolveHeroArtwork';
import { ArrowIconSmall } from '../../icons/ArrowAction';

export function EvolveHubFinalCTA() {
  return (
    <section className="site00-evolve-hub-final" id="start" aria-labelledby="evolve-hub-final-heading">
      <div className="site00-evolve-hub-final__copy">
        <h2 id="evolve-hub-final-heading" className="site00-evolve-hub-final__headline">
          {EVOLVE_HUB_FINAL_CTA.headlineLine1}
          <br />
          {EVOLVE_HUB_FINAL_CTA.headlineLine2}
        </h2>
        <p className="site00-evolve-hub-final__subhead">{EVOLVE_HUB_FINAL_CTA.subhead}</p>
        <Link to={SITE00_ROUTES.evolveState} className="site00-evolve-hub-final__cta">
          {EVOLVE_HUB_FINAL_CTA.cta.replace(' →', '')}
          <ArrowIconSmall />
        </Link>
      </div>
      <EvolveHeroArtwork className="site00-evolve-hub-final__art" />
    </section>
  );
}
