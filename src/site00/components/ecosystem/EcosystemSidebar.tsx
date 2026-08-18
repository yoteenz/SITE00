import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ECOSYSTEM_RAIL_NAV, isEcosystemRailActive } from '../../config/ecosystem-nav';
import { SITE00_ROUTES } from '../../config/routes';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { trackActivity } from '../../../utils/activity';
import { site00UserDisplayName, useSite00CurrentUser } from '../../hooks/useSite00CurrentUser';

export function EcosystemSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useSite00CurrentUser();
  const displayName = site00UserDisplayName(user);

  const onLogout = async () => {
    trackActivity('sign_out');
    await signOutAppAndSupabaseSession();
    navigate(SITE00_ROUTES.originAlias, { replace: true });
  };

  return (
    <aside className="site00-ecosystem-sidebar" aria-label="SITE 00 ecosystem navigation">
      <Link to={SITE00_ROUTES.originAlias} className="site00-ecosystem-sidebar__logo">
        SITE 00 <span className="site00-ecosystem-sidebar__mark" aria-hidden="true">♦</span>
      </Link>
      <nav className="site00-ecosystem-sidebar__nav">
        <ul>
          {ECOSYSTEM_RAIL_NAV.map((item) => {
            const active = isEcosystemRailActive(pathname, item);
            return (
              <li key={item.id} className={item.dividerBefore ? 'site00-ecosystem-sidebar__divider-item' : undefined}>
                {item.dividerBefore ? <span className="site00-ecosystem-sidebar__divider" aria-hidden="true" /> : null}
                <Link
                  to={item.href}
                  className={`site00-ecosystem-sidebar__link ${active ? 'site00-ecosystem-sidebar__link--active' : ''}`.trim()}
                  aria-current={active ? 'page' : undefined}
                >
                  {active ? <span className="site00-ecosystem-sidebar__indicator" aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {displayName ? (
        <div className="site00-ecosystem-sidebar__user">
          <span className="site00-ecosystem-sidebar__user-name">{displayName}</span>
        </div>
      ) : null}
      <button type="button" className="site00-ecosystem-sidebar__logout" onClick={() => void onLogout()}>
        LOG OUT
      </button>
    </aside>
  );
}
