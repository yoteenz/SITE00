/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — PROJECTS module navigation (hamburger).
 */

import { Link } from 'react-router-dom';

import { listDesignEnabledManagedProjects } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  site00ProjectsDesignActiveProjectPath,
  site00ProjectsDesignModulePath,
} from '../../../config/routes';

const PROJECTS_MODULE_LINKS = [
  { label: 'PROJECTS INDEX', href: '/projects' },
  { label: 'DESIGN MODULE', href: site00ProjectsDesignModulePath() },
] as const;

export function DesignProjectModuleNavPanel({
  activeProjectSlug,
}: {
  activeProjectSlug: string;
}) {
  const projects = listDesignEnabledManagedProjects().filter((p) => p.projectId !== 'site00');

  return (
    <div className="tod-dcs-nav" data-testid="design-projects-module-nav">
      <p className="tod-dcs-lead">PROJECTS module navigation — DESIGN is one module inside PROJECTS.</p>
      <section>
        <h3 className="tod-dcs-notes__title">PROJECTS</h3>
        {PROJECTS_MODULE_LINKS.map((item) => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))}
      </section>
      <section>
        <h3 className="tod-dcs-notes__title">DESIGN · ACTIVE PROJECT</h3>
        {projects.map((p) => (
          <Link
            key={p.projectId}
            to={site00ProjectsDesignActiveProjectPath(p.projectId)}
            aria-current={p.projectId === activeProjectSlug ? 'page' : undefined}
          >
            {p.displayName}
          </Link>
        ))}
      </section>
    </div>
  );
}
