import { Link, useLocation } from 'react-router-dom';
import {
  MOBILE_SITE_NAV,
  resolveMobileSiteNavId,
  type MobileSiteNavIconId,
  type MobileSiteNavId,
} from '../../config/mobile-site-nav';
import { Site00CtrlRoomIcon } from '../../icons/Site00CtrlRoomIcon';
import { Site00IdntyIcon } from '../../icons/Site00IdntyIcon';
import { Site00ProjectsIcon } from '../../icons/Site00ProjectsIcon';
import { Site00LocationsTargetIcon } from './Site00MobileIcons';

type MobileSiteNavigationProps = {
  /** Optional override — default is route-derived active state. */
  active?: MobileSiteNavId | null;
};

function MobileSiteNavIcon({
  icon,
  active,
  center,
}: {
  icon: MobileSiteNavIconId;
  active: boolean;
  center?: boolean;
}) {
  const size = center ? 24 : 20;

  switch (icon) {
    case 'origin-mark':
      return (
        <span className="site00-mobile-nav__origin-mark" aria-hidden="true">
          00
        </span>
      );
    case 'idnty':
      return <Site00IdntyIcon size={size} className="site00-mobile-nav__svg" />;
    case 'locations-target':
      return <Site00LocationsTargetIcon size={size} active={active} className="site00-mobile-nav__svg" />;
    case 'projects':
      return <Site00ProjectsIcon size={size} className="site00-mobile-nav__svg" />;
    case 'ctrl-room':
      return <Site00CtrlRoomIcon size={size} className="site00-mobile-nav__svg" />;
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
    <nav className="site00-mobile-nav" aria-label="SITE 00 mobile navigation">
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
              <MobileSiteNavIcon icon={item.icon} active={isActive} center={isCenter} />
            </span>
            {item.topLabel ? (
              <span className="site00-mobile-nav__top">{item.topLabel}</span>
            ) : null}
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
