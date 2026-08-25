/**
 * P0.VR.1D.A — Mobile founder workspace chrome (Image B authority).
 * Independent from desktop rail — sticky header + bottom nav on narrow viewports.
 */

import { Link, useLocation } from 'react-router-dom';
import { ndxFounderWorkspaceMobileNav, resolveMobileScreenIdFromPath } from '../../config/ndxFounderWorkspaceMobileNav';

type Props = {
  projectSlug: string;
  children: React.ReactNode;
};

export function MobileFounderWorkspaceChrome({ projectSlug, children }: Props) {
  const location = useLocation();
  const screenId = resolveMobileScreenIdFromPath(location.pathname, projectSlug);
  const nav = ndxFounderWorkspaceMobileNav(projectSlug);

  return (
    <div
      className={`site00-fws-mobile-chrome site00-fws-mobile-chrome--${screenId}`}
      data-visual-reconstruction={`mobile-${screenId}`}
    >
      <header className="site00-fws-mobile-chrome__header">
        <div className="site00-fws-mobile-chrome__brand">
          <span className="site00-fws-mobile-chrome__title">NDXBOOK</span>
          <span className="site00-fws-mobile-chrome__diamond" aria-hidden>
            ♦
          </span>
        </div>
        <div className="site00-fws-mobile-chrome__actions">
          <button type="button" className="site00-fws-mobile-chrome__icon" aria-label="Notifications">
            ○
          </button>
          <button type="button" className="site00-fws-mobile-chrome__icon" aria-label="More">
            ···
          </button>
        </div>
      </header>

      <div className="site00-fws-mobile-chrome__body">{children}</div>

      <nav className="site00-fws-mobile-chrome__nav" aria-label="NDXBOOK mobile navigation">
        {nav.map((item) => {
          const active = location.pathname.replace(/\/+$/, '') === item.href.replace(/\/+$/, '');
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`site00-fws-mobile-chrome__nav-item${active ? ' site00-fws-mobile-chrome__nav-item--active' : ''}`}
            >
              <span className="site00-fws-mobile-chrome__nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="site00-fws-mobile-chrome__nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
