import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resolveSite00PublicAsset } from '../../../components/loader/site00LoaderConfig';
import { SITE00_ADMIN_DESKTOP_BG_FILE } from '../../../config/site00-auth-assets';
import { getSupabase } from '../../../../utils/supabase';
import { CONTROL_OPERATOR_NAV, controlNavIsActive, type ControlNavItem } from '../../config/control-nav';
import { Site00AdminHeader } from './Site00AdminHeader';

type Site00AdminShellProps = {
  children: ReactNode;
  approvalBadge?: number;
  alertCount?: number;
};

const adminBgStyle = {
  backgroundImage: `url(${resolveSite00PublicAsset(SITE00_ADMIN_DESKTOP_BG_FILE)})`,
} as const;

function ControlNavIcon({ id }: { id: string }) {
  const common = { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 };
  switch (id) {
    case 'command':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" />
          <circle cx="7" cy="7" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'production':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 11L7 2l5 9H2z" />
        </svg>
      );
    case 'reviews':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 7l3 3 7-7" />
        </svg>
      );
    case 'clients':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="4.5" r="2.2" />
          <path d="M2.5 12c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
        </svg>
      );
    case 'assets':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="2" y="3" width="10" height="8" />
        </svg>
      );
    case 'systems':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="7" r="5" />
          <path d="M2 7h10" />
        </svg>
      );
    case 'automation':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 7h3l1.5-3 2 6 1.5-3H12" />
        </svg>
      );
    case 'business':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 4h10M2 7h10M2 10h6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="10" height="10" rx="1" />
        </svg>
      );
  }
}

function NavLink({ item, pathname, badge }: { item: ControlNavItem; pathname: string; badge?: number }) {
  const active = controlNavIsActive(pathname, item.href);
  const showBadge = item.id === 'reviews' && badge && badge > 0;

  return (
    <Link
      to={item.href}
      className={`site00-control-sidebar__link ${active ? 'site00-control-sidebar__link--active' : ''}`.trim()}
    >
      <span className="site00-control-sidebar__link-inner">
        <ControlNavIcon id={item.icon} />
        <span>{item.label}</span>
      </span>
      {showBadge ? <span className="site00-control-sidebar__badge">{badge}</span> : null}
      {active ? <span className="site00-control-sidebar__active-dot" aria-hidden="true" /> : null}
    </Link>
  );
}

export function Site00AdminShell({ children, approvalBadge, alertCount }: Site00AdminShellProps) {
  const { pathname } = useLocation();
  const [profileLabel, setProfileLabel] = useState('OPERATOR');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) {
        const local = email.split('@')[0]?.replace(/\./g, ' ').toUpperCase();
        setProfileLabel(local || 'OPERATOR');
      }
    });
  }, []);

  return (
    <div className="site00-control-shell site00-admin-shell site00-admin-shell--with-bg" style={adminBgStyle}>
      <div className="site00-control-shell__layout site00-admin-shell__layout">
        <aside className="site00-control-sidebar site00-admin-sidebar" aria-label="00 / CONTROL NAVIGATION">
          <div className="site00-control-sidebar__brand">
            <span className="site00-control-sidebar__site">SITE 00</span>
            <span className="site00-control-sidebar__diamond" aria-hidden="true">◆</span>
          </div>
          <p className="site00-control-sidebar__env">00 / CONTROL<br />OPERATOR ENVIRONMENT</p>
          <nav className="site00-control-sidebar__nav">
            {CONTROL_OPERATOR_NAV.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} badge={approvalBadge ?? alertCount} />
            ))}
          </nav>
          <footer className="site00-control-sidebar__profile">
            <span className="site00-control-sidebar__profile-dot" aria-hidden="true" />
            <div>
              <p className="site00-control-sidebar__profile-name">{profileLabel}</p>
              <p className="site00-control-sidebar__profile-role">OWNER / ADMIN</p>
            </div>
          </footer>
          <p className="site00-control-sidebar__version">00 / CONTROL · V2.0.0</p>
        </aside>
        <div className="site00-control-main site00-admin-main">
          <Site00AdminHeader alertCount={alertCount} />
          <div className="site00-control-content site00-admin-content">{children}</div>
        </div>
      </div>
      <nav className="site00-control-mobile-menu" aria-label="MOBILE 00 / CONTROL MENU">
        <details className="site00-control-mobile-menu__details">
          <summary className="site00-control-mobile-menu__toggle">00 / CONTROL</summary>
          <div className="site00-control-mobile-menu__panel">
            {CONTROL_OPERATOR_NAV.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className={controlNavIsActive(pathname, item.href) ? 'active' : ''}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </details>
      </nav>
    </div>
  );
}
