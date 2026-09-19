/**
 * B5.9R4 — NDXBOOK Evolve subshell adapter surface inside POS EVOLVE module.
 */

import { getProjectEvolveAdapter } from '../../../../../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';
import type { EvolveSubshellTabId } from '../../../../../shared/site00-projects/evolve/evolveSubshellTypes.js';
import { EvolveFounderWorkspaceBoard } from '../../founderWorkspace/EvolveFounderWorkspaceBoard';
import { EvolveSubshell } from './EvolveSubshell';

type Props = {
  projectSlug: string;
};

export function NdxbookEvolveSubshell({ projectSlug }: Props) {
  const adapter = getProjectEvolveAdapter(projectSlug);
  const tabs = adapter.getSubnav(projectSlug);
  const moreItems = adapter.getMoreItems?.(projectSlug) ?? [];

  return (
    <EvolveSubshell
      projectSlug={projectSlug}
      tabs={tabs}
      moreItems={moreItems}
      resolveScreenId={(tabId: EvolveSubshellTabId) => adapter.resolveMobileScreenId(tabId)}
      renderWorkspace={(screenId, activeTab) => (
        <EvolveFounderWorkspaceBoard
          projectSlug={projectSlug}
          activeSubnav={activeTab}
          screenIdOverride={screenId}
        />
      )}
    />
  );
}
