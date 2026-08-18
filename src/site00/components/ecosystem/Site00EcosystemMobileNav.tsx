import { Link, useLocation } from 'react-router-dom';
import {
  ECOSYSTEM_MOBILE_NAV,
  isEcosystemMobileNavActive,
  type EcosystemNavId,
} from '../../config/ecosystem-nav';

type Site00EcosystemMobileNavProps = {
  active?: EcosystemNavId;
};

export function Site00EcosystemMobileNav({ active }: Site00EcosystemMobileNavProps) {
  const { pathname } = useLocation();

  return (
    <nav className="site00-ecosystem-mobile-nav" aria-label="SITE 00 ecosystem navigation">
      {ECOSYSTEM_MOBILE_NAV.map((item, index) => {
        const isActive = active ? item.id === active : isEcosystemMobileNavActive(pathname, item.id);

        return (
          <Link
            key={item.id}
            to={item.href}
            className={`site00-ecosystem-mobile-nav__item ${isActive ? 'site00-ecosystem-mobile-nav__item--active' : ''}`.trim()}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="site00-ecosystem-mobile-nav__top">{item.topLabel}</span>
            {item.bottomLabel ? (
              <span className="site00-ecosystem-mobile-nav__bottom">{item.bottomLabel}</span>
            ) : null}
            {index < ECOSYSTEM_MOBILE_NAV.length - 1 ? (
              <span className="site00-ecosystem-mobile-nav__divider" aria-hidden="true" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
