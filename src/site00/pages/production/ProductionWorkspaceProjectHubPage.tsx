import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { PRODUCTION_TOP_LEVEL_WORKSPACES } from '../../../../shared/site00-production-workspace/registry.js';
import {
  productionDesignPath,
  productionExperiencePath,
  productionExpressionPath,
} from '../../../../shared/site00-production-workspace/routes.js';
import { PwFrame } from '../../components/production/PwFrame';
import { ProductionWorkspaceProvider, useProductionWorkspaceContext } from '../../context/ProductionWorkspaceContext';
import type { ProductionWorkspaceType } from '../../../../shared/site00-production-workspace/types.js';
import '../../styles/site00-production-mobile.css';

/**
 * Design keeps its own full-screen workspace surface (canonical, unchanged). A slim SITE 00 bar
 * carries the pillar switch above it so Production wayfinding stays consistent.
 */
function DesignPillarBar() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const { setActiveWorkspace } = useProductionWorkspaceContext();
  const slug = projectSlug.toLowerCase();
  const tabs: { id: ProductionWorkspaceType; href: string }[] = [
    { id: 'DESIGN', href: productionDesignPath(slug) },
    { id: 'EXPERIENCE', href: productionExperiencePath(slug) },
    { id: 'EXPRESSION', href: productionExpressionPath(slug) },
  ];
  const numeral = (id: ProductionWorkspaceType) => (id === 'DESIGN' ? '01' : id === 'EXPERIENCE' ? '02' : '03');
  return (
    <header className="pw-bar" data-testid="production-pillar-nav">
      <Link to="/production" className="pw-bar__back" aria-label="Production hub">
        ‹ PRODUCTION
      </Link>
      <span className="pw-bar__project">{slug.toUpperCase()}</span>
      <nav aria-label="Production workspace pillars" className="pw-bar__tabs">
        {tabs.map((t) => (
          <Link
            key={t.id}
            to={t.href}
            data-testid={`production-tab-${t.id.toLowerCase()}`}
            aria-label={t.id}
            title={t.id}
            aria-current={t.id === 'DESIGN' ? 'page' : undefined}
            className={t.id === 'DESIGN' ? 'is-active' : ''}
            onClick={() => setActiveWorkspace(t.id)}
          >
            {numeral(t.id)}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function ProjectLayoutInner() {
  const { pathname } = useLocation();
  const isDesign = /^\/production\/[^/]+\/design(\/|$)/.test(pathname);
  return (
    <div data-testid="production-workspace-shell" data-top-level-count={PRODUCTION_TOP_LEVEL_WORKSPACES.length}>
      {isDesign ?
        <>
          <DesignPillarBar />
          <Outlet />
        </>
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
