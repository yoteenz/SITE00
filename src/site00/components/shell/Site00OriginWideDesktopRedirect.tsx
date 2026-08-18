import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import {
  isSite00OriginWideViewport,
  site00OriginMobileLayoutPreviewActive,
} from './site00OriginViewport';

/**
 * Canonical desktop Origin lives at `/origin/desktop` (forceArtboard).
 * On wide viewports, `/origin` redirects there so laptop matches phone desktop preview.
 * Append `?site00MobileLayout=1` to force mobile layout on a wide screen (QA toggle).
 */
export function Site00OriginWideDesktopRedirect() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (site00OriginMobileLayoutPreviewActive(search)) return;
    if (pathname !== SITE00_ROUTES.originAlias && pathname !== SITE00_ROUTES.origin) return;
    if (!isSite00OriginWideViewport()) return;

    const nextSearch = search.startsWith('?') ? search : search ? `?${search}` : '';
    navigate(`${SITE00_ROUTES.originDesktop}${nextSearch}${hash}`, { replace: true });
  }, [pathname, search, hash, navigate]);

  return null;
}
