import { Link } from 'react-router-dom';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';
import { resolveProjectDisplayNumber } from '../../../../shared/site00-projects/projectIndexOrder.js';
import { resolveProjectIndexVisual } from '../../../../shared/site00-projects/projectIndexVisual.js';
import { PROJECT_MODULE_CONFIGS } from '../../../../shared/site00-projects/projectModules.js';

type ProjectIndexProjectCardProps = {
  item: ProjectIndexItem;
};

function ProgressBlock({ item }: { item: ProjectIndexItem }) {
  const percent = item.progress.percent;
  const label = item.progress.label;

  if (percent != null) {
    return (
      <div className="site00-pidx-project-card__progress">
        <div className="site00-pidx-project-card__progress-track">
          <div
            className="site00-pidx-project-card__progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="site00-pidx-project-card__progress-pct">{percent}%</span>
      </div>
    );
  }

  return (
    <div className="site00-pidx-project-card__progress site00-pidx-project-card__progress--label">
      <span>{label ?? item.status.replace(/_/g, ' ')}</span>
    </div>
  );
}

export function ProjectIndexProjectCard({ item }: ProjectIndexProjectCardProps) {
  const displayNumber = resolveProjectDisplayNumber(item.projectId);
  const visual = resolveProjectIndexVisual(item.projectId, item.projectName);
  const moduleLabel = PROJECT_MODULE_CONFIGS[item.primaryModule]?.label ?? item.primaryModule;
  const secondary =
    item.secondaryModuleCount > 0 ? `+${item.secondaryModuleCount} MODULES` : null;
  const focusLine = item.currentFocus ?? item.descriptor ?? item.currentPhase;

  return (
    <li className="site00-pidx-project-card">
      <Link to={item.openRoute} className="site00-pidx-project-card__link">
        <div className="site00-pidx-project-card__top">
          {displayNumber ? (
            <span className="site00-pidx-project-card__number">{displayNumber}</span>
          ) : null}
          <span className="site00-pidx-project-card__status">
            <span
              className={`site00-pidx-status-dot site00-pidx-status-dot--${item.statusDot}`}
              aria-hidden="true"
            />
            {item.status.replace(/_/g, ' ')}
          </span>
          <span className="site00-pidx-project-card__open-btn" aria-hidden="true">
            ↗
          </span>
        </div>

        <div
          className={`site00-pidx-project-card__visual site00-pidx-project-card__visual--${visual.visualClass}`}
          aria-hidden="true"
        >
          {item.projectImage ? (
            <img src={item.projectImage} alt="" className="site00-pidx-project-card__img" loading="lazy" />
          ) : (
            <span className="site00-pidx-project-card__initials">{item.projectInitials}</span>
          )}
        </div>

        <h3 className="site00-pidx-project-card__name">{item.projectName}</h3>
        <p className="site00-pidx-project-card__module">
          {moduleLabel}
          {secondary ? <span className="site00-pidx-project-card__module-extra"> · {secondary}</span> : null}
        </p>

        <ProgressBlock item={item} />

        {focusLine ? <p className="site00-pidx-project-card__focus">{focusLine}</p> : null}

        <span className="site00-pidx-project-card__cta">VIEW PROJECT →</span>
      </Link>
    </li>
  );
}
