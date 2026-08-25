import { Link, useLocation } from 'react-router-dom';
import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import type { NdxBottomNavItem } from '../../config/ndxFounderWorkspaceIcons';

type FounderWorkspaceMobileNavProps = {
  items: NdxBottomNavItem[];
  onMore: () => void;
};

export function FounderWorkspaceMobileNav({ items, onMore }: FounderWorkspaceMobileNavProps) {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, '');

  const isActive = (href: string) => {
    if (href === '#more') return false;
    return normalizedPath === href.replace(/\/+$/, '') || normalizedPath.startsWith(`${href.replace(/\/+$/, '')}/`);
  };

  return (
    <nav className="site00-fws-mobile-nav" aria-label="NDX workspace">
      {items.map((item) => {
        const active = isActive(item.href);
        const iconState = active ? 'active' : 'inactive';

        if (item.id === 'MORE') {
          return (
            <button
              key={item.id}
              type="button"
              className="site00-fws-mobile-nav__item"
              onClick={onMore}
              aria-label="More workspace destinations"
            >
              <span className="site00-fws-mobile-nav__icon" aria-hidden="true">
                <NDXIcon name={item.icon} size={NDX_ICON_CONTEXT_SIZE.bottomNav} state={iconState} decorative />
              </span>
              <span className="site00-fws-mobile-nav__label">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            to={item.href}
            className={`site00-fws-mobile-nav__item${active ? ' site00-fws-mobile-nav__item--active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="site00-fws-mobile-nav__icon" aria-hidden="true">
              <NDXIcon name={item.icon} size={NDX_ICON_CONTEXT_SIZE.bottomNav} state={iconState} decorative />
            </span>
            <span className="site00-fws-mobile-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
