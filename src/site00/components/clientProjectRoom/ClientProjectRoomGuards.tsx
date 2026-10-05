import { Navigate, useLocation } from 'react-router-dom';
import { isAdminEmail } from '../../../utils/adminAuth';
import { SITE00_ROUTES } from '../../config/routes';

const ADMIN_ONLY_PREFIXES = [
  '/projects/site00/design',
  '/admin/site00',
  '/projects/ndxbook/design',
];

/** Blocks clients from admin/design reconstruction routes when linked from project room. */
export function ClientProjectRoomAdminSeparationGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const path = location.pathname;

  for (const prefix of ADMIN_ONLY_PREFIXES) {
    if (path.startsWith(prefix)) {
      return <Navigate to={SITE00_ROUTES.control} replace />;
    }
  }

  return <>{children}</>;
}

export function isClientProjectRoomPath(pathname: string): boolean {
  return pathname.startsWith('/client/projects/');
}

export function shouldRedirectAdminAwayFromClientRoom(pathname: string, email: string | null): boolean {
  if (!isClientProjectRoomPath(pathname)) return false;
  return isAdminEmail(email ?? '') && pathname.includes('/client/projects/preview-client-room') === false;
}
