/**
 * P0.VR.2B / P0.VR.3M — SITE 00 host shell for Design workspace (not managed-project shell).
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  DESIGN_WORKSPACE_SUBTITLE,
  SITE00_DESIGN_NAV_ITEMS,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';
import type { ManagedProjectContextAccent } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/types.js';

export type Site00DesignWorkspaceShellProps = {
  breadcrumb: string;
  managedProjectDisplayName: string;
  managedProjectAccent?: ManagedProjectContextAccent;
  children: ReactNode;
  onNotifyClick?: () => void;
};

function NavIcon({ id }: { id: string }) {
  return <span className={`site00-dw-shell__nav-icon site00-dw-shell__nav-icon--${id}`} aria-hidden />;
}

export function Site00DesignWorkspaceShell({
  breadcrumb,
  managedProjectDisplayName,
  managedProjectAccent = 'NEUTRAL',
  children,
  onNotifyClick,
}: Site00DesignWorkspaceShellProps) {
  return (
    <div
      className="site00-dw-shell"
      data-visual-reconstruction="p0vr2b-host-shell"
      data-design-workspace-owner="SITE00"
      data-design-host-shell="SITE00_DESIGN_WORKSPACE_SHELL"
    >
      <aside className="site00-dw-shell__sidebar" aria-label="SITE 00 navigation">
        <div className="site00-dw-shell__brand">
          <span className="site00-dw-shell__brand-mark" aria-hidden>
            ⌜⌝
            <br />
            ⌞⌟
          </span>
          <div>
            <strong>SITE 00</strong>
            <span>DESIGN RECONSTRUCTION</span>
          </div>
        </div>
        <nav className="site00-dw-shell__nav">
          <ul>
            {SITE00_DESIGN_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={`site00-dw-shell__nav-link${'active' in item && item.active ? ' is-active' : ''}`}
                >
                  <NavIcon id={item.id} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site00-dw-shell__sidebar-foot">
          <Link to="/account" className="site00-dw-shell__foot-link">
            ACCOUNT
          </Link>
          <Link to="/" className="site00-dw-shell__foot-link">
            EXIT 00
          </Link>
        </div>
      </aside>

      <div className="site00-dw-shell__main">
        <header className="site00-dw-shell__mobile-top" aria-label="SITE 00 mobile header">
          <div className="site00-dw-shell__mobile-brand">
            <span className="site00-dw-shell__brand-mark" aria-hidden>
              ⌜⌝⌞⌟
            </span>
            <strong>SITE 00</strong>
          </div>
          <div className="site00-dw-shell__mobile-actions">
            <button type="button" className="site00-dw-shell__icon-btn" onClick={onNotifyClick} aria-label="Notifications">
              🔔
            </button>
            <button type="button" className="site00-dw-shell__icon-btn" aria-label="More">
              ⋯
            </button>
          </div>
        </header>

        <header className="site00-dw-shell__project-header">
          <div className="site00-dw-shell__project-row">
            <div className="site00-dw-shell__project-title">
              <span>SITE 00</span>
              <span className="site00-dw-shell__project-diamond site00-dw-shell__project-diamond--host" aria-hidden />
            </div>
            <div
              className="site00-dw-shell__project-context-badge"
              data-project-accent={managedProjectAccent}
              aria-label={`Managed project context ${managedProjectDisplayName}`}
            >
              <span className="site00-dw-shell__project-context-label">PROJECT</span>
              <span className="site00-dw-shell__project-context-name">{managedProjectDisplayName}</span>
            </div>
            <div className="site00-dw-shell__project-actions site00-dw-shell__project-actions--desktop">
              <button type="button" className="site00-dw-shell__icon-btn" onClick={onNotifyClick} aria-label="Notifications">
                🔔
              </button>
              <button type="button" className="site00-dw-shell__icon-btn" aria-label="More">
                ⋯
              </button>
            </div>
          </div>
          <p className="site00-dw-shell__breadcrumb">{breadcrumb}</p>
          <h1 className="site00-dw-shell__title">DESIGN RECONSTRUCTION</h1>
          <p className="site00-dw-shell__subtitle">{DESIGN_WORKSPACE_SUBTITLE}</p>
        </header>

        <div className="site00-dw-shell__content">{children}</div>
      </div>
    </div>
  );
}

export function site00HostShellUsedNotNdxShell(): boolean {
  return true;
}
