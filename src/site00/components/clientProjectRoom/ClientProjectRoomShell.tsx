import { NavLink, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  CLIENT_PROJECT_ROOM_NAV,
  clientProjectRoomPath,
} from '../../../../shared/site00-client-project-room/client.js';
import type { ClientProjectManifest } from '../../../../shared/site00-client-project-room/types.js';
import { Site00BellIcon, Site00MoreIcon } from '../../icons/Site00HubIcons';
import {
  ClientRoomActivityIcon,
  ClientRoomDiamondIcon,
  ClientRoomLibraryIcon,
  ClientRoomMessagesIcon,
  ClientRoomOverviewIcon,
  ClientRoomReviewsIcon,
} from '../../icons/ClientProjectRoomNavIcons';

type ClientProjectRoomShellProps = {
  manifest: ClientProjectManifest;
  activeSection: string;
  children: ReactNode;
  rightRail?: ReactNode;
};

const NAV_ICONS: Record<string, typeof ClientRoomOverviewIcon> = {
  overview: ClientRoomOverviewIcon,
  reviews: ClientRoomReviewsIcon,
  library: ClientRoomLibraryIcon,
  activity: ClientRoomActivityIcon,
  messages: ClientRoomMessagesIcon,
};

export function ClientProjectRoomShell({
  manifest,
  activeSection,
  children,
  rightRail,
}: ClientProjectRoomShellProps) {
  const { projectSlug = manifest.projectSlug } = useParams();
  const accentStyle = { ['--site00-cpr-project-accent' as string]: manifest.accentColor };

  return (
    <div className="site00-cpr" style={accentStyle}>
      <div className="site00-cpr-shell">
        <header className="site00-cpr-shell__top">
          <div className="site00-cpr-shell__brand">
            <span className="site00-cpr-shell__brand-mark">SITE 00</span>
            <div>
              <div className="site00-cpr-shell__brand-project">
                <span>{manifest.displayName.toUpperCase()}</span>
                <ClientRoomDiamondIcon className="site00-cpr-accent" />
              </div>
              <div className="site00-cpr-shell__brand-meta">{manifest.projectNumber}</div>
            </div>
          </div>
          <div className="site00-cpr-shell__actions">
            <button type="button" className="site00-cpr-icon-btn site00-cpr-icon-btn--notify" aria-label="Notifications">
              <Site00BellIcon size={18} />
              {manifest.notificationsUnread > 0 ? <span className="site00-cpr-icon-btn__dot" /> : null}
            </button>
            <button type="button" className="site00-cpr-icon-btn" aria-label="More options">
              <Site00MoreIcon size={18} />
            </button>
          </div>
        </header>

        <div className="site00-cpr-body">
          <aside className="site00-cpr-sidebar" aria-label="Project navigation">
            <nav className="site00-cpr-sidebar__nav">
              {CLIENT_PROJECT_ROOM_NAV.map((item) => {
                const Icon = NAV_ICONS[item.section] ?? ClientRoomOverviewIcon;
                const to = clientProjectRoomPath(projectSlug, item.section);
                return (
                  <NavLink
                    key={item.id}
                    to={to}
                    end={item.section === 'overview'}
                    className={({ isActive }) =>
                      `site00-cpr-sidebar__link${isActive || activeSection === item.section ? ' is-active' : ''}`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          <div className="site00-cpr-main-wrap">
            <main className="site00-cpr-main">{children}</main>
            {rightRail ? <aside className="site00-cpr-rail">{rightRail}</aside> : null}
          </div>
        </div>

        <nav className="site00-cpr-bottom-nav" aria-label="Mobile project navigation">
          {CLIENT_PROJECT_ROOM_NAV.map((item) => {
            const Icon = NAV_ICONS[item.section] ?? ClientRoomOverviewIcon;
            const to = clientProjectRoomPath(projectSlug, item.section);
            const badge = item.section === 'messages' ? manifest.messageSummary.unreadCount : 0;
            return (
              <NavLink
                key={item.id}
                to={to}
                end={item.section === 'overview'}
                className={({ isActive }) =>
                  `site00-cpr-bottom-nav__link${isActive || activeSection === item.section ? ' is-active' : ''}`
                }
              >
                <span className="site00-cpr-bottom-nav__icon-wrap">
                  <Icon size={20} />
                  {badge > 0 ? <span className="site00-cpr-bottom-nav__badge">{badge}</span> : null}
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
