import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_CTRL_ROOM_DESKTOP_BG_FILE } from '../../config/site00-auth-assets';
import { EcosystemPageHeader } from './EcosystemPageHeader';
import { Site00EcosystemMobileShell } from '../mobile/Site00EcosystemMobileShell';
import { OperatingWorldTopNav } from './OperatingWorldTopNav';
import { OperatingWorldStatusRail } from './OperatingWorldStatusRail';
import { ExperienceContextBar } from '../access/ExperienceContextBar';
import { CtrlRoomSignOutButton } from '../control/CtrlRoomSignOutButton';
import { Site00EcosystemLayoutSwitch } from './Site00EcosystemLayoutSwitch';
import { Site00DesktopArtboardShell } from '../shell/Site00DesktopArtboardShell';
import { ProjectPresenceScope } from '../shell/ProjectPresenceScope';
import { useSite00 } from '../../state/Site00Context';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { useActiveProjectSlug } from '../../hooks/useProjectPresenceAccent';
import { ecosystemPageMeta } from '../../config/ecosystem-nav';
import { SITE00_ROUTES } from '../../config/routes';

type EcosystemShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  /** When true, page supplies its own hero/header inside children. */
  hidePageHeader?: boolean;
};

const ecosystemBgUrl = resolveSite00PublicAsset(SITE00_CTRL_ROOM_DESKTOP_BG_FILE);

/**
 * Operating World shell — authenticated workspace.
 * Desktop: top navigation + architectural environment (no public-world sidebar).
 */
export function EcosystemShell({ children, title, subtitle, headerActions, hidePageHeader = false }: EcosystemShellProps) {
  const { pathname } = useLocation();
  const activeProjectSlug = useActiveProjectSlug();
  const { isPreviewDesktop } = useSite00();
  const isWideViewport = useSite00OriginWideViewport();
  const meta = ecosystemPageMeta(pathname);
  const pageTitle = title ?? meta.title;
  const pageSubtitle = subtitle ?? meta.subtitle;
  const isCtrlRoomRoute = pathname === SITE00_ROUTES.control || pathname.startsWith(`${SITE00_ROUTES.control}/`);
  const showDesktopLayout = isPreviewDesktop;
  const scaleDesktopInArtboard = showDesktopLayout && !isWideViewport;

  useEffect(() => {
    if (!ecosystemBgUrl) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = ecosystemBgUrl;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const desktopLayout = (
    <div
      className="site00-ecosystem-shell__desktop"
      style={{ ['--site00-ecosystem-bg' as string]: `url(${ecosystemBgUrl})` }}
    >
      <OperatingWorldTopNav />
      <ExperienceContextBar variant="client" />
      <div className="site00-ecosystem-shell__main">
        <div className="site00-ecosystem-shell__content-wrap">
          {hidePageHeader ? null : (
            <EcosystemPageHeader title={pageTitle} subtitle={pageSubtitle} actions={headerActions} />
          )}
          <div className="site00-ecosystem-shell__content">{children}</div>
        </div>
      </div>
      <OperatingWorldStatusRail />
    </div>
  );

  const mobileLayout = (
    <div className="site00-ecosystem-shell__mobile">
      <Site00EcosystemMobileShell shellClassName="site00-ecosystem-mobile-shell">
        <ExperienceContextBar variant="client" />
        {isCtrlRoomRoute ? (
          <div className="site00-ctrl-sign-out-mobile-bar">
            <CtrlRoomSignOutButton variant="mobile-bar" />
          </div>
        ) : null}
        {hidePageHeader ? null : (
          <EcosystemPageHeader title={pageTitle} subtitle={pageSubtitle} actions={headerActions} />
        )}
        <div
          className={`site00-ecosystem-mobile__content ${hidePageHeader ? 'site00-ecosystem-mobile__content--flush' : ''}`.trim()}
        >
          {children}
        </div>
      </Site00EcosystemMobileShell>
    </div>
  );

  return (
    <ProjectPresenceScope projectSlug={activeProjectSlug} className={`site00-ecosystem-shell ${showDesktopLayout ? 'site00-ecosystem-shell--desktop-active' : 'site00-ecosystem-shell--mobile-active'}`.trim()}>
      <Site00EcosystemLayoutSwitch />
      {showDesktopLayout ? (
        scaleDesktopInArtboard ? (
          <Site00DesktopArtboardShell>{desktopLayout}</Site00DesktopArtboardShell>
        ) : (
          desktopLayout
        )
      ) : (
        mobileLayout
      )}
    </ProjectPresenceScope>
  );
}

/** @deprecated Use EcosystemShell */
export function CtrlRoomShell({ children }: { children: ReactNode }) {
  return <EcosystemShell>{children}</EcosystemShell>;
}
