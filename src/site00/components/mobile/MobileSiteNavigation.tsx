import { Link, useLocation } from 'react-router-dom';
import {
  MOBILE_SITE_NAV,
  resolveMobileSiteNavId,
  type MobileSiteNavIconId,
  type MobileSiteNavId,
} from '../../config/mobile-site-nav';
import { Site00MobileNavAssetIcon } from '../../icons/mobile-nav/Site00MobileNavAssetIcon';

type MobileSiteNavigationProps = {
  /** Optional override — default is route-derived active state. */
  active?: MobileSiteNavId | null;
  /**
   * Public redesign: the second bay is contextual. Inside BLDR it reads BUILDER, inside EVOLVE it
   * reads EVOLVE; it keeps the IDNTY bay position and icon.
   */
  contextualBay?: { label: string; href: string } | null;
};

function MobileSiteNavIcon({
  icon,
  center,
}: {
  icon: MobileSiteNavIconId;
  center?: boolean;
}) {
  return <Site00MobileNavAssetIcon icon={icon} center={center} className="site00-mobile-nav__svg" />;
}

/**
 * Canonical SITE 00 mobile bottom navigation — five equal architectural bays.
 * Mobile-only surfaces render this via Site00MobileShell / Site00EcosystemMobileShell.
 */
export function MobileSiteNavigation({ active, contextualBay = null }: MobileSiteNavigationProps) {
  const { pathname } = useLocation();
  const activeId = active !== undefined ? active : resolveMobileSiteNavId(pathname);

  return (
    <nav className="site00-mobile-nav" aria-label="SITE 00 MOBILE NAVIGATION">
      {MOBILE_SITE_NAV.map((item, index) => {
        const isActive = activeId !== null && item.id === activeId;
        const isCenter = item.id === 'locations';
        const dividerEmphasis = index === 1 || index === 2;
        const bay = item.id === 'idnty' && contextualBay ? contextualBay : null;

        return (
          <Link
            key={item.id}
            to={bay?.href ?? item.href}
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
            <span className="site00-mobile-nav__bottom">{bay?.label ?? item.bottomLabel}</span>
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
