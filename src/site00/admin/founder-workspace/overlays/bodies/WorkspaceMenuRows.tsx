import { Link, useLocation } from 'react-router-dom';
import { SITE00_ROUTES } from '../../../../config/routes';
import { FOUNDER_WORKSPACE_SIDEBAR_NAV, navItemIsActive } from '../../config/navigation';
import { WsIcon } from '../../shell/wsKit';

const ICON: Record<string, string> = {
  overview: 'home',
  foundations: 'users',
  reviews: 'approval',
  operations: 'checklist',
  correspondence: 'email',
  referrals: 'share',
  system: 'server',
};

/** Menu drawer rows (ws-menu__i): every destination with its index, the current one marked, then tools. */
export function WorkspaceMenuRows({ onNavigate }: { onNavigate: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav className="ws-menu" aria-label="WORKSPACE MENU">
      {FOUNDER_WORKSPACE_SIDEBAR_NAV.map((n) => {
        const on = navItemIsActive(pathname, n.href);
        return (
          <Link key={n.id} to={n.href} onClick={onNavigate} className={`ws-menu__i ${on ? 'ws-menu__i--act' : ''}`.trim()} aria-current={on ? 'page' : undefined}>
            <WsIcon name={ICON[n.id]} />
            <span>
              {n.ordinal} · {n.label.toUpperCase()}
            </span>
            <span className="ws-meta" />
          </Link>
        );
      })}
      <div className="ws-menu__sep" role="separator" />
      <Link to={SITE00_ROUTES.digitalFoundationReadiness} onClick={onNavigate} className="ws-menu__i">
        <WsIcon name="checklist" />
        <span>READINESS DESK</span>
        <span className="ws-meta">↗</span>
      </Link>
    </nav>
  );
}
