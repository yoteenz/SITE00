import { Link, useLocation } from 'react-router-dom';
import {
  OPERATING_WORLD_TOP_NAV,
  isOperatingWorldNavActive,
  resolveOperatingWorldNavHref,
} from '../../config/ecosystem-nav';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import { SITE00_ROUTES } from '../../config/routes';
import { site00UserDisplayName, site00UserInitials, useSite00CurrentUser } from '../../hooks/useSite00CurrentUser';
import { CtrlRoomSignOutButton } from '../control/CtrlRoomSignOutButton';
import { useSite00ShellAuth } from '../../auth/Site00ShellAuthContext';
import { useActiveProjectSlug } from '../../hooks/useProjectPresenceAccent';

/** Authenticated workspace top navigation — Operating World board canon. */
export function OperatingWorldTopNav() {
  const { pathname } = useLocation();
  const user = useSite00CurrentUser();
  const { authMode } = useSite00ShellAuth();
  const projectSlug = useActiveProjectSlug() ?? 'site00';
  const previewGuest = authMode === 'PREVIEW_GUEST';
  const displayName = site00UserDisplayName(user);
  const initials = site00UserInitials(user);

  return (
    <header className="site00-operating-topnav" aria-label="OPERATING ENVIRONMENT NAVIGATION">
      <div className="site00-operating-topnav__brand">
        <Link to={SITE00_ROUTES.control} className="site00-operating-topnav__logo">
          SITE 00
        </Link>
        <span className="site00-operating-topnav__env">CONTROL ENVIRONMENT</span>
      </div>
      <nav className="site00-operating-topnav__links" aria-label="WORKSPACE SECTIONS">
        <ul>
          {OPERATING_WORLD_TOP_NAV.filter((item) => {
            if (previewGuest) return item.id === 'studio';
            return !item.adminOnly || canAccessAdminPages();
          }).map((item) => {
            const href = resolveOperatingWorldNavHref(item, { previewGuest, projectSlug });
            const active = isOperatingWorldNavActive(pathname, item);
            return (
              <li key={item.id}>
                <Link to={href} aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="site00-operating-topnav__account">
        <Link to={SITE00_ROUTES.idnty} className="site00-operating-topnav__profile" aria-label="ACCOUNT AND IDENTITY">
          <span className="site00-operating-topnav__profile-label">IDNTY</span>
          {displayName ? <span className="site00-operating-topnav__profile-name">{displayName}</span> : null}
          <span className="site00-operating-topnav__avatar" aria-hidden="true">
            {initials || '—'}
          </span>
        </Link>
        <CtrlRoomSignOutButton variant="topnav" />
      </div>
    </header>
  );
}
