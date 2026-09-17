import { Link } from 'react-router-dom';

import { listDesignEnabledManagedProjects } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import { site00ProjectsDesignActiveProjectPath } from '../config/routes';

export function DesignProjectsDesignHubPage() {
  const projects = listDesignEnabledManagedProjects().filter((p) => p.projectId !== 'site00');

  return (
    <main className="site00-design-module-hub" data-testid="design-projects-module-hub">
      <p className="site00-design-module-hub__crumb">PROJECTS &gt; DESIGN</p>
      <h1>DESIGN MODULE</h1>
      <p>Select the active project for design intelligence and page authority.</p>
      <ul>
        {projects.map((p) => (
          <li key={p.projectId}>
            <Link to={site00ProjectsDesignActiveProjectPath(p.projectId)}>{p.displayName}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
