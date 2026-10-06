import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';
import { LibrarySurface } from '../../production/WorkspaceSurfaces';

/** /production/libraries?project=<p> — LIBRARY: the active project's artifact archive with lineage. */
export function ProductionLibrariesPage() {
  return (
    <ProductionAuthorityFrame screen="library">
      <LibrarySurface />
    </ProductionAuthorityFrame>
  );
}
