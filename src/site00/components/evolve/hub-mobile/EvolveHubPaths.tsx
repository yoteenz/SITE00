import { useNavigate } from 'react-router-dom';
import { EVOLVE_HUB_PATH_CARDS } from '../../../config/evolve-hub-mobile';
import { resolveEvolveAssessmentDestination } from '../../../config/evolve-diagnostic';
import type { EvolvePathId } from '../../../config/evolve';
import { useSite00 } from '../../../state/Site00Context';
import { EvolveHubPathCardComponent } from './EvolveHubPathCard';

export function EvolveHubPaths() {
  const navigate = useNavigate();
  const { selectEvolvePath } = useSite00();

  const handleEnter = (pathId: EvolvePathId) => {
    selectEvolvePath(pathId);
    navigate(resolveEvolveAssessmentDestination(pathId, false));
  };

  return (
    <section className="site00-evolve-hub-paths" id="paths" aria-labelledby="evolve-hub-paths-heading">
      <header className="site00-evolve-hub-section-header">
        <h2 id="evolve-hub-paths-heading" className="site00-evolve-hub-section-header__title">
          EVOLUTION PATHS ─
        </h2>
        <p className="site00-evolve-hub-section-header__subtitle">CHOOSE YOUR DIRECTION</p>
      </header>
      <div className="site00-evolve-hub-paths__scroll">
        {EVOLVE_HUB_PATH_CARDS.map((card) => (
          <EvolveHubPathCardComponent key={card.pathId} card={card} onEnter={() => handleEnter(card.pathId)} />
        ))}
      </div>
    </section>
  );
}
