import { Link, useLocation } from 'react-router-dom';
import {
  MOBILE_SITE_NAV,
  resolveMobileSiteNavId,
  type MobileSiteNavIconId,
  type MobileSiteNavId,
} from '../../config/mobile-site-nav';
import {
  SITE00_MOBILE_NAV_ICON_CENTER_SIZE,
  SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE,
  Site00CtrlRoomNavIcon,
  Site00IdntyNavIcon,
  Site00LocationsNavIcon,
  Site00OriginNavIcon,
  Site00ProjectsNavIcon,
} from '../../icons/mobile-nav';

type MobileSiteNavigationProps = {
  /** Optional override — default is route-derived active state. */
  active?: MobileSiteNavId | null;
};

function MobileSiteNavIcon({
  icon,
  center,
}: {
  icon: MobileSiteNavIconId;
  center?: boolean;
}) {
  const size = center ? SITE00_MOBILE_NAV_ICON_CENTER_SIZE : SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE;
  const className = 'site00-mobile-nav__svg';

  switch (icon) {
    case 'origin':
      return <Site00OriginNavIcon size={size} className={className} />;
    case 'idnty':
      return <Site00IdntyNavIcon size={size} className={className} />;
    case 'locations':
      return <Site00LocationsNavIcon size={size} className={className} />;
    case 'projects':
      return <Site00ProjectsNavIcon size={size} className={className} />;
    case 'ctrl-room':
      return <Site00CtrlRoomNavIcon size={size} className={className} />;
    default:
      return null;
  }
}

/**
 * Canonical SITE 00 mobile bottom navigation — five equal architectural bays.
 * Mobile-only surfaces render this via Site00MobileShell / Site00EcosystemMobileShell.
 */
export function MobileSiteNavigation({ active }: MobileSiteNavigationProps) {
  const { pathname } = useLocation();
  const activeId = active !== undefined ? active : resolveMobileSiteNavId(pathname);

  return (
    <nav className="site00-mobile-nav" aria-label="SITE 00 MOBILE NAVIGATION">
      {MOBILE_SITE_NAV.map((item, index) => {
        const isActive = activeId !== null && item.id === activeId;
        const isCenter = item.id === 'locations';
        const dividerEmphasis = index === 1 || index === 2;

        return (
          <Link
            key={item.id}
            to={item.href}
            className={[
              'site00-mobile-nav__item',
              isActive ? 'site00-mobile-nav__item--active' : '',
              isCenter ? 'site00-mobile-nav__item--center' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={isActive ? 'page' : undefined}
            data-nav-id={item.id}
          >
            <span className="site00-mobile-nav__icon">
              <MobileSiteNavIcon icon={item.icon} center={isCenter} />
            </span>
            <span className="site00-mobile-nav__bottom">{item.bottomLabel}</span>
            {index < MOBILE_SITE_NAV.length - 1 ? (
              <span
                className={`site00-mobile-nav__divider ${dividerEmphasis ? 'site00-mobile-nav__divider--emphasis' : ''}`.trim()}
                aria-hidden="true"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
