import { Outlet, useLocation } from 'react-router-dom';
import { PRODUCTION_TOP_LEVEL_WORKSPACES } from '../../../../shared/site00-production-workspace/registry.js';
import { PwFrame } from '../../components/production/PwFrame';
import { ProductionChromeOverlay } from '../../components/productionHub/chrome';
import { ProductionWorkspaceProvider } from '../../context/ProductionWorkspaceContext';
import '../../styles/site00-production-mobile.css';

function ProjectLayoutInner() {
  const { pathname } = useLocation();
  const isCanonicalDesign =
    /^\/production\/[^/]+\/design(\/|$)/.test(pathname) &&
    !pathname.includes('/design-workspace') &&
    !pathname.includes('/design-legacy');
  const isDesignLegacy = /^\/production\/[^/]+\/design-legacy(\/|$)/.test(pathname);
  const isDesign = isCanonicalDesign || isDesignLegacy;
  const isFabrication = /\/character-fabrication(\/|$)/.test(pathname);
  return (
    <div data-testid="production-workspace-shell" data-top-level-count={PRODUCTION_TOP_LEVEL_WORKSPACES.length}>
      {isDesign ?
        <>
          <ProductionChromeOverlay />
          <div className="production-design-host" data-testid="production-design-host">
            <Outlet />
          </div>
        </>
      : isFabrication ?
        <Outlet />
      : (
        <PwFrame variant="production">
          <Outlet />
        </PwFrame>
      )}
    </div>
  );
}

export function ProductionWorkspaceProjectLayout() {
  return (
    <ProductionWorkspaceProvider>
      <ProjectLayoutInner />
    </ProductionWorkspaceProvider>
  );
}
