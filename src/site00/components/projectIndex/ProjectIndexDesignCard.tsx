import { Link } from 'react-router-dom';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';
import { resolveProjectIndexVisual } from '../../../../shared/site00-projects/projectIndexVisual.js';

type ProjectIndexDesignCardProps = {
  item: ProjectIndexItem;
  interactive?: boolean;
};

export function ProjectIndexDesignCard({ item, interactive = true }: ProjectIndexDesignCardProps) {
  const visual = resolveProjectIndexVisual(item.projectId, item.projectName);

  if (!interactive) {
    return (
      <article
        className="site00-pidx-design-card site00-pidx-design-card--shell-placeholder"
        aria-hidden="true"
      >
        <div className="site00-pidx-design-card__link site00-pidx-design-card__link--muted">
          <div className="site00-pidx-design-card__header">
            <span className="site00-pidx-design-card__system-tag">SITE 00 SYSTEM</span>
            <span className="site00-pidx-design-card__master-tag">MASTER WORKSPACE</span>
          </div>
          <div className="site00-pidx-design-card__body">
            <div
              className={`site00-pidx-design-card__visual site00-pidx-design-card__visual--${visual.visualClass}`}
            >
              <span className="site00-pidx-design-card__initials">{item.projectInitials}</span>
            </div>
            <div className="site00-pidx-design-card__copy">
              <h2 className="site00-pidx-design-card__name">{item.projectName}</h2>
              <p className="site00-pidx-design-card__type">{item.projectType}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="site00-pidx-design-card">
      <Link to={item.openRoute} className="site00-pidx-design-card__link">
        <div className="site00-pidx-design-card__header">
          <span className="site00-pidx-design-card__system-tag">SITE 00 SYSTEM</span>
          <span className="site00-pidx-design-card__master-tag">MASTER WORKSPACE</span>
        </div>

        <div className="site00-pidx-design-card__body">
          <div
            className={`site00-pidx-design-card__visual site00-pidx-design-card__visual--${visual.visualClass}`}
            aria-hidden="true"
          >
            <span className="site00-pidx-design-card__initials">{item.projectInitials}</span>
            <span className="site00-pidx-design-card__glow" />
          </div>

          <div className="site00-pidx-design-card__copy">
            <h2 className="site00-pidx-design-card__name">{item.projectName}</h2>
            <p className="site00-pidx-design-card__type">{item.projectType}</p>
            <p className="site00-pidx-design-card__descriptor">{item.currentFocus ?? item.descriptor}</p>
            <p className="site00-pidx-design-card__phase">{item.currentPhase}</p>
          </div>
        </div>

        <span className="site00-pidx-design-card__cta">OPEN DESIGN →</span>
      </Link>
    </article>
  );
}
