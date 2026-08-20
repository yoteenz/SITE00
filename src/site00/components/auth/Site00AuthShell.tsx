import { Link } from 'react-router-dom';
import { resolveSite00PublicAsset } from '../loader/site00LoaderConfig';
import { SITE00_SIGNIN_DESKTOP_BG_FILE, SITE00_SIGNIN_ICON_PATH, SITE00_SIGNIN_ICON_VERSION } from '../../config/site00-auth-assets';
import { SITE00_ROUTES } from '../../config/routes';
import { Site00AuthIntro } from './Site00AuthIntro';
import { Site00OrbitalMark } from './Site00OrbitalMark';
import { Site00SignInForm } from './Site00SignInForm';
import { Site00MobileHeader } from '../mobile/Site00MobileHeader';
import { FastTravelPanel } from '../fast-travel/FastTravelPanel';
import { useEffect, useRef, useState, type ReactNode } from 'react';

type Site00AuthShellProps = {
  children?: ReactNode;
};

const signInBgUrl = resolveSite00PublicAsset(SITE00_SIGNIN_DESKTOP_BG_FILE);
const signInIconUrl = `${resolveSite00PublicAsset(SITE00_SIGNIN_ICON_PATH)}?v=${SITE00_SIGNIN_ICON_VERSION}`;

export function Site00AuthShell({ children }: Site00AuthShellProps) {
  const [fastTravelOpen, setFastTravelOpen] = useState(false);
  const fastTravelTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fastTravelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFastTravelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fastTravelOpen]);

  useEffect(() => {
    if (!signInBgUrl && !signInIconUrl) return;
    const links: HTMLLinkElement[] = [];
    if (signInBgUrl) {
      const bg = document.createElement('link');
      bg.rel = 'preload';
      bg.as = 'image';
      bg.href = signInBgUrl;
      document.head.appendChild(bg);
      links.push(bg);
    }
    if (signInIconUrl) {
      const icon = document.createElement('link');
      icon.rel = 'preload';
      icon.as = 'image';
      icon.href = signInIconUrl;
      document.head.appendChild(icon);
      links.push(icon);
    }
    return () => {
      links.forEach((link) => {
        document.head.removeChild(link);
      });
    };
  }, []);

  return (
    <div className="site00-auth-shell">
      <div className="site00-auth-shell__desktop">
        <aside
          className="site00-auth-shell__brand"
          style={{ backgroundImage: `url(${signInBgUrl})` }}
        >
          <div className="site00-auth-shell__brand-top">
            <Link to={SITE00_ROUTES.originAlias} className="site00-auth-shell__logo">
              SITE 00 <span aria-hidden="true">♦</span>
            </Link>
          </div>
          <div className="site00-auth-shell__brand-center">
            <Site00OrbitalMark className="site00-auth-shell__orbital" />
            <Site00AuthIntro variant="desktop-panel" />
          </div>
          <div className="site00-auth-shell__brand-footer">
            <p className="site00-auth-shell__tagline">SITE 00™ — CONTROL EVERYTHING.</p>
            <div className="site00-auth-shell__legal">
              <Link to="/brand/terms">PRIVACY</Link>
              <Link to="/brand/terms">TERMS</Link>
              <Link to="/brand/contact">SUPPORT</Link>
            </div>
          </div>
        </aside>
        <section className="site00-auth-shell__form-panel">
          {children ?? <Site00SignInForm layout="desktop" />}
        </section>
      </div>

      <div className="site00-auth-shell__mobile">
        <Site00MobileHeader
          onFastTravelOpen={() => setFastTravelOpen(true)}
          fastTravelExpanded={fastTravelOpen}
          fastTravelTriggerRef={fastTravelTriggerRef}
        />
        <main className="site00-auth-shell__mobile-main">
          <Site00AuthIntro variant="mobile" />
          {children ?? <Site00SignInForm layout="mobile" />}
        </main>
        <FastTravelPanel
          open={fastTravelOpen}
          onClose={() => setFastTravelOpen(false)}
          returnFocusRef={fastTravelTriggerRef}
        />
      </div>
    </div>
  );
}
