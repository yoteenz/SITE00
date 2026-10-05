import { InboxBody } from '../../components/productionAuthority/InboxBody';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';

/** /production/queue — INBOX: requests and decisions that need the founder. */
export function ProductionQueuePage() {
  return (
    <ProductionAuthorityFrame screen="inbox">
      <InboxBody />
    </ProductionAuthorityFrame>
  );
}
