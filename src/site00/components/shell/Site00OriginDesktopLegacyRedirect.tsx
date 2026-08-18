import { Navigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { writeStoredPresentationOverride } from '../../state/preview-mode';

/** Legacy `/origin/desktop` → canonical `/origin` with desktop presentation override. */
export function Site00OriginDesktopLegacyRedirect() {
  writeStoredPresentationOverride('desktop');
  return <Navigate to={SITE00_ROUTES.originAlias} replace />;
}
