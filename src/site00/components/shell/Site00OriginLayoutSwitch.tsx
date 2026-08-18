import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import {
  isSite00BldrAssessmentDesktopPath,
  isSite00BldrAssessmentPath,
  isSite00BldrStateDesktopPath,
  isSite00IdntyAssessmentDesktopPath,
  isSite00IdntyAssessmentPath,
  isSite00IdntyStateDesktopPath,
  isSite00OriginDesktopPath,
  SITE00_ROUTES,
  site00BldrAssessmentDesktopPath,
  site00BldrAssessmentMobilePath,
  site00IdntyAssessmentDesktopPath,
  site00IdntyAssessmentMobilePath,
} from '../../config/routes';
import { useSite00 } from '../../state/Site00Context';

/** Toggle mobile vs desktop preview on Origin + workflow assessment routes. */
export function Site00OriginLayoutSwitch() {
  const { pathname } = useLocation();
  const { isPreviewDesktop, setPreviewDeviceMode } = useSite00();

  let nav: React.ReactNode = null;

  if (
    pathname === SITE00_ROUTES.originAlias ||
    pathname === SITE00_ROUTES.origin ||
    pathname === SITE00_ROUTES.enter ||
    isSite00OriginDesktopPath(pathname)
  ) {
    nav = (
      <nav className="site00-origin-layout-switch" aria-label="Origin layout preview">
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
  } else if (pathname === SITE00_ROUTES.bldrState || isSite00BldrStateDesktopPath(pathname)) {
    nav = (
      <nav className="site00-origin-layout-switch" aria-label="BLDR layout preview">
        <Link to={SITE00_ROUTES.bldrState} aria-current={pathname === SITE00_ROUTES.bldrState ? 'page' : undefined}>
          Mobile
        </Link>
        <Link to={SITE00_ROUTES.bldrStateDesktop} aria-current={isSite00BldrStateDesktopPath(pathname) ? 'page' : undefined}>
          Desktop
        </Link>
      </nav>
    );
  } else if (pathname === SITE00_ROUTES.idntyState || isSite00IdntyStateDesktopPath(pathname)) {
    nav = (
      <nav className="site00-origin-layout-switch" aria-label="IDNTY layout preview">
        <Link to={SITE00_ROUTES.idntyState} aria-current={pathname === SITE00_ROUTES.idntyState ? 'page' : undefined}>
          Mobile
        </Link>
        <Link to={SITE00_ROUTES.idntyStateDesktop} aria-current={isSite00IdntyStateDesktopPath(pathname) ? 'page' : undefined}>
          Desktop
        </Link>
      </nav>
    );
  } else if (isSite00IdntyAssessmentPath(pathname)) {
    const mobileBase = site00IdntyAssessmentMobilePath(pathname);
    nav = (
      <nav className="site00-origin-layout-switch" aria-label="IDNTY assessment layout preview">
        <Link to={mobileBase} aria-current={!isSite00IdntyAssessmentDesktopPath(pathname) ? 'page' : undefined}>
          Mobile
        </Link>
        <Link
          to={site00IdntyAssessmentDesktopPath(mobileBase)}
          aria-current={isSite00IdntyAssessmentDesktopPath(pathname) ? 'page' : undefined}
        >
          Desktop
        </Link>
      </nav>
    );
  } else if (isSite00BldrAssessmentPath(pathname)) {
    const mobileBase = site00BldrAssessmentMobilePath(pathname);
    nav = (
      <nav className="site00-origin-layout-switch" aria-label="BLDR assessment layout preview">
        <Link to={mobileBase} aria-current={!isSite00BldrAssessmentDesktopPath(pathname) ? 'page' : undefined}>
          Mobile
        </Link>
        <Link
          to={site00BldrAssessmentDesktopPath(mobileBase)}
          aria-current={isSite00BldrAssessmentDesktopPath(pathname) ? 'page' : undefined}
        >
          Desktop
        </Link>
      </nav>
    );
  }

  if (!nav) {
    return null;
  }

  if (typeof document === 'undefined') {
    return nav;
  }

  return createPortal(nav, document.body);
}
