import type { ReactNode } from 'react';
import type { Site00MobileNavId } from '../../config/locations-directory';
import { useLocation } from 'react-router-dom';
import { site00PublicPageMeta } from '../../config/site00-public-page-meta';
import { Site00PageEnvironment } from './Site00PageEnvironment';
import { Site00AppShell } from './Site00AppShell';
import { Site00PageFooter } from './Site00PageFooter';
import { Site00PublicStatusRail } from './Site00PublicStatusRail';
import { Site00MobileShell } from '../mobile/Site00MobileShell';
import { useSite00 } from '../../state/Site00Context';
import { useSite00DesktopArtboardPreview } from './Site00DesktopArtboardContext';

type Site00PublicShellProps = {
  children: ReactNode;
  /** Mobile bottom nav active tab */
  mobileActiveNav?: Site00MobileNavId;
  /** Override auto-detected location label for desktop header */
  locationLabel?: string;
  className?: string;
};

/**
 * Canonical public shell — desktop matches ORIGIN (top nav, no sidebar).
 * Mobile: header + bottom nav + solid surface.
 */
export function Site00PublicShell({
  children,
  mobileActiveNav = 'origin',
  locationLabel,
  className = '',
}: Site00PublicShellProps) {
  const { isPreviewDesktop } = useSite00();
  const inArtboard = useSite00DesktopArtboardPreview();
  const { pathname } = useLocation();
  const meta = site00PublicPageMeta(pathname);
  const resolvedLocation = locationLabel ?? meta.locationLabel;
  const showDesktopCanon = isPreviewDesktop && inArtboard;

  return (
    <div
      className={`site00-public-shell ${showDesktopCanon ? 'site00-public-shell--desktop-canon' : 'site00-public-shell--mobile-layout'} ${className}`.trim()}
      data-site00-path={pathname}
    >
      {showDesktopCanon ? (
        <div className="site00-shell site00-public-shell__desktop-canon">
          <Site00PageEnvironment className="site00-public-shell__env" />
          <div className="site00-ui-layer site00-public-shell__ui">
            <Site00AppShell locationLabel={resolvedLocation}>
              <div className="site00-public-shell__content">{children}</div>
              <Site00PublicStatusRail />
            </Site00AppShell>
          </div>
        </div>
      ) : (
        <div className="site00-public-shell__mobile">
          <Site00MobileShell activeNav={mobileActiveNav} showEnvironmentBackground={false} shellClassName="site00-public-mobile-shell">
            <div className="site00-public-mobile">
              <main className="site00-public-mobile__main">{children}</main>
              <Site00PageFooter />
            </div>
          </Site00MobileShell>
        </div>
      )}
    </div>
  );
}

/** @deprecated Sidebar removed from public desktop — kept as no-op export for gradual migration. */
export function Site00PublicSidebar() {
  return null;
}
