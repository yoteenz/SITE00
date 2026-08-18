import { Link, useLocation } from 'react-router-dom';
import { SITE00_PUBLIC_RAIL_NAV, isSite00PublicRailActive } from '../../config/site00-public-rail-nav';
import { SITE00_ROUTES } from '../../config/routes';
import { site00PublicNavHref } from '../../config/site00-public-pages';
import { SITE00_CTRL_ROOM_PATH, site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { isSite00CtrlRoomActive } from '../../config/mobile-directory-nav';

export function Site00PublicSidebar() {
  const { pathname } = useLocation();
  const [isSignedIn] = useSignedInFromStorage();
  const ctrlRoomHref = isSignedIn
    ? SITE00_CTRL_ROOM_PATH
    : site00SignInHrefWithReturnTo({ pathname: SITE00_CTRL_ROOM_PATH, search: '' });

  return (
    <aside className="site00-public-sidebar" aria-label="SITE 00 navigation">
      <Link to="/origin" className="site00-public-sidebar__logo">
        SITE 00 <span className="site00-public-sidebar__mark" aria-hidden="true">◆</span>
      </Link>
      <nav className="site00-public-sidebar__nav">
        <ul>
          {SITE00_PUBLIC_RAIL_NAV.map((item) => {
            const linkHref =
              isSignedIn && item.id === 'sites'
                ? SITE00_ROUTES.controlSites
                : site00PublicNavHref(item.href, pathname);
            const active =
              item.id === 'sites' && isSignedIn
                ? pathname.startsWith(SITE00_ROUTES.controlSites)
                : isSite00PublicRailActive(pathname, item);
            return (
              <li key={item.id} className={item.dividerBefore ? 'site00-public-sidebar__divider' : undefined}>
                <Link
                  to={linkHref}
                  className={`site00-public-sidebar__link ${active ? 'site00-public-sidebar__link--active' : ''}`.trim()}
                  aria-current={active ? 'page' : undefined}
                >
                  {active ? (
                    <span className="site00-public-sidebar__indicator" aria-hidden="true" />
                  ) : null}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="site00-public-sidebar__utility">
        <Link
          to={ctrlRoomHref}
          className={`site00-public-sidebar__ctrl ${isSite00CtrlRoomActive(pathname) ? 'site00-public-sidebar__ctrl--active' : ''}`.trim()}
        >
          CTRL ROOM
        </Link>
        {isSignedIn ? (
          <button
            type="button"
            className="site00-public-sidebar__logout"
            onClick={() => void signOutAppAndSupabaseSession()}
          >
            LOG OUT
          </button>
        ) : null}
      </div>
    </aside>
  );
}
