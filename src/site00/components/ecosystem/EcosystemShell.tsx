import { type ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_CTRL_ROOM_DESKTOP_BG_FILE } from '../../config/site00-auth-assets';
import { EcosystemPageHeader } from './EcosystemPageHeader';
import { Site00EcosystemMobileShell } from '../mobile/Site00EcosystemMobileShell';
import { OperatingWorldTopNav } from './OperatingWorldTopNav';
import { OperatingWorldStatusRail } from './OperatingWorldStatusRail';
import { ecosystemNavIdFromPath, ecosystemPageMeta } from '../../config/ecosystem-nav';

type EcosystemShellProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
};

const ecosystemBgUrl = resolveSite00PublicAsset(SITE00_CTRL_ROOM_DESKTOP_BG_FILE);

/**
 * Operating World shell — authenticated workspace.
 * Desktop: top navigation + architectural environment (no public-world sidebar).
 */
export function EcosystemShell({ children, title, subtitle, headerActions }: EcosystemShellProps) {
  const { pathname } = useLocation();
  const meta = ecosystemPageMeta(pathname);
  const activeNav = ecosystemNavIdFromPath(pathname);
  const pageTitle = title ?? meta.title;
  const pageSubtitle = subtitle ?? meta.subtitle;

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

  return (
    <div className="site00-ecosystem-shell">
      <div
        className="site00-ecosystem-shell__desktop"
        style={{ ['--site00-ecosystem-bg' as string]: `url(${ecosystemBgUrl})` }}
      >
        <OperatingWorldTopNav />
        <div className="site00-ecosystem-shell__main">
          <div className="site00-ecosystem-shell__content-wrap">
            <EcosystemPageHeader title={pageTitle} subtitle={pageSubtitle} actions={headerActions} />
            <div className="site00-ecosystem-shell__content">{children}</div>
          </div>
        </div>
        <OperatingWorldStatusRail />
      </div>

      <div className="site00-ecosystem-shell__mobile">
        <Site00EcosystemMobileShell activeNav={activeNav} shellClassName="site00-ecosystem-mobile-shell">
          <EcosystemPageHeader title={pageTitle} subtitle={pageSubtitle} actions={headerActions} />
          <div className="site00-ecosystem-mobile__content">{children}</div>
        </Site00EcosystemMobileShell>
      </div>
    </div>
  );
}

/** @deprecated Use EcosystemShell */
export function CtrlRoomShell({ children }: { children: ReactNode }) {
  return <EcosystemShell>{children}</EcosystemShell>;
}
