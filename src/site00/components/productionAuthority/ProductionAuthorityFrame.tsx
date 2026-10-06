import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useLocation } from 'react-router-dom';
import { projectFromUrl } from '../../../../shared/site00-production-graph/projectScope.js';
import { readStoredActiveProject, useActiveProjectId } from '../../production/activeProject';
import { ProjectSelectState } from './projectGraph/ProjectScopeStates';
import { useProductionViewportFamily } from '../../hooks/useProductionViewportFamily';
import { ProductionChromeStrip, ProductionWorkspaceHeader, ProductionWorkspaceNav } from '../productionHub/chrome';
import { ProductionAuthorityDataProvider, useProductionAuthorityData } from './ProductionAuthorityData';
import '../../styles/site00-production-authority.css';
import '../../styles/site00-production-authority-opus.css';
import '../../styles/site00-production-authority-assets.css';
import '../../styles/site00-production-authority-opus2.css';
import '../../styles/site00-production-design-pack.css';
// Shared density contract (HUB = authority) — loaded last; selectors are anchored on [data-density].
import '../../styles/site00-production-workspace-density.css';

function useBodyLock() {
  useEffect(() => {
    const { body, documentElement } = document;
    const prev = [body.style.overflow, documentElement.style.overflow];
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    return () => {
      body.style.overflow = prev[0]!;
      documentElement.style.overflow = prev[1]!;
    };
  }, []);
}

function FrameInner({
  children,
  screen,
  subBar,
}: {
  children: ReactNode;
  screen: string;
  subBar?: ReactNode;
}) {
  useBodyLock();
  const family = useProductionViewportFamily();
  return createPortal(
    <div className="pxa" data-testid="production-authority-frame" data-screen={screen} data-family={family} data-density="hub-authority">
      <ProductionChromeStrip host>
        <ProductionWorkspaceHeader />
      </ProductionChromeStrip>
      {subBar}
      <div className="pxa-scroll" data-testid="production-authority-scroll">
        <div className="pxa-body">{children}</div>
      </div>
      <ProductionChromeStrip host>
        <ProductionWorkspaceNav />
      </ProductionChromeStrip>
    </div>,
    document.body,
  );
}

/**
 * Shared Production authority frame: the ONE top host panel, the scrolling body, and the ONE bottom nav.
 * The frame owns the ACTIVE PROJECT for global routes (P0 project isolation): no project → project picker.
 * Every authority screen (HUB, INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY, ACTIVITY) mounts here so the
 * shell converges once instead of per page.
 */
export function ProductionAuthorityFrame({ children, screen, subBar }: { children: ReactNode; screen: string; subBar?: ReactNode }) {
  const existing = useProductionAuthorityData();
  const { pathname, search } = useLocation();
  const activeProject = useActiveProjectId();
  if (existing) {
    return (
      <FrameInner screen={screen} subBar={subBar}>
        {children}
      </FrameInner>
    );
  }
  // Global routes (HUB · INBOX · LIBRARY · ACTIVITY) carry the project in `?project=`: a URL that names none is
  // rewritten to the project the founder last chose, so the address always states whose truth is shown.
  if (!projectFromUrl(pathname, search)) {
    const stored = readStoredActiveProject();
    if (stored) {
      const params = new URLSearchParams(search);
      params.set('project', stored);
      return <Navigate to={`${pathname}?${params.toString()}`} replace />;
    }
  }
  if (!activeProject) {
    // No project chosen: a picker — never a default project's data.
    return (
      <FrameInner screen={screen}>
        <ProjectSelectState />
      </FrameInner>
    );
  }
  return (
    <ProductionAuthorityDataProvider projectId={activeProject}>
      <FrameInner screen={screen} subBar={subBar}>
        {children}
      </FrameInner>
    </ProductionAuthorityDataProvider>
  );
}
