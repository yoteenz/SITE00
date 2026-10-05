import { Navigate, useLocation } from 'react-router-dom';
import { canAccessAdminPages, isSignedIn } from '../../../utils/adminAuth';
import { isSite00SignInPaused } from '../../config/signInPaused';
import { SITE00_ROUTES } from '../../config/routes';

/**
 * Blocks client/collaborator access to internal Production Workspace routes.
 */
export function Site00InternalProductionGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (isSite00SignInPaused()) return <>{children}</>;

  if (!isSignedIn()) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!canAccessAdminPages()) {
    return <Navigate to={SITE00_ROUTES.projects} replace state={{ productionAccessDenied: true }} />;
  }

  return <>{children}</>;
}
