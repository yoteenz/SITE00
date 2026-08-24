import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EcosystemShell } from '../ecosystem/EcosystemShell';
import { WorkspaceNavigation } from './WorkspaceNavigation';
import { InspectorDrawer } from './InspectorDrawer';
import type { WorkspaceNavItem } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';
import { ndxWorkspaceNav } from '../../../../shared/site00-brand-lore/founderWorkspace/ndxFounderWorkspaceConfig';
import '../../styles/site00-founder-workspace.css';

type FounderWorkspaceShellProps = {
  projectSlug: string;
  workspaceTitle: string;
  workspaceKicker?: string;
  children: ReactNode;
  inspectTitle?: string;
  inspectContent?: ReactNode;
  navItems?: WorkspaceNavItem[];
  navBadges?: Partial<Record<string, number>>;
  hideHostNav?: boolean;
};

export function FounderWorkspaceShell({
  projectSlug,
  workspaceTitle,
  workspaceKicker = 'NDXBOOK EXPERIMENT HUB',
  children,
  inspectTitle = 'METHODOLOGY / SYSTEM',
  inspectContent,
  navItems,
  navBadges,
}: FounderWorkspaceShellProps) {
  const { pathname } = useLocation();
  const [inspectOpen, setInspectOpen] = useState(false);
  const nav = navItems ?? ndxWorkspaceNav(projectSlug, navBadges);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-fws">
        <aside className="site00-fws__rail" aria-label="Founder workspace navigation">
          <div className="site00-fws__rail-brand">
            <span className="site00-fws__rail-kicker">{workspaceKicker}</span>
            <strong className="site00-fws__rail-title">{workspaceTitle}</strong>
          </div>
          <WorkspaceNavigation items={nav} currentPath={pathname} />
          <button
            type="button"
            className="site00-fws__inspect-entry"
            onClick={() => setInspectOpen(true)}
          >
            INSPECT
            <span className="site00-fws__inspect-sub">METHODOLOGY + SYSTEM</span>
          </button>
          <p className="site00-fws__rail-footer">
            ASSISTED AUTONOMY · IN PRODUCTION
            <br />
            <span className="site00-fws__rail-footer-note">YOU APPROVE. NOTHING PUBLISHES WITHOUT YOU.</span>
          </p>
        </aside>

        <main className="site00-fws__canvas">{children}</main>

        <InspectorDrawer
          open={inspectOpen}
          title={inspectTitle}
          onClose={() => setInspectOpen(false)}
        >
          {inspectContent ?? (
            <p className="site00-fws__inspect-empty">
              Layer 3 inspection — prompt contracts, generation lineage, and forensic metadata appear here on each surface.
            </p>
          )}
        </InspectorDrawer>
      </div>
    </EcosystemShell>
  );
}

export function FounderWorkspaceMobileHeader({
  title,
  backHref,
  backLabel,
  action,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
}) {
  return (
    <header className="site00-fws__mobile-header">
      {backHref ? (
        <Link to={backHref} className="site00-fws__mobile-back">
          ← {backLabel ?? 'BACK'}
        </Link>
      ) : null}
      <h1 className="site00-fws__mobile-title">{title}</h1>
      {action}
    </header>
  );
}
