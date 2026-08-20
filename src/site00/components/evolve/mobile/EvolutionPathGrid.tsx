import { EVOLVE_PATHS, type EvolvePathId } from '../../../config/evolve';
import { EvolutionPathCard } from './EvolutionPathCard';

type EvolutionPathGridProps = {
  selectedPathId: EvolvePathId;
  onSelectPath: (pathId: EvolvePathId) => void;
  onProceedPath: (pathId: EvolvePathId) => void;
};

export function EvolutionPathGrid({ selectedPathId, onSelectPath, onProceedPath }: EvolutionPathGridProps) {
  return (
    <section className="site00-evolve-mobile-path-grid-wrap" aria-label="EVOLVE PATHS">
      <div className="site00-evolve-mobile-path-grid__geometry" aria-hidden="true">
        <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="140" r="100" stroke="rgba(196, 30, 58, 0.05)" strokeWidth="0.75" />
          <line x1="200" y1="40" x2="200" y2="240" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.75" />
          <circle cx="200" cy="140" r="3" fill="rgba(196, 30, 58, 0.18)" />
        </svg>
      </div>
      <div className="site00-evolve-mobile-path-grid">
        {EVOLVE_PATHS.map((path) => (
          <EvolutionPathCard
            key={path.id}
            path={path}
            selected={selectedPathId === path.id}
            onSelect={onSelectPath}
            onProceed={onProceedPath}
          />
        ))}
      </div>
    </section>
  );
}
