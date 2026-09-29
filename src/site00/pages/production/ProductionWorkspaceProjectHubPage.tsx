import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { PRODUCTION_TOP_LEVEL_WORKSPACES } from '../../../../shared/site00-production-workspace/registry.js';
import {
  productionDesignPath,
  productionExperiencePath,
  productionExpressionPath,
} from '../../../../shared/site00-production-workspace/routes.js';
import { ProductionWorkspaceProvider, useProductionWorkspaceContext } from '../../context/ProductionWorkspaceContext';
import type { ProductionWorkspaceType } from '../../../../shared/site00-production-workspace/types.js';

function ProductionPillarNav() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  const location = useLocation();
  const slug = projectSlug.toLowerCase();
  const { context, setActiveWorkspace } = useProductionWorkspaceContext();

  const tabs: { id: ProductionWorkspaceType; href: string; testId: string }[] = [
    { id: 'DESIGN', href: productionDesignPath(slug), testId: 'production-tab-design' },
    { id: 'EXPERIENCE', href: productionExperiencePath(slug), testId: 'production-tab-experience' },
    { id: 'EXPRESSION', href: productionExpressionPath(slug), testId: 'production-tab-expression' },
  ];

  return (
    <header className="site00-production-shell__nav" data-testid="production-pillar-nav">
      <p className="site00-label">
        PRODUCTION / {slug.toUpperCase()}
        {context.campaignId ? ` / ${context.campaignId}` : ''}
        {context.entryLabel ? ` / ${context.entryLabel}` : ''}
      </p>
      <nav aria-label="Production workspace pillars">
        <ul className="site00-production-shell__tabs">
          {tabs.map((tab) => {
            const active = location.pathname.startsWith(tab.href);
            return (
              <li key={tab.id}>
                <Link
                  to={tab.href}
                  data-testid={tab.testId}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setActiveWorkspace(tab.id)}
                >
                  {tab.id}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="site00-body site00-production-shell__count" data-testid="production-top-level-count">
        {PRODUCTION_TOP_LEVEL_WORKSPACES.length} primary workspaces
      </p>
    </header>
  );
}

export function ProductionWorkspaceProjectLayout() {
  return (
    <ProductionWorkspaceProvider>
      <div className="site00-production-shell" data-testid="production-workspace-shell">
        <ProductionPillarNav />
        <Outlet />
      </div>
    </ProductionWorkspaceProvider>
  );
}
