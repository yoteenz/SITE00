import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';
import { InboxSurface } from '../../production/WorkspaceSurfaces';

/** /production/queue?project=<p> — INBOX: the active project's real decisions. */
export function ProductionQueuePage() {
  return (
    <ProductionAuthorityFrame screen="inbox">
      <InboxSurface />
    </ProductionAuthorityFrame>
  );
}
