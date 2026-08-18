import { Navigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { writeStoredPreviewDeviceMode } from '../../state/preview-mode';

/** Legacy `/origin/desktop` → `/origin` with desktop preview mode restored. */
export function Site00OriginDesktopLegacyRedirect() {
  writeStoredPreviewDeviceMode('desktop');
  return <Navigate to={SITE00_ROUTES.originAlias} replace />;
}
