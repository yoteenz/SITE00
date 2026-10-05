import { ActivityBody } from '../../components/productionAuthority/ActivityBody';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';

/** /production/activity — global ACTIVITY workspace. */
export function ProductionActivityPage() {
  return (
    <ProductionAuthorityFrame screen="activity">
      <ActivityBody />
    </ProductionAuthorityFrame>
  );
}
