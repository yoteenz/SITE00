import { Link, useLocation } from 'react-router-dom';
import { SITE00_GLOBAL_NAV } from '../../config/navigation';
import { SITE00_CTRL_ROOM_PATH, site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { SITE00_ROUTES, site00NavPathIsActive } from '../../config/routes';
import { site00PublicMobilePath, site00PublicNavHref } from '../../config/site00-public-pages';
import { useSignedInFromStorage } from '../../../hooks/useSignedInFromStorage';
import { isSite00CtrlRoomActive } from '../../config/mobile-directory-nav';

const TOP_NAV_EXTRA = [
  { id: 'idnty', label: 'IDNTY', href: SITE00_ROUTES.idnty, enabled: true },
  { id: 'bldr', label: 'BLDR / START BUILD', href: SITE00_ROUTES.bldr, enabled: true },
] as const;

export function Site00PublicTopNav() {
  const { pathname } = useLocation();
  const [isSignedIn] = useSignedInFromStorage();
  const ctrlRoomHref = isSignedIn
    ? SITE00_CTRL_ROOM_PATH
    : site00SignInHrefWithReturnTo({ pathname: SITE00_CTRL_ROOM_PATH, search: '' });

  const items = [
    ...SITE00_GLOBAL_NAV.filter((item) => item.enabled),
    ...TOP_NAV_EXTRA,
  ];

  return (
    <nav className="site00-public-topnav" aria-label="Top navigation">
      <ul>
        {items.map((item) => {
          const href =
            isSignedIn && item.id === 'sites'
              ? SITE00_ROUTES.controlSites
              : site00PublicNavHref(item.href, pathname);
          const active =
            item.id === 'sites' && isSignedIn
              ? pathname.startsWith(SITE00_ROUTES.controlSites)
              : site00NavPathIsActive(site00PublicMobilePath(pathname), item.href) ||
                site00PublicMobilePath(pathname).startsWith(`${item.href}/`);
          return (
            <li key={item.id}>
              <Link to={href} aria-current={active ? 'page' : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            to={ctrlRoomHref}
            className={`site00-public-topnav__ctrl ${isSite00CtrlRoomActive(pathname) ? 'site00-public-topnav__ctrl--active' : ''}`.trim()}
            aria-current={isSite00CtrlRoomActive(pathname) ? 'page' : undefined}
          >
            CTRL ROOM
          </Link>
        </li>
      </ul>
    </nav>
  );
}
