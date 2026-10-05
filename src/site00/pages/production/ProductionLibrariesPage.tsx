import { Navigate, useParams } from 'react-router-dom';
import { LibraryScreen } from '../../components/productionAuthority/realm/LibraryScreen';
import { resolveRealmRoute } from '../../components/productionAuthority/realm/realmRoutes';
import { ProductionAuthorityFrame } from '../../components/productionAuthority/ProductionAuthorityFrame';

/** /production/libraries/* — the canonical vault: 10 families / 75 routes inside the shared Production frame. */
export function ProductionLibrariesPage() {
  const { '*': rest } = useParams<{ '*': string }>();
  const resolved = resolveRealmRoute('library', rest);
  if (!resolved) return <Navigate to="/production/libraries" replace />;
  return (
    <ProductionAuthorityFrame screen="library">
      <LibraryScreen slug="ndxbook" resolved={resolved} key={`${resolved.route.family}/${resolved.route.id}`} />
    </ProductionAuthorityFrame>
  );
}
