/**
 * P0.VR.1D.A / P0.VR.1D.3 + P0.UI.3 — Mobile founder workspace chrome.
 * Sticky header + bottom nav; project menu is owned by FounderWorkspaceShell.
 */

import type { Ref } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ndxFounderWorkspaceMobileNav, resolveMobileScreenIdFromPath } from '../../config/ndxFounderWorkspaceMobileNav';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import { NDXIcon } from '../../icons/ndx';
import { Site00Diamond } from '../shell/Site00Diamond';
import '../../styles/site00-founder-workspace.css';

type Props = {
  projectSlug: string;
  children: React.ReactNode;
  menuOpen?: boolean;
  notificationOpen?: boolean;
  unreadCount?: number;
  bellButtonRef?: Ref<HTMLButtonElement>;
  onToggleMenu?: () => void;
  onOpenNotifications?: () => void;
};

export function MobileFounderWorkspaceChrome({
  projectSlug,
  children,
  menuOpen = false,
  notificationOpen = false,
  unreadCount = 0,
  bellButtonRef,
  onToggleMenu,
  onOpenNotifications,
}: Props) {
  const location = useLocation();
  const screenId = resolveMobileScreenIdFromPath(location.pathname, projectSlug);
  const nav = ndxFounderWorkspaceMobileNav(projectSlug);

  return (
    <div
      className={`site00-fws-mobile-chrome site00-fws-mobile-chrome--${screenId}${menuOpen ? ' site00-fws-mobile-chrome--menu-open' : ''}${notificationOpen ? ' site00-fws-mobile-chrome--notify-open' : ''}`}
      data-visual-reconstruction={`mobile-${screenId}`}
    >
      <header className="site00-fws-mobile-chrome__header" {...vrRegionAttr(NDX_VR_REGION.header)}>
        <div className="site00-fws-mobile-chrome__brand">
          <span className="site00-fws-mobile-chrome__title">NDXBOOK</span>
          <span className="site00-fws-mobile-chrome__diamond" aria-hidden="true">
            <Site00Diamond mode="PROJECT_CONTEXT" projectSlug={projectSlug} />
          </span>
        </div>
        <div className="site00-fws-mobile-chrome__actions">
          <button
            ref={bellButtonRef}
            type="button"
            className={`site00-fws-mobile-chrome__icon site00-fws-mobile-chrome__icon--bell${notificationOpen ? ' site00-fws-mobile-chrome__icon--bell-open' : ''}${unreadCount > 0 ? ' site00-fws-mobile-chrome__icon--bell-unread' : ''}`}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            aria-haspopup="dialog"
            aria-expanded={notificationOpen}
            onClick={onOpenNotifications}
          >
            <NDXIcon
              name="notifications"
              size={NDX_ICON_CONTEXT_SIZE.header}
              state={notificationOpen || unreadCount > 0 ? 'active' : 'inactive'}
              decorative
            />
            {unreadCount > 0 ? (
              <span className="site00-fws-mobile-chrome__badge" aria-hidden="true">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
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

      <nav className="site00-fws-mobile-chrome__nav" aria-label="NDXBOOK mobile navigation" {...vrRegionAttr(NDX_VR_REGION.bottomNav)}>
        {nav.map((item) => {
          const active = item.id === 'more' ? menuOpen : item.screenId === screenId;

          if (item.id === 'more') {
            return (
              <button
                key={item.id}
                type="button"
                className={`site00-fws-mobile-chrome__nav-item${active ? ' site00-fws-mobile-chrome__nav-item--active' : ''}`}
                aria-label="More workspace destinations"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={onToggleMenu}
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
              </button>
            );
          }

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
