/**
 * P0.VR.1D.A / P0.VR.1D.3 — Mobile founder workspace chrome.
 * Sticky header + bottom nav + project escape menu on narrow viewports.
 */

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ndxFounderWorkspaceMobileNav, resolveMobileScreenIdFromPath } from '../../config/ndxFounderWorkspaceMobileNav';
import { ProjectEscapeMenu } from './ProjectEscapeMenu';
import '../../styles/site00-founder-workspace.css';

type Props = {
  projectSlug: string;
  children: React.ReactNode;
};

export function MobileFounderWorkspaceChrome({ projectSlug, children }: Props) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const screenId = resolveMobileScreenIdFromPath(location.pathname, projectSlug);
  const nav = ndxFounderWorkspaceMobileNav(projectSlug);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const vrMenuOpen = searchParams.get('vrMenuOpen') === '1';
  const [menuOpen, setMenuOpen] = useState(vrMenuOpen);

  useEffect(() => {
    if (vrMenuOpen) setMenuOpen(true);
  }, [vrMenuOpen]);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      className={`site00-fws-mobile-chrome site00-fws-mobile-chrome--${screenId}${menuOpen ? ' site00-fws-mobile-chrome--menu-open' : ''}`}
      data-visual-reconstruction={`mobile-${screenId}`}
    >
      <header className="site00-fws-mobile-chrome__header" data-vr-region="ndx-header">
        <div className="site00-fws-mobile-chrome__brand">
          <span className="site00-fws-mobile-chrome__title">NDXBOOK</span>
          <span className="site00-fws-mobile-chrome__diamond" aria-hidden>
            ♦
          </span>
        </div>
        <div className="site00-fws-mobile-chrome__actions">
          <button type="button" className="site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--bell" aria-label="Notifications">
            <span aria-hidden>🔔</span>
          </button>
          <button
            ref={menuTriggerRef}
            type="button"
            className={`site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--menu${menuOpen ? ' site00-fws-mobile-chrome__icon--menu-open' : ''}`}
            aria-label="Project menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span aria-hidden>···</span>
          </button>
        </div>
      </header>

      <ProjectEscapeMenu
        projectSlug={projectSlug}
        open={menuOpen}
        onClose={closeMenu}
        triggerRef={menuTriggerRef}
      />

      <div className="site00-fws-mobile-chrome__body">{children}</div>

      <nav className="site00-fws-mobile-chrome__nav" aria-label="NDXBOOK mobile navigation" data-vr-region="ndx-bottom-nav">
        {nav.map((item) => {
          const active = item.screenId === screenId;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`site00-fws-mobile-chrome__nav-item${active ? ' site00-fws-mobile-chrome__nav-item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="site00-fws-mobile-chrome__nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="site00-fws-mobile-chrome__nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
