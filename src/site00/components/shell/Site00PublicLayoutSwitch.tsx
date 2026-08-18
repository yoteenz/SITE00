import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  isSite00PublicDesktopPath,
  isSite00PublicPageBasePath,
  site00PublicMobilePath,
} from '../../config/site00-public-pages';
import { useSite00 } from '../../state/Site00Context';

/** Mobile ↔ desktop preview toggle — updates shared preview mode (same semantic route). */
export function Site00PublicLayoutSwitch() {
  const { pathname } = useLocation();
  const { isPreviewDesktop, setPreviewDeviceMode } = useSite00();

  const basePath = site00PublicMobilePath(pathname);
  if (!isSite00PublicPageBasePath(basePath) && !isSite00PublicDesktopPath(pathname)) {
    return null;
  }

  const nav = (
    <nav className="site00-origin-layout-switch" aria-label="Public page layout preview">
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
