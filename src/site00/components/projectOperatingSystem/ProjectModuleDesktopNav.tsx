import { NavLink } from 'react-router-dom';
import type { ProjectModuleId } from '../../../../shared/site00-projects/projectModules.js';
import { PROJECT_MODULE_CONFIGS, projectModulePath } from '../../../../shared/site00-projects/projectModules.js';

type ProjectModuleDesktopNavProps = {
  projectSlug: string;
  currentModule: ProjectModuleId;
  enabledModules: ProjectModuleId[];
};

export function ProjectModuleDesktopNav({
  projectSlug,
  currentModule,
  enabledModules,
}: ProjectModuleDesktopNavProps) {
  return (
    <nav className="site00-pos-desktop-nav" aria-label="Project modules">
      <ul className="site00-pos-desktop-nav__list">
        {enabledModules.map((moduleId) => {
          const config = PROJECT_MODULE_CONFIGS[moduleId];
          const isActive = moduleId === currentModule;
          return (
            <li key={moduleId}>
              <NavLink
                to={projectModulePath(projectSlug, moduleId)}
                className={`site00-pos-desktop-nav__link${isActive ? ' is-active' : ''}`}
                end
              >
                {config.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="site00-pos-desktop-nav__search">
        <input type="search" placeholder="SEARCH PROJECT…" aria-label="Search project" />
      </div>
    </nav>
  );
}
