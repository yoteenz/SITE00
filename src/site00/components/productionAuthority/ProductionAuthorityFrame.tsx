import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useProductionViewportFamily } from '../../hooks/useProductionViewportFamily';
import { ProductionChromeStrip, ProductionWorkspaceHeader, ProductionWorkspaceNav } from '../productionHub/chrome';
import { ProductionAuthorityDataProvider, useProductionAuthorityData } from './ProductionAuthorityData';
import '../../styles/site00-production-authority.css';

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

function projectSlugFromPath(pathname: string): string {
  const [root, slug] = pathname.split('/').filter(Boolean);
  if (root !== 'production' || !slug || slug === 'queue' || slug === 'libraries' || slug === 'activity') return 'ndxbook';
  return slug;
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
    <div className="pxa" data-testid="production-authority-frame" data-screen={screen} data-family={family}>
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
 * Every authority screen (HUB, INBOX, DESIGN, EXPERIENCE, EXPRESSION, LIBRARY, ACTIVITY) mounts here so the
 * shell converges once instead of per page.
 */
export function ProductionAuthorityFrame({ children, screen, subBar }: { children: ReactNode; screen: string; subBar?: ReactNode }) {
  const existing = useProductionAuthorityData();
  const { pathname } = useLocation();
  const inner = (
    <FrameInner screen={screen} subBar={subBar}>
      {children}
    </FrameInner>
  );
  if (existing) return inner;
  return <ProductionAuthorityDataProvider projectId={projectSlugFromPath(pathname)}>{inner}</ProductionAuthorityDataProvider>;
}
