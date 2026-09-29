import { Link } from 'react-router-dom';
import { listDesignEnabledManagedProjects } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  productionDesignPath,
  productionExperiencePath,
  productionExpressionPath,
} from '../../../../shared/site00-production-workspace/routes.js';
import { PRODUCTION_TOP_LEVEL_WORKSPACES } from '../../../../shared/site00-production-workspace/registry.js';
import { SITE00_ROUTES } from '../../config/routes';

export function ProductionWorkspaceHubPage() {
  const projects = listDesignEnabledManagedProjects();
  const defaultSlug = projects.find((p) => p.projectId === 'ndxbook')?.projectId ?? projects[0]?.projectId ?? 'ndxbook';

  return (
    <main className="site00-production-hub" data-testid="production-workspace-hub">
      <p className="site00-label">INTERNAL · PRODUCTION WORKSPACE</p>
      <h1 className="site00-heading">PRODUCTION</h1>
      <p className="site00-body">DESIGN · EXPERIENCE · EXPRESSION — admin-only creative production.</p>
      <p className="site00-body">Top-level workspaces: {PRODUCTION_TOP_LEVEL_WORKSPACES.join(' · ')}</p>

      <section className="site00-production-hub__projects">
        <h2 className="site00-label">ACTIVE PROJECT</h2>
        <ul>
          {projects.map((p) => (
            <li key={p.projectId}>
              <Link to={`${SITE00_ROUTES.productionProject.replace(':projectSlug', p.projectId.toLowerCase())}`}>
                {p.displayName}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="site00-production-hub__pillars">
        <h2 className="site00-label">OPEN PILLAR — {defaultSlug.toUpperCase()}</h2>
        <ul>
          <li>
            <Link to={productionDesignPath(defaultSlug)} data-testid="production-pillar-design">
              DESIGN
            </Link>
          </li>
          <li>
            <Link to={productionExperiencePath(defaultSlug, 'world')} data-testid="production-pillar-experience">
              EXPERIENCE
            </Link>
          </li>
          <li>
            <Link to={productionExpressionPath(defaultSlug, 'narrative')} data-testid="production-pillar-expression">
              EXPRESSION
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
