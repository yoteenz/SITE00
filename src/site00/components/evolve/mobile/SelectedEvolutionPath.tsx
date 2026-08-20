import type { EvolvePathId } from '../../../config/evolve';
import { getEvolvePath } from '../../../config/evolve';
import { EVOLVE_SELECTED_PATH_META } from '../../../config/evolve-diagnostic';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type SelectedEvolutionPathProps = {
  activePathId: EvolvePathId;
  onBeginAssessment: (pathId: EvolvePathId) => void;
};

function SelectedPathNodeArt() {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="site00-evolve-mobile-selected__node-art">
      <circle cx="24" cy="24" r="20" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="12" stroke="rgba(0,0,0,0.14)" strokeWidth="0.75" />
      <line x1="24" y1="6" x2="24" y2="42" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <line x1="6" y1="24" x2="42" y2="24" stroke="rgba(0,0,0,0.1)" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="4" fill="var(--site-red)" />
    </svg>
  );
}

export function SelectedEvolutionPath({ activePathId, onBeginAssessment }: SelectedEvolutionPathProps) {
  const path = getEvolvePath(activePathId);
  const meta = EVOLVE_SELECTED_PATH_META[activePathId];
  if (!path) return null;

  return (
    <section className="site00-evolve-mobile-selected" aria-label="SELECTED EVOLUTION PATH">
      <div className="site00-evolve-mobile-selected__panel">
        <Site00ThreeCornerMark className="site00-evolve-mobile-selected__mark" />
        <p className="site00-evolve-mobile-selected__label">SELECTED EVOLUTION PATH</p>
        <p className="site00-evolve-mobile-selected__path">
          {path.code} / {path.title}
        </p>
        <ul className="site00-evolve-mobile-selected__meta">
          <li>{meta.propertyStatus}</li>
          <li>{meta.interventionLevel}</li>
          <li>{meta.recommendedEntry}</li>
        </ul>
      </div>
      <SelectedPathNodeArt />
      <button type="button" className="site00-evolve-mobile-selected__cta" onClick={() => onBeginAssessment(activePathId)}>
        BEGIN EVOLVE
        <br />
        ASSESSMENT →
      </button>
    </section>
  );
}
