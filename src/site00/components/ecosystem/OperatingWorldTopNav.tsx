import { Link, useLocation } from 'react-router-dom';
import { OPERATING_WORLD_TOP_NAV, isOperatingWorldNavActive } from '../../config/ecosystem-nav';
import { SITE00_ROUTES } from '../../config/routes';
import { site00UserDisplayName, site00UserInitials, useSite00CurrentUser } from '../../hooks/useSite00CurrentUser';

/** Authenticated workspace top navigation — Operating World board canon. */
export function OperatingWorldTopNav() {
  const { pathname } = useLocation();
  const user = useSite00CurrentUser();
  const displayName = site00UserDisplayName(user);
  const initials = site00UserInitials(user);

  return (
    <header className="site00-operating-topnav" aria-label="Operating environment navigation">
      <div className="site00-operating-topnav__brand">
        <Link to={SITE00_ROUTES.control} className="site00-operating-topnav__logo">
          SITE 00
        </Link>
        <span className="site00-operating-topnav__env">CONTROL ENVIRONMENT</span>
      </div>
      <nav className="site00-operating-topnav__links" aria-label="Workspace sections">
        <ul>
          {OPERATING_WORLD_TOP_NAV.map((item) => {
            const active = isOperatingWorldNavActive(pathname, item);
            return (
              <li key={item.id}>
                <Link to={item.href} aria-current={active ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <Link to={SITE00_ROUTES.idnty} className="site00-operating-topnav__profile" aria-label="Account and identity">
        <span className="site00-operating-topnav__profile-label">IDNTY</span>
        {displayName ? <span className="site00-operating-topnav__profile-name">{displayName}</span> : null}
        <span className="site00-operating-topnav__avatar" aria-hidden="true">
          {initials || '—'}
        </span>
      </Link>
    </header>
  );
}
