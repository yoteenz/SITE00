import { useSearchParams } from 'react-router-dom';
import { ProductionHub } from '../../components/productionHub/ProductionHub';
import { HubBody } from '../../components/productionAuthority/HubBody';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';

/**
 * /production — authority HUB body (admin-only via Site00InternalProductionGuard).
 * The Production Hub machine (chamber, inspector, decisions) stays mounted at /production?view=machine.
 */
export function ProductionWorkspaceHubPage() {
  const [params] = useSearchParams();
  if (params.get('view') === 'machine' || params.has('panel') || params.has('node') || params.has('scene')) return <ProductionHub />;
  return (
    <ProductionAuthorityFrame screen="hub">
      <HubBody />
    </ProductionAuthorityFrame>
  );
}
