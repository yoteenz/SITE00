/**
 * P0.VR.2B / P0.VR.3M / P0.VR.3M.1 — SITE 00 host shell for Design workspace.
 */

import type { ReactNode, RefObject } from 'react';
import { Link } from 'react-router-dom';
import {
  DESIGN_WORKSPACE_SUBTITLE,
  SITE00_DESIGN_NAV_ITEMS,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';
import type { ManagedProjectContextAccent } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/types.js';
import type { DesignHostMenu } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m1/client.js';
import {
  DesignWorkspaceBellIcon,
  DesignWorkspaceBrandMark,
  DesignWorkspaceMoreIcon,
  DesignWorkspaceNavIcon,
} from './DesignWorkspaceNavIcon';

export type Site00DesignWorkspaceShellProps = {
  breadcrumb: string;
  managedProjectDisplayName: string;
  managedProjectAccent?: ManagedProjectContextAccent;
  children: ReactNode;
  bottomPanel?: ReactNode;
  activeHostMenu?: DesignHostMenu;
  unreadNotificationCount?: number;
  onToggleNotifications?: () => void;
  onToggleOverflow?: () => void;
  notifyMobileRef?: RefObject<HTMLButtonElement | null>;
  notifyDesktopRef?: RefObject<HTMLButtonElement | null>;
  overflowMobileRef?: RefObject<HTMLButtonElement | null>;
  overflowDesktopRef?: RefObject<HTMLButtonElement | null>;
};

function HostIconButton({
  label,
  active,
  unreadCount,
  onClick,
  buttonRef,
  children,
  controlsId,
}: {
  label: string;
  active: boolean;
  unreadCount?: number;
  onClick?: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  controlsId: string;
}) {
  return (
    <button
      ref={buttonRef as RefObject<HTMLButtonElement>}
      type="button"
      className={`site00-dw-shell__icon-btn${active ? ' is-active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      aria-controls={controlsId}
      aria-haspopup="true"
    >
      {children}
      {unreadCount && unreadCount > 0 ? (
        <span className="site00-dw-shell__badge" aria-label={`${unreadCount} unread notifications`}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      ) : null}
    </button>
  );
}

export function Site00DesignWorkspaceShell({
  breadcrumb,
  managedProjectDisplayName,
  managedProjectAccent = 'NEUTRAL',
  children,
  bottomPanel,
  activeHostMenu = 'NONE',
  unreadNotificationCount = 0,
  onToggleNotifications,
  onToggleOverflow,
  notifyMobileRef,
  notifyDesktopRef,
  overflowMobileRef,
  overflowDesktopRef,
}: Site00DesignWorkspaceShellProps) {
  const notificationsOpen = activeHostMenu === 'NOTIFICATIONS';
  const overflowOpen = activeHostMenu === 'OVERFLOW';

  return (
    <div
      className="site00-dw-shell"
      data-visual-reconstruction="p0vr2b-host-shell"
      data-design-workspace-owner="SITE00"
      data-design-host-shell="SITE00_DESIGN_WORKSPACE_SHELL"
      data-host-menu={activeHostMenu}
    >
      <aside className="site00-dw-shell__sidebar" aria-label="SITE 00 navigation">
        <div className="site00-dw-shell__brand">
          <span className="site00-dw-shell__brand-mark" aria-hidden>
            <DesignWorkspaceBrandMark />
          </span>
          <div>
            <strong>SITE 00</strong>
            <span>DESIGN RECONSTRUCTION</span>
          </div>
        </div>
        <nav className="site00-dw-shell__nav">
          <ul>
            {SITE00_DESIGN_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`site00-dw-shell__nav-link${'active' in item && item.active ? ' is-active' : ''}`}
                >
                  <DesignWorkspaceNavIcon navId={item.id} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site00-dw-shell__sidebar-foot">
          <Link to="/account" className="site00-dw-shell__foot-link">
            ACCOUNT
          </Link>
          <Link to="/" className="site00-dw-shell__foot-link">
            EXIT 00
          </Link>
        </div>
      </aside>

      <div className="site00-dw-shell__main">
        <header className="site00-dw-shell__mobile-top" aria-label="SITE 00 mobile header">
          <div className="site00-dw-shell__mobile-brand">
            <span className="site00-dw-shell__brand-mark" aria-hidden>
              <DesignWorkspaceBrandMark />
            </span>
            <strong>SITE 00</strong>
          </div>
          <div className="site00-dw-shell__mobile-actions">
            <HostIconButton
              label="Notifications"
              active={notificationsOpen}
              unreadCount={unreadNotificationCount}
              onClick={onToggleNotifications}
              buttonRef={notifyMobileRef}
              controlsId="site00-dw-notification-menu"
            >
              <DesignWorkspaceBellIcon active={notificationsOpen || unreadNotificationCount > 0} />
            </HostIconButton>
            <HostIconButton
              label="Design workspace menu"
              active={overflowOpen}
              onClick={onToggleOverflow}
              buttonRef={overflowMobileRef}
              controlsId="site00-dw-overflow-menu"
            >
              <DesignWorkspaceMoreIcon active={overflowOpen} />
            </HostIconButton>
          </div>
        </header>

        <header className="site00-dw-shell__project-header">
          <div className="site00-dw-shell__project-row">
            <div className="site00-dw-shell__project-title">
              <span>SITE 00</span>
              <span className="site00-dw-shell__project-diamond site00-dw-shell__project-diamond--host" aria-hidden />
            </div>
            <div
              className="site00-dw-shell__project-context-badge"
              data-project-accent={managedProjectAccent}
              aria-label={`Managed project context ${managedProjectDisplayName}`}
            >
              <span className="site00-dw-shell__project-context-label">PROJECT</span>
              <span className="site00-dw-shell__project-context-name">{managedProjectDisplayName}</span>
            </div>
            <div className="site00-dw-shell__project-actions site00-dw-shell__project-actions--desktop">
              <HostIconButton
                label="Notifications"
                active={notificationsOpen}
                unreadCount={unreadNotificationCount}
                onClick={onToggleNotifications}
                buttonRef={notifyDesktopRef}
                controlsId="site00-dw-notification-menu"
              >
                <DesignWorkspaceBellIcon active={notificationsOpen || unreadNotificationCount > 0} />
              </HostIconButton>
              <HostIconButton
                label="Design workspace menu"
                active={overflowOpen}
                onClick={onToggleOverflow}
                buttonRef={overflowDesktopRef}
                controlsId="site00-dw-overflow-menu"
              >
                <DesignWorkspaceMoreIcon active={overflowOpen} />
              </HostIconButton>
            </div>
          </div>
          <p className="site00-dw-shell__breadcrumb">{breadcrumb}</p>
          <h1 className="site00-dw-shell__title">DESIGN RECONSTRUCTION</h1>
          <p className="site00-dw-shell__subtitle">{DESIGN_WORKSPACE_SUBTITLE}</p>
        </header>

        <div className="site00-dw-shell__content">{children}</div>

        {bottomPanel ? (
          <footer
            className="site00-dw-shell__bottom-panel"
            data-design-host-shell="SITE00_DESIGN_WORKSPACE_SHELL"
            aria-label="SITE 00 Design workspace status"
          >
            {bottomPanel}
          </footer>
        ) : null}
      </div>
    </div>
  );
}

export function site00HostShellUsedNotNdxShell(): boolean {
  return true;
}
