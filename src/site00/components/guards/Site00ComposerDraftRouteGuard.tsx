/**
 * P0.VR.3H — Blocks production navigation to composer draft routes unless preview mode.
 */

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isDraftRouteAccessible } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3h/client.js';
import { SITE00_ROUTES } from '../../config/routes';

type Props = { children: ReactNode };

export function Site00ComposerDraftRouteGuard({ children }: Props) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (isDraftRouteAccessible(location.pathname, params)) {
    return <>{children}</>;
  }
  return <Navigate to={SITE00_ROUTES.origin} replace state={{ draftBlocked: location.pathname }} />;
}
