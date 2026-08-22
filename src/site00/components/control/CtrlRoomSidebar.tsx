import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CTRL_ROOM_NAV, isCtrlRoomNavActive } from '../../config/ctrl-room-nav';
import { SITE00_ROUTES } from '../../config/routes';
import { canAccessAdminPages, signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { trackActivity } from '../../../utils/activity';

export function CtrlRoomSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const showAdminAccess = canAccessAdminPages();

  const onLogout = async () => {
    trackActivity('sign_out');
    await signOutAppAndSupabaseSession();
    navigate(SITE00_ROUTES.originAlias, { replace: true });
  };

  return (
    <aside className="site00-ctrl-sidebar" aria-label="CTRL ROOM NAVIGATION">
      <Link to={SITE00_ROUTES.originAlias} className="site00-ctrl-sidebar__logo">
        SITE 00 <span aria-hidden="true">♦</span>
      </Link>
      <nav className="site00-ctrl-sidebar__nav">
        <ul>
          {CTRL_ROOM_NAV.map((item) => {
            const active = isCtrlRoomNavActive(pathname, item.href);
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`site00-ctrl-sidebar__link ${active ? 'site00-ctrl-sidebar__link--active' : ''}`.trim()}
                  aria-current={active ? 'page' : undefined}
                >
                  {active ? <span className="site00-ctrl-sidebar__indicator" aria-hidden="true" /> : null}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {showAdminAccess ? (
          <div className="site00-ctrl-sidebar__admin">
            <Link
              to={SITE00_ROUTES.adminDashboard}
              className={`site00-ctrl-sidebar__link site00-ctrl-sidebar__link--admin ${
                pathname.startsWith(SITE00_ROUTES.adminDashboard) ? 'site00-ctrl-sidebar__link--active' : ''
              }`.trim()}
            >
              00 / CONTROL →
            </Link>
          </div>
        ) : null}
      </nav>
      <button type="button" className="site00-ctrl-sidebar__logout" onClick={() => void onLogout()}>
        LOG OUT
      </button>
    </aside>
  );
}
