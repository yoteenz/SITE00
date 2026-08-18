import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import {
  isSite00PublicDesktopPath,
  isSite00PublicPageBasePath,
  site00PublicMobilePath,
} from '../../config/site00-public-pages';
import { usePresentationMode } from '../../presentation';
import { useSite00 } from '../../state/Site00Context';

/** AUTO / Mobile / Desktop preview — updates shared presentation override (same canonical route). */
export function Site00PublicLayoutSwitch() {
  const { pathname } = useLocation();
  const { setPresentationOverride } = useSite00();
  const { mode, override } = usePresentationMode();

  const basePath = site00PublicMobilePath(pathname);
  if (!isSite00PublicPageBasePath(basePath) && !isSite00PublicDesktopPath(pathname)) {
    return null;
  }

  const overrideActive = override !== 'auto';

  const nav = (
    <nav className="site00-origin-layout-switch" aria-label="Public page presentation preview">
      <button
        type="button"
        aria-current={!overrideActive ? 'page' : undefined}
        onClick={() => setPresentationOverride('auto')}
      >
        Auto
      </button>
      <button
        type="button"
        aria-current={mode === 'mobile' && overrideActive ? 'page' : undefined}
        onClick={() => setPresentationOverride('mobile')}
      >
        Mobile
      </button>
      <button
        type="button"
        aria-current={mode === 'desktop' && overrideActive ? 'page' : undefined}
        onClick={() => setPresentationOverride('desktop')}
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
