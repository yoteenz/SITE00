/**
 * Stage-based implementation progress — no fake percentages.
 */

import { IMPLEMENTATION_STAGES, type ImplementationStage } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsChildSurface.js';

type Props = {
  currentStage: ImplementationStage;
};

export function SkinImplementationProgress({ currentStage }: Props) {
  const activeIndex = IMPLEMENTATION_STAGES.indexOf(currentStage);

  return (
    <div className="site00-dw-skins-progress">
      <strong>IMPLEMENTATION PROGRESS</strong>
      <ol className="site00-dw-skins-progress__stages">
        {IMPLEMENTATION_STAGES.map((stage, index) => {
          const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending';
          return (
            <li key={stage} className={`site00-dw-skins-progress__stage is-${state}`}>
              <span className="site00-dw-skins-progress__dot" aria-hidden />
              <span>{stage.replace(/_/g, ' ')}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
