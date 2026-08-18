import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { resolveSite00PublicAsset } from '../../../components/loader/site00LoaderConfig';
import { SITE00_ADMIN_DESKTOP_BG_FILE } from '../../../config/site00-auth-assets';
import { getSupabase } from '../../../../utils/supabase';
import {
  SITE00_ADMIN_MOBILE_NAV,
  SITE00_ADMIN_NAV,
  SITE00_ADMIN_PRODUCTION_NAV,
  type Site00AdminNavItem,
} from '../../config/nav';
import { Site00AdminHeader } from './Site00AdminHeader';

type Site00AdminShellProps = {
  children: ReactNode;
  approvalBadge?: number;
};

const adminBgStyle = {
  backgroundImage: `url(${resolveSite00PublicAsset(SITE00_ADMIN_DESKTOP_BG_FILE)})`,
} as const;

function AdminNavIcon({ id }: { id?: string }) {
  const common = { width: 14, height: 14, viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 };
  switch (id) {
    case 'dashboard':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="1.5" y="1.5" width="4.5" height="4.5" />
          <rect x="8" y="1.5" width="4.5" height="4.5" />
          <rect x="1.5" y="8" width="4.5" height="4.5" />
          <rect x="8" y="8" width="4.5" height="4.5" />
        </svg>
      );
    case 'studio':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 11L7 2l5 9H2z" />
        </svg>
      );
    case 'approvals':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 7l3 3 7-7" />
        </svg>
      );
    case 'identities':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="4.5" r="2.2" />
          <path d="M2.5 12c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
        </svg>
      );
    case 'intake':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="2" y="2" width="10" height="10" rx="1" />
          <path d="M4.5 5h5M4.5 7h5M4.5 9h3" />
        </svg>
      );
    case 'projects':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 4h10v7H2z" />
          <path d="M2 6h10" />
        </svg>
      );
    case 'sites':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="7" r="5" />
          <path d="M2 7h10M7 2a8 8 0 0 1 0 10M7 2a8 8 0 0 0 0 10" />
        </svg>
      );
    case 'ctrl':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="2" y="3" width="10" height="8" rx="1" />
          <path d="M5 11v1M9 11v1" />
        </svg>
      );
    case 'leads':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M7 2v10M4 5h6M4 9h6" />
        </svg>
      );
    case 'discovery':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="2" y="3" width="10" height="9" rx="1" />
          <path d="M2 6h10M5 1v2M9 1v2" />
        </svg>
      );
    case 'finance':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M2 4h10M2 7h10M2 10h6" />
        </svg>
      );
    case 'team':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="4.5" cy="5" r="1.5" />
          <circle cx="9.5" cy="5" r="1.5" />
          <path d="M1.5 12c0-2 1.5-3 3-3s3 1 3 3M6.5 12c0-2 1.5-3 3-3s3 1 3 3" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M3 11V7M7 11V3M11 11V5" />
        </svg>
      );
    case 'settings':
    case 'more':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="7" r="1.2" />
          <circle cx="3" cy="7" r="1.2" />
          <circle cx="11" cy="7" r="1.2" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" />
        </svg>
      );
  }
}

function NavLink({ item, pathname, approvalBadge }: { item: Site00AdminNavItem; pathname: string; approvalBadge?: number }) {
  const active =
    pathname === item.href || (item.href !== '/admin/site00' && pathname.startsWith(item.href));
  const badge = item.id === 'approvals' ? approvalBadge : undefined;

  return (
    <Link
      key={item.id}
      to={item.href}
      className={`site00-admin-sidebar__link ${active ? 'site00-admin-sidebar__link--active' : ''}`.trim()}
    >
      <span className="site00-admin-sidebar__link-inner">
        <AdminNavIcon id={item.icon} />
        <span>{item.label}</span>
      </span>
      {badge ? <span className="site00-admin-sidebar__badge">{badge}</span> : null}
    </Link>
  );
}

export function Site00AdminShell({ children, approvalBadge }: Site00AdminShellProps) {
  const { pathname } = useLocation();
  const [profileLabel, setProfileLabel] = useState('ADMIN');

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      if (email) {
        const local = email.split('@')[0]?.replace(/\./g, ' ').toUpperCase();
        setProfileLabel(local || 'ADMIN');
      }
    });
  }, []);

  return (
    <div className="site00-admin-shell site00-admin-shell--with-bg" style={adminBgStyle}>
      <div className="site00-admin-shell__layout">
        <aside className="site00-admin-sidebar" aria-label="SITE 00 admin navigation">
          <div className="site00-admin-sidebar__brand">
            SITE 00 <span aria-hidden="true">+</span>
          </div>
          <nav className="site00-admin-sidebar__nav">
            <p className="site00-admin-sidebar__section">OPERATIONS</p>
            {SITE00_ADMIN_NAV.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} approvalBadge={approvalBadge} />
            ))}
            <p className="site00-admin-sidebar__section">PRODUCTION</p>
            {SITE00_ADMIN_PRODUCTION_NAV.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} approvalBadge={approvalBadge} />
            ))}
          </nav>
          <footer className="site00-admin-sidebar__profile">
            <span className="site00-admin-sidebar__profile-dot" aria-hidden="true" />
            <div>
              <p className="site00-admin-sidebar__profile-name">{profileLabel}</p>
              <p className="site00-admin-sidebar__profile-role">SITE 00 ADMIN</p>
            </div>
          </footer>
        </aside>
        <div className="site00-admin-main">
          <Site00AdminHeader />
          <div className="site00-admin-content">{children}</div>
        </div>
      </div>
      <nav className="site00-admin-mobile-nav" aria-label="Mobile admin navigation">
        <div className="site00-admin-mobile-nav__inner">
          {SITE00_ADMIN_MOBILE_NAV.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'active' : ''}
            >
              <AdminNavIcon id={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
