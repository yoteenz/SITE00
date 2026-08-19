import { Navigate, useLocation } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

/** Legacy `/sign-in` → canonical `/origin/sign-in` (preserves query + hash). */
export function Site00SignInAliasRedirect() {
  const { search, hash } = useLocation();
  return <Navigate to={`${SITE00_ROUTES.signIn}${search}${hash}`} replace />;
}

/** Legacy `/identity` paths → `/idnty` tree. */
export function Site00IdentityAliasRedirect() {
  const { pathname, search, hash } = useLocation();
  const mapped = pathname.replace(/^\/identity(?=\/|$)/, SITE00_ROUTES.idnty);
  return <Navigate to={`${mapped}${search}${hash}`} replace />;
}
