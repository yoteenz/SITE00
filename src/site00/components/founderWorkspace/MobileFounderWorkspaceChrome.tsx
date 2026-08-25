/**
 * P0.VR.1D.A / P0.VR.1D.3 + P0.UI.3 — Mobile founder workspace chrome.
 * Sticky header + bottom nav; project menu is owned by FounderWorkspaceShell.
 */

import { Link, useLocation } from 'react-router-dom';
import { ndxFounderWorkspaceMobileNav, resolveMobileScreenIdFromPath } from '../../config/ndxFounderWorkspaceMobileNav';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import { NDXIcon } from '../../icons/ndx';
import '../../styles/site00-founder-workspace.css';

type Props = {
  projectSlug: string;
  children: React.ReactNode;
  menuOpen?: boolean;
  onToggleMenu?: () => void;
  onOpenNotifications?: () => void;
};

export function MobileFounderWorkspaceChrome({
  projectSlug,
  children,
  menuOpen = false,
  onToggleMenu,
  onOpenNotifications,
}: Props) {
  const location = useLocation();
  const screenId = resolveMobileScreenIdFromPath(location.pathname, projectSlug);
  const nav = ndxFounderWorkspaceMobileNav(projectSlug);

  return (
    <div
      className={`site00-fws-mobile-chrome site00-fws-mobile-chrome--${screenId}${menuOpen ? ' site00-fws-mobile-chrome--menu-open' : ''}`}
      data-visual-reconstruction={`mobile-${screenId}`}
    >
      <header className="site00-fws-mobile-chrome__header" data-vr-region="ndx-header">
        <div className="site00-fws-mobile-chrome__brand">
          <span className="site00-fws-mobile-chrome__title">NDXBOOK</span>
          <span className="site00-fws-mobile-chrome__diamond" aria-hidden="true">
            <NDXIcon name="origin" size="xs" state="inactive" decorative />
          </span>
        </div>
        <div className="site00-fws-mobile-chrome__actions">
          <button
            type="button"
            className="site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--bell"
            aria-label="Notifications"
            onClick={onOpenNotifications}
          >
            <NDXIcon name="notifications" size={NDX_ICON_CONTEXT_SIZE.header} state="inactive" decorative />
          </button>
          <button
            type="button"
            className={`site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--menu${menuOpen ? ' site00-fws-mobile-chrome__icon--menu-open' : ''}`}
            aria-label="Project menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={onToggleMenu}
          >
            <NDXIcon name="ellipsis" size={NDX_ICON_CONTEXT_SIZE.header} state={menuOpen ? 'active' : 'inactive'} decorative />
          </button>
        </div>
      </header>

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
              <span className="site00-fws-mobile-chrome__nav-icon" aria-hidden="true">
                <NDXIcon
                  name={item.icon}
                  size={NDX_ICON_CONTEXT_SIZE.bottomNav}
                  state={active ? 'active' : 'inactive'}
                  decorative
                />
              </span>
              <span className="site00-fws-mobile-chrome__nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
