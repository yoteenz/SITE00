import { LibraryBody } from '../../components/productionAuthority/LibraryBody';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';

/** /production/libraries — full-width canon vault. */
export function ProductionLibrariesPage() {
  return (
    <ProductionAuthorityFrame screen="library">
      <LibraryBody />
    </ProductionAuthorityFrame>
  );
}
