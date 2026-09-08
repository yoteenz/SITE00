/**
 * B5.9R3 — Routes Evolve module content through project-specific adapters.
 */

import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import { getProjectEvolveAdapter } from '../../../../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';
import { EvolveFounderWorkspaceBoard } from '../founderWorkspace/EvolveFounderWorkspaceBoard.js';
import { ProjectEvolveModule } from './ProjectModulePanels.js';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState.js';

type Props = {
  projectSlug: string;
  operatingState: GeneralizedProjectOperatingState;
  activeSubnav: string;
};

export function ProjectEvolveModuleSurface({ projectSlug, operatingState, activeSubnav }: Props) {
  const adapter = getProjectEvolveAdapter(projectSlug);
  const { state: ndxState } = useProjectOperatingState(
    adapter.stateSource === 'PROJECT_OPERATING_STATE' ? projectSlug : '',
  );

  if (adapter.evolveType === 'NDXBOOK' && adapter.usesSpecializedSurface) {
    return <EvolveFounderWorkspaceBoard projectSlug={projectSlug} activeSubnav={activeSubnav} />;
  }

  if (adapter.evolveType === 'FRONTAL_SLAYER' && adapter.usesSpecializedSurface) {
    const derived = adapter.deriveEvolveState({ generalized: operatingState, ndxOperatingState: ndxState });
    return (
      <div className="site00-pos-module-content site00-pos-module-content--evolve site00-pos-module-content--frontal-slayer">
        <header className="site00-fws-evolve-board__hero site00-fws-evolve-board__hero--compact">
          <p className="site00-fws-evolve-board__eyebrow">EVOLVE · FRONTAL SLAYER</p>
          <h2 className="site00-fws-evolve-board__title">MARKETING WORKSPACE</h2>
          <p className="site00-fws-evolve-board__phase">{derived.currentPhase}</p>
        </header>
        <ProjectEvolveModule operatingState={operatingState} activeSubnav={activeSubnav} />
      </div>
    );
  }

  if (adapter.evolveType === 'AIO' && adapter.usesSpecializedSurface) {
    const derived = adapter.deriveEvolveState({ generalized: operatingState });
    return (
      <div className="site00-pos-module-content site00-pos-module-content--evolve site00-pos-module-content--aio">
        <header className="site00-fws-evolve-board__hero site00-fws-evolve-board__hero--compact">
          <p className="site00-fws-evolve-board__eyebrow">EVOLVE · ALL IN ONE ENTERPRISES</p>
          <h2 className="site00-fws-evolve-board__title">AIO MARKETING</h2>
          <p className="site00-fws-evolve-board__phase">{derived.currentPhase}</p>
        </header>
        <ProjectEvolveModule operatingState={operatingState} activeSubnav={activeSubnav} />
      </div>
    );
  }

  return <ProjectEvolveModule operatingState={operatingState} activeSubnav={activeSubnav} />;
}
