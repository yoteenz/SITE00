import { Navigate } from 'react-router-dom';
import { SITE00_ADMIN_ROUTES } from '../site00/admin/config/routes';

/** Shorthand mobile URL → canonical admin capture-auth bootstrap route (AdminGuard on destination). */
export function CaptureAuthRedirect() {
  return <Navigate to={SITE00_ADMIN_ROUTES.captureAuthBootstrap} replace />;
}
