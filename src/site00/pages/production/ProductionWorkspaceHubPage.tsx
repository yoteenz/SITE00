import { useSearchParams } from 'react-router-dom';
import { ProductionHub } from '../../components/productionHub/ProductionHub';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';
import { useActiveProjectId } from '../../production/activeProject';
import { HubSurface } from '../../production/WorkspaceSurfaces';

/**
 * /production?project=<p> — the active project's HUB (admin-only via Site00InternalProductionGuard).
 * The Production Hub machine (chamber, inspector, decisions) is NDXBOOK Entry 002's machine: it stays mounted at
 * /production?project=ndxbook&view=machine and is never shown under another project.
 */
export function ProductionWorkspaceHubPage() {
  const [params] = useSearchParams();
  const project = useActiveProjectId();
  const machine = params.get('view') === 'machine' || params.has('panel') || params.has('node') || params.has('scene');
  if (machine && project === 'ndxbook') return <ProductionHub />;
  return (
    <ProductionAuthorityFrame screen="hub">
      <HubSurface />
    </ProductionAuthorityFrame>
  );
}
