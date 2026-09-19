import { NavLink, Outlet, useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ClientAppManifest } from '../../../../shared/site00-client-app/types.js';
import { CLIENT_APP_NAV } from '../../../../shared/site00-client-app/client.js';
import { useAppPaths } from '../../hooks/useAppBasePath';
import { Site00BellIcon, Site00MoreIcon } from '../../icons/Site00HubIcons';
import {
  ClientAppDiamondIcon,
  ClientAppHomeIcon,
  ClientAppInboxIcon,
  ClientAppProfileIcon,
  ClientAppProjectsIcon,
  ClientAppReviewsIcon,
} from '../../icons/ClientAppNavIcons';

const NAV_ICONS = {
  home: ClientAppHomeIcon,
  projects: ClientAppProjectsIcon,
  reviews: ClientAppReviewsIcon,
  inbox: ClientAppInboxIcon,
  profile: ClientAppProfileIcon,
};

type Site00ClientAppShellProps = {
  manifest: ClientAppManifest;
  activeSection: string;
  children?: ReactNode;
};

export function Site00ClientAppShell({ manifest, activeSection, children }: Site00ClientAppShellProps) {
  const { projectSlug = manifest.projectSlug } = useParams();
  const paths = useAppPaths(projectSlug);
  const accentStyle = { ['--site00-app-accent' as string]: manifest.accentColor };
  const badges = manifest.appExperience.badges;

  const navLinks = CLIENT_APP_NAV.map((item) => {
    const Icon = NAV_ICONS[item.id];
    const to = item.id === 'home' ? paths.home : `${paths.base}/${item.id}`;
    let badge = 0;
    if (item.id === 'inbox') badge = badges.inbox;
    if (item.id === 'reviews') badge = badges.reviews;
    if (item.id === 'projects') badge = badges.tasks;
    return { item, Icon, to, badge };
  });

  return (
    <div className="site00-app site00-app--self-directed" style={accentStyle}>
      <div className="site00-app-shell">
        <nav className="site00-app-side-nav" aria-label="Desktop app navigation">
          <div className="site00-app-side-nav__brand">
            SITE 00
            <ClientAppDiamondIcon className="site00-app-accent" size={8} />
          </div>
          {navLinks.map(({ item, Icon, to, badge }) => (
            <NavLink
              key={item.id}
              to={to}
              end={item.id === 'home'}
              className={({ isActive }) =>
                `site00-app-side-nav__link${isActive || activeSection === item.id ? ' is-active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {badge > 0 ? <span className="site00-app-side-nav__badge">{badge}</span> : null}
            </NavLink>
          ))}
          <div className="site00-app-side-nav__footer">IDEAS MOVE DIFFERENTLY</div>
        </nav>

        <div className="site00-app-content-column">
          <header className="site00-app-header">
            <div className="site00-app-header__project">
              <span className="site00-app-header__name">{manifest.displayName.toUpperCase()}</span>
              <ClientAppDiamondIcon className="site00-app-accent" size={8} />
            </div>
            <div className="site00-app-header__actions">
              <span className="site00-app-header__create">CREATE DIFFERENTLY</span>
              <button type="button" className="site00-app-icon-btn" aria-label="Notifications">
                <Site00BellIcon size={18} />
                {manifest.notificationsUnread > 0 ? <span className="site00-app-icon-btn__dot" /> : null}
              </button>
              <button type="button" className="site00-app-icon-btn" aria-label="More options">
                <Site00MoreIcon size={18} />
              </button>
            </div>
          </header>

          <main className="site00-app-main">{children ?? <Outlet />}</main>
        </div>

        <nav className="site00-app-bottom-nav" aria-label="Mobile app navigation">
          {navLinks.map(({ item, Icon, to, badge }) => (
            <NavLink
              key={item.id}
              to={to}
              end={item.id === 'home'}
              className={({ isActive }) =>
                `site00-app-bottom-nav__link${isActive || activeSection === item.id ? ' is-active' : ''}`
              }
            >
              <span className="site00-app-bottom-nav__icon">
                <Icon size={20} />
                {badge > 0 ? <span className="site00-app-bottom-nav__badge">{badge}</span> : null}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function AppLoadingState() {
  return (
    <div className="site00-app-state">
      <div className="site00-app-state__pulse" aria-hidden="true" />
      <p>LOADING YOUR PROJECT…</p>
    </div>
  );
}

export function AppEmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="site00-app-state">
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

export function AppSectionLabel({ children }: { children: ReactNode }) {
  return <div className="site00-app-section-label">{children}</div>;
}

export function AppCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`site00-app-card ${className}`.trim()}>{children}</div>;
}

export function AppStatusDot({ tone = 'accent' }: { tone?: 'accent' | 'green' | 'orange' | 'blue' | 'grey' | 'yellow' }) {
  return <span className={`site00-app-status-dot site00-app-status-dot--${tone}`} aria-hidden="true" />;
}

export function AppPrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className="site00-app-btn site00-app-btn--primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function AppSecondaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className="site00-app-btn site00-app-btn--secondary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function AppWaveform() {
  return (
    <div className="site00-app-waveform" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{ height: `${20 + ((i * 7) % 60)}%` }} />
      ))}
    </div>
  );
}
