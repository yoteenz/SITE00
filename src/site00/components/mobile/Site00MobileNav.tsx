import { Link, useLocation } from 'react-router-dom';
import { SITE00_MOBILE_NAV, type Site00MobileNavId } from '../../config/locations-directory';
import { site00MobileBuildNavHref } from '../../config/routes';
import { Site00LocationsTargetIcon } from './Site00MobileIcons';

type Site00MobileNavProps = {
  active: Site00MobileNavId;
};

export function Site00MobileNav({ active }: Site00MobileNavProps) {
  const { pathname } = useLocation();
  const buildHref = site00MobileBuildNavHref(pathname);

  return (
    <nav className="site00-mobile-nav" aria-label="SITE 00 mobile navigation">
      {SITE00_MOBILE_NAV.map((item, index) => {
        const href = item.id === 'build' ? buildHref : item.href;
        const isActive =
          item.id === active ||
          (item.id === 'origin' && (pathname === '/' || pathname === '/origin')) ||
          (item.id === 'locations' && pathname.startsWith('/origin/locations')) ||
          (item.id === 'build' && pathname.startsWith('/bldr')) ||
          (item.id === 'origin' && pathname.startsWith('/evolve'));

        return (
          <Link
            key={item.id}
            to={href}
            className={`site00-mobile-nav__item ${isActive ? 'site00-mobile-nav__item--active' : ''}`.trim()}
            aria-current={isActive ? 'page' : undefined}
            data-nav-id={item.id}
          >
            {item.icon === 'locations-target' ? (
              <Site00LocationsTargetIcon size={22} active={isActive} />
            ) : (
              <span className="site00-mobile-nav__top">{item.topLabel}</span>
            )}
            <span className="site00-mobile-nav__bottom">{item.bottomLabel}</span>
            {index < SITE00_MOBILE_NAV.length - 1 ? (
              <span className="site00-mobile-nav__divider" aria-hidden="true" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
