import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages, isPreviewEnvironment } from '../utils/adminAuth';
import { SITE00_ROUTES } from '../site00/config/routes';

/**
 * TEMPORARY — remove after email pack art-direction review.
 * Opens /admin/site00/* on preview hosts (fsbw-dev, localhost, cloudflare tunnel) without auth.
 * Production (site00.com) remains gated.
 */
const TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW = true;

function isSite00AdminPath(pathname: string): boolean {
  return pathname === '/admin/site00' || pathname.startsWith('/admin/site00/');
}

/** Protects SITE 00 admin routes under /admin/site00/* */
export default function AdminGuard() {
  const location = useLocation();

  if (
    TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW &&
    isPreviewEnvironment() &&
    isSite00AdminPath(location.pathname)
  ) {
    return <Outlet />;
  }

  if (!isSignedIn()) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${SITE00_ROUTES.signIn}?returnTo=${returnTo}`} replace />;
  }

  if (!canAccessAdminPages()) {
    return <Navigate to={SITE00_ROUTES.control} replace />;
  }

  return <Outlet />;
}
