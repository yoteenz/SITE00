import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';
import { SITE00_ROUTES } from '../site00/config/routes';

/** Protects SITE 00 admin routes under /admin/site00/* */
export default function AdminGuard() {
  const location = useLocation();

  if (!isSignedIn()) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!canAccessAdminPages()) {
    return <Navigate to={SITE00_ROUTES.control} replace />;
  }

  return <Outlet />;
}
