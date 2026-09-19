/**
 * P0.VR.REPLICATION.3C — Authority-faithful SITE 00 host bottom nav (not NDX internal tabs).
 */

import { Link } from 'react-router-dom';
import { MOBILE_SITE_NAV } from '../../config/mobile-site-nav';
import {
  SITE00_MOBILE_NAV_ICON_CENTER_SIZE,
  SITE00_MOBILE_NAV_ICON_DEFAULT_SIZE,
  Site00CtrlRoomNavIcon,
  Site00IdntyNavIcon,
  Site00LocationsNavIcon,
  Site00OriginNavIcon,
  Site00ProjectsNavIcon,
} from '../../icons/mobile-nav';

function NavIcon({ icon, center }: { icon: (typeof MOBILE_SITE_NAV)[number]['icon']; center?: boolean }) {
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

export function TwinSite00HostBottomNav() {
  return (
    <nav className="site00-mobile-nav site00-vlt__host-bottom-nav" aria-label="SITE 00 host navigation" data-shell-band="bottom-nav">
      {MOBILE_SITE_NAV.map((item, index) => {
        const isActive = item.id === 'projects';
        const isCenter = item.id === 'locations';
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
            data-nav-id={item.id}
          >
            <span className="site00-mobile-nav__icon">
              <NavIcon icon={item.icon} center={isCenter} />
            </span>
            <span className="site00-mobile-nav__bottom">{item.bottomLabel}</span>
            {index < MOBILE_SITE_NAV.length - 1 ? <span className="site00-mobile-nav__divider" aria-hidden="true" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
