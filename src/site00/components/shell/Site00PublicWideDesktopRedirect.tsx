import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isSite00PublicDesktopPath, site00PublicMobilePath } from '../../config/site00-public-pages';

import { writeStoredPreviewDeviceMode } from '../../state/preview-mode';

/**
 * Legacy `/desktop` suffix routes redirect to semantic base path.
 * Preview mode is restored from session storage + URL sync in Site00Provider.
 */
export function Site00PublicDesktopLegacyRedirect() {
  const { pathname, search, hash } = useLocation();

  if (!isSite00PublicDesktopPath(pathname)) {
    return null;
  }

  writeStoredPreviewDeviceMode('desktop');

  const mobilePath = site00PublicMobilePath(pathname);
  const nextSearch = search.startsWith('?') ? search : search ? `?${search}` : '';

  return <Navigate to={`${mobilePath}${nextSearch}${hash}`} replace />;
}

/** @deprecated Redirect handled per-route; kept for compatibility if imported elsewhere. */
export function Site00PublicWideDesktopRedirect() {
  const { pathname } = useLocation();

  useEffect(() => {
    void pathname;
  }, [pathname]);

  return null;
}
