import { Link } from 'react-router-dom';
import { StatusBadge } from '../pages/Site00PagePrimitives';
import type { EcosystemProject, ProjectStatus } from '../../config/seed/site00-ecosystem-seed';
import { formatEcosystemDate } from '../../config/seed/site00-ecosystem-seed';

function statusTone(status: ProjectStatus): 'published' | 'progress' | 'draft' | 'archived' {
  switch (status) {
    case 'ACTIVE':
      return 'published';
    case 'IN PROGRESS':
      return 'progress';
    case 'ARCHIVED':
      return 'archived';
    default:
      return 'draft';
  }
}

type ProjectRowProps = {
  project: EcosystemProject;
  compact?: boolean;
};

export function ProjectRow({ project, compact }: ProjectRowProps) {
  return (
    <li className={`site00-project-row ${compact ? 'site00-project-row--compact' : ''}`.trim()}>
      <Link to={project.href} className="site00-project-row__link">
        <div className="site00-project-row__thumb" aria-hidden="true" />
        <div className="site00-project-row__body">
          <p className="site00-project-row__name">{project.name}</p>
          {!compact ? <p className="site00-project-row__desc">{project.description}</p> : null}
          <div className="site00-project-row__meta">
            <StatusBadge status={project.status} tone={statusTone(project.status)} />
            <span className="site00-project-row__date">{formatEcosystemDate(project.lastUpdated)}</span>
            <span className="site00-project-row__team" aria-label="Team">
              {project.teamInitials.map((initial) => (
                <span key={initial} className="site00-project-row__avatar">
                  {initial}
                </span>
              ))}
            </span>
          </div>
        </div>
        <span className="site00-project-row__menu" aria-hidden="true">
          ⋯
        </span>
      </Link>
    </li>
  );
}
