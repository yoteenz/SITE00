import { ProductionHub } from '../../components/productionHub/ProductionHub';

/** /production — the Production Hub machine (admin-only via Site00InternalProductionGuard). */
export function ProductionWorkspaceHubPage() {
  return <ProductionHub />;
}
