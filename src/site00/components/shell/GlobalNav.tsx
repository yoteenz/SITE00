import { Link, useLocation } from 'react-router-dom';
import { SITE00_GLOBAL_NAV } from '../../config/navigation';
import { SITE00_ROUTES, site00NavPathIsActive } from '../../config/routes';
import { site00PublicMobilePath } from '../../config/site00-public-pages';
import { site00PreviewNavHref, useSite00 } from '../../state/Site00Context';

export function GlobalNav() {
  const { pathname } = useLocation();
  const { isPreviewDesktop } = useSite00();
  const navPath = site00PublicMobilePath(pathname);

  return (
    <nav aria-label="Global navigation">
      <ul className="site00-global-nav">
        {SITE00_GLOBAL_NAV.map((item) => {
          const href = site00PreviewNavHref(item.href, pathname);
          const active = site00NavPathIsActive(navPath, item.href);
          if (!item.enabled) {
            return (
              <li key={item.id}>
                <button type="button" disabled aria-disabled="true" title="Coming in a future sprint">
                  {item.label}
                </button>
              </li>
            );
          }
          return (
            <li key={item.id}>
              <Link
                to={href}
                aria-current={active ? 'page' : undefined}
                data-site00-preview-desktop={isPreviewDesktop ? '1' : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function site00GlobalNavOriginHref(_pathname: string, _isPreviewDesktop: boolean): string {
  return SITE00_ROUTES.originAlias;
}
