import type { EvolvePathId } from '../../../config/evolve';
import { EVOLVE_PATHS } from '../../../config/evolve';
import { getEvolvePathSelectionCard } from '../../../config/evolve-diagnostic';
import { EvolutionPathCard } from './EvolutionPathCard';

type EvolutionPathGridProps = {
  selectedPathId: EvolvePathId;
  onSelectPath: (pathId: EvolvePathId) => void;
};

export function EvolutionPathGrid({ selectedPathId, onSelectPath }: EvolutionPathGridProps) {
  return (
    <section className="site00-evolve-mobile-path-grid-wrap" aria-label="EVOLVE PATHS">
      <div className="site00-evolve-mobile-path-grid">
        {EVOLVE_PATHS.map((path) => {
          const cardConfig = getEvolvePathSelectionCard(path.id);
          if (!cardConfig) return null;
          return (
            <EvolutionPathCard
              key={path.id}
              path={path}
              cardConfig={cardConfig}
              selected={selectedPathId === path.id}
              onSelect={onSelectPath}
            />
          );
        })}
      </div>
    </section>
  );
}
