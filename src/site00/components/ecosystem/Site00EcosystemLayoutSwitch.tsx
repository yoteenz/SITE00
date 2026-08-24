import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useSite00 } from '../../state/Site00Context';
import { SITE00_ROUTES } from '../../config/routes';

function isEcosystemLayoutSwitchPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '');
  return (
    normalized === SITE00_ROUTES.projects ||
    normalized.startsWith(`${SITE00_ROUTES.projects}/`) ||
    normalized === SITE00_ROUTES.control ||
    normalized.startsWith(`${SITE00_ROUTES.control}/`)
  );
}

/** Mobile ↔ desktop preview for authenticated account surfaces (PROJECTS, CTRL ROOM). */
export function Site00EcosystemLayoutSwitch() {
  const { pathname } = useLocation();
  const { isPreviewDesktop, setPreviewDeviceMode } = useSite00();

  if (!isEcosystemLayoutSwitchPath(pathname)) {
    return null;
  }

  const nav = (
    <nav className="site00-origin-layout-switch" aria-label="ACCOUNT PAGE LAYOUT PREVIEW">
      <button
        type="button"
        aria-current={!isPreviewDesktop ? 'page' : undefined}
        onClick={() => setPreviewDeviceMode('mobile')}
      >
        Mobile
      </button>
      <button
        type="button"
        aria-current={isPreviewDesktop ? 'page' : undefined}
        onClick={() => setPreviewDeviceMode('desktop')}
      >
        Desktop
      </button>
    </nav>
  );

  if (typeof document === 'undefined') {
    return nav;
  }

  return createPortal(nav, document.body);
}
