import type { EvolvePathId } from '../../../config/evolve';
import { getEvolvePath } from '../../../config/evolve';
import { EVOLVE_PATH_LOCKED_META } from '../../../config/evolve-diagnostic';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type SelectedEvolutionPathProps = {
  activePathId: EvolvePathId;
  onBeginAssessment: (pathId: EvolvePathId) => void;
};

function PathLockedCrosshair() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="site00-evolve-mobile-locked__crosshair"
    >
      <circle cx="24" cy="24" r="20" stroke="rgba(196,30,58,0.25)" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="12" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="rgba(196,30,58,0.3)" strokeWidth="0.75" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="rgba(196,30,58,0.3)" strokeWidth="0.75" />
      <circle cx="24" cy="24" r="4" fill="var(--site-red)" />
    </svg>
  );
}

export function SelectedEvolutionPath({ activePathId, onBeginAssessment }: SelectedEvolutionPathProps) {
  const path = getEvolvePath(activePathId);
  const meta = EVOLVE_PATH_LOCKED_META[activePathId];
  if (!path) return null;

  return (
    <section className="site00-evolve-mobile-locked" aria-label="PATH LOCKED">
      <div className="site00-evolve-mobile-locked__panel">
        <Site00ThreeCornerMark className="site00-evolve-mobile-locked__mark" />
        <p className="site00-evolve-mobile-locked__label">PATH LOCKED</p>
        <p className="site00-evolve-mobile-locked__path">
          {path.code} / {path.title}
        </p>
        <dl className="site00-evolve-mobile-locked__meta">
          <div>
            <dt>PROPERTY STATE</dt>
            <dd>{meta.propertyState}</dd>
          </div>
          <div>
            <dt>FOUNDATION</dt>
            <dd>{meta.foundation}</dd>
          </div>
          <div>
            <dt>INTERVENTION</dt>
            <dd>{meta.intervention}</dd>
          </div>
          <div>
            <dt>NEXT PROTOCOL</dt>
            <dd>{meta.nextProtocol}</dd>
          </div>
        </dl>
      </div>
      <PathLockedCrosshair />
      <button
        type="button"
        className="site00-evolve-mobile-locked__cta"
        onClick={() => onBeginAssessment(activePathId)}
      >
        BEGIN PROPERTY
        <br />
        ASSESSMENT →
      </button>
    </section>
  );
}
