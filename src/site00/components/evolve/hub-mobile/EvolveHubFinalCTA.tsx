import { useNavigate } from 'react-router-dom';
import { EVOLVE_HUB_FINAL_CTA } from '../../../config/evolve-hub-mobile';
import { resolveStartEvolveRoute } from '../../../../../shared/site00-evolve-service/startEvolveRouting.js';
import { EvolveHeroArtwork } from '../mobile/EvolveHeroArtwork';
import { ArrowIconSmall } from '../../icons/ArrowAction';
import { useSignedInFromStorage } from '../../../../hooks/useSignedInFromStorage';

export function EvolveHubFinalCTA() {
  const navigate = useNavigate();
  const [signedIn] = useSignedInFromStorage();

  const handleStart = () => {
    const dest = resolveStartEvolveRoute({
      isSignedIn: signedIn,
      hasEvolveProject: false,
      evolveProjectSlug: null,
      serviceMode: 'DIGITAL_EVOLUTION',
      isDesktop: false,
    });
    navigate(dest.route);
  };

  return (
    <section className="site00-evolve-hub-final" id="start" aria-labelledby="evolve-hub-final-heading">
      <div className="site00-evolve-hub-final__copy">
        <h2 id="evolve-hub-final-heading" className="site00-evolve-hub-final__headline">
          {EVOLVE_HUB_FINAL_CTA.headlineLine1}
          <br />
          {EVOLVE_HUB_FINAL_CTA.headlineLine2}
        </h2>
        <p className="site00-evolve-hub-final__subhead">{EVOLVE_HUB_FINAL_CTA.subhead}</p>
        <button type="button" className="site00-evolve-hub-final__cta" onClick={handleStart}>
          {EVOLVE_HUB_FINAL_CTA.cta.replace(' →', '')}
          <ArrowIconSmall />
        </button>
      </div>
      <EvolveHeroArtwork className="site00-evolve-hub-final__art" />
    </section>
  );
}
