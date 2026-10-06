import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';
import { ActivitySurface } from '../../production/WorkspaceSurfaces';

/** /production/activity?project=<p> — ACTIVITY: the active project's event ledger. */
export function ProductionActivityPage() {
  return (
    <ProductionAuthorityFrame screen="activity">
      <ActivitySurface />
    </ProductionAuthorityFrame>
  );
}
