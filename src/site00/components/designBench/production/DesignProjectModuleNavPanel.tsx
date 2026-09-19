/**
 * P0.VR.DESIGN-PROJECT-BINDING1R1 — PROJECTS module navigation (hamburger).
 * P0.VR.DESIGN.OPUS-WORKSPACE-SYSTEM1 — rebuilt on the overlay kit.
 *
 * The links used to be bare anchors inside a section, so they flowed inline
 * and wrapped through the middle of project names. They are now rows with the
 * same target size and active treatment as every other overlay list.
 */

import { Link } from 'react-router-dom';

import { listDesignEnabledManagedProjects } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.js';
import {
  site00ProjectsDesignActiveProjectPath,
  site00ProjectsDesignModulePath,
  site00ProjectsExperienceModulePath,
} from '../../../config/routes';
import { OverlayBody, OverlaySection, OverlayStatus } from './designOverlayKit';

const PROJECTS_MODULE_LINKS = [
  { label: 'PROJECTS INDEX', href: '/projects', sub: 'ALL MODULES AND PROJECTS' },
  { label: 'DESIGN MODULE', href: site00ProjectsDesignModulePath(), sub: 'DESIGN ACROSS PROJECTS' },
  {
    label: 'EXPERIENCE MODULE',
    href: site00ProjectsExperienceModulePath('frontal-slayer'),
    sub: 'RUNTIME · CONFIGURATORS · WORLDS',
  },
] as const;

function NavLinkRow({
  to,
  label,
  sub,
  active,
}: {
  to: string;
  label: string;
  sub: string;
  active?: boolean;
}) {
  return (
    <Link
      className={`tod-ok-navRow${active ? ' is-active' : ''}`}
      to={to}
      aria-current={active ? 'page' : undefined}
    >
      <span className="tod-ok-navRow__main">
        <span className="tod-ok-navRow__name">{label}</span>
        <span className="tod-ok-navRow__sub">{sub}</span>
      </span>
      {active ? <OverlayStatus label="ACTIVE" /> : null}
    </Link>
  );
}

export function DesignProjectModuleNavPanel({
  activeProjectSlug,
}: {
  activeProjectSlug: string;
}) {
  const projects = listDesignEnabledManagedProjects().filter((p) => p.projectId !== 'site00');

  return (
    <OverlayBody>
      <div data-testid="design-projects-module-nav">
        <OverlaySection title="PROJECTS" meta="DESIGN IS ONE MODULE INSIDE PROJECTS">
          <div className="tod-ok-navList">
            {PROJECTS_MODULE_LINKS.map((item) => (
              <NavLinkRow key={item.href} to={item.href} label={item.label} sub={item.sub} />
            ))}
          </div>
        </OverlaySection>

        <OverlaySection title="DESIGN · ACTIVE PROJECT" meta={`${projects.length} PROJECTS`}>
          <div className="tod-ok-navList">
            {projects.map((p) => (
              <NavLinkRow
                key={p.projectId}
                to={site00ProjectsDesignActiveProjectPath(p.projectId)}
                label={p.displayName}
                sub={p.projectId.toUpperCase()}
                active={p.projectId === activeProjectSlug}
              />
            ))}
          </div>
        </OverlaySection>
      </div>
    </OverlayBody>
  );
}
