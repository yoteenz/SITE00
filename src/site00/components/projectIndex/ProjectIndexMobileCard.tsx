import { Link } from 'react-router-dom';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';
import { PROJECT_MODULE_CONFIGS } from '../../../../shared/site00-projects/projectModules.js';
import { ProjectIndexThumbnail } from './ProjectIndexThumbnail.js';

type ProjectIndexMobileCardProps = {
  item: ProjectIndexItem;
};

function ProgressDisplay({ item }: { item: ProjectIndexItem }) {
  const percent = item.progress.percent;
  const label = item.progress.label;
  if (percent != null) {
    return (
      <div className="site00-pidx-mobile-card__progress">
        <div className="site00-pidx-mobile-card__progress-track">
          <div className="site00-pidx-mobile-card__progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="site00-pidx-mobile-card__progress-pct">{percent}%</span>
      </div>
    );
  }
  return (
    <div className="site00-pidx-mobile-card__progress site00-pidx-mobile-card__progress--label">
      <span>{label ?? 'IN PROGRESS'}</span>
    </div>
  );
}

export function ProjectIndexMobileCard({ item }: ProjectIndexMobileCardProps) {
  const moduleLabel = PROJECT_MODULE_CONFIGS[item.primaryModule]?.label ?? item.primaryModule;
  const secondary =
    item.secondaryModuleCount > 0 ? `+${item.secondaryModuleCount} MODULES` : null;
  const reviewLabel =
    item.needsReviewCount > 0 ? `${item.needsReviewCount} NEED YOUR EYE` : null;

  return (
    <li className="site00-pidx-mobile-card">
      <Link to={item.openRoute} className="site00-pidx-mobile-card__link">
        <ProjectIndexThumbnail item={item} className="site00-pidx-mobile-card__thumb" />
        <div className="site00-pidx-mobile-card__body">
          <p className="site00-pidx-mobile-card__module">
            {moduleLabel}
            {secondary ? <span className="site00-pidx-mobile-card__module-extra"> · {secondary}</span> : null}
          </p>
          <p className="site00-pidx-mobile-card__name">{item.projectName}</p>
          <p className="site00-pidx-mobile-card__meta">
            <span className={`site00-pidx-status-dot site00-pidx-status-dot--${item.statusDot}`} aria-hidden="true" />
            {item.status.replace(/_/g, ' ')} · {item.lastUpdatedLabel}
          </p>
          {item.currentFocus ? (
            <p className="site00-pidx-mobile-card__focus">{item.currentFocus}</p>
          ) : null}
          {reviewLabel ? <p className="site00-pidx-mobile-card__review">{reviewLabel}</p> : null}
        </div>
        <span className="site00-pidx-mobile-card__chevron" aria-hidden="true">
          ›
        </span>
        <ProgressDisplay item={item} />
      </Link>
    </li>
  );
}
