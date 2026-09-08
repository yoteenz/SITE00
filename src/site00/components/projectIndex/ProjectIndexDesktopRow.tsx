import { Link } from 'react-router-dom';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';
import { PROJECT_MODULE_CONFIGS } from '../../../../shared/site00-projects/projectModules.js';
import { ProjectIndexThumbnail } from './ProjectIndexThumbnail.js';

type ProjectIndexDesktopRowProps = {
  item: ProjectIndexItem;
};

function ProgressColumn({ item }: { item: ProjectIndexItem }) {
  const percent = item.progress.percent;
  const label = item.progress.label;

  return (
    <div className="site00-pidx-desktop-row__progress-col">
      <p className="site00-pidx-desktop-row__progress-label">PROJECT PROGRESS</p>
      {percent != null ? (
        <>
          <div className="site00-pidx-desktop-row__progress-track">
            <div className="site00-pidx-desktop-row__progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="site00-pidx-desktop-row__progress-pct">{percent}%</span>
        </>
      ) : (
        <span className="site00-pidx-desktop-row__progress-state">{label ?? 'IN PROGRESS'}</span>
      )}
    </div>
  );
}

export function ProjectIndexDesktopRow({ item }: ProjectIndexDesktopRowProps) {
  const moduleLabel = PROJECT_MODULE_CONFIGS[item.primaryModule]?.label ?? item.primaryModule;
  const secondary =
    item.secondaryModuleCount > 0 ? `+${item.secondaryModuleCount} MODULES` : null;
  const descriptor = item.currentFocus ?? item.descriptor ?? item.currentPhase;
  const reviewLabel =
    item.needsReviewCount > 0 ? `${item.needsReviewCount} NEED YOUR EYE` : null;

  return (
    <li className="site00-pidx-desktop-row">
      <Link to={item.openRoute} className="site00-pidx-desktop-row__link">
        <ProjectIndexThumbnail item={item} className="site00-pidx-desktop-row__thumb" />
        <div className="site00-pidx-desktop-row__main">
          <p className="site00-pidx-desktop-row__module">
            {moduleLabel}
            {secondary ? <span className="site00-pidx-desktop-row__module-extra"> · {secondary}</span> : null}
          </p>
          <p className="site00-pidx-desktop-row__name">{item.projectName}</p>
          {descriptor ? <p className="site00-pidx-desktop-row__descriptor">{descriptor}</p> : null}
          {item.repositorySlug ? (
            <p className="site00-pidx-desktop-row__repo">
              REPOSITORY · <span className="site00-pidx-desktop-row__repo-slug">{item.repositorySlug}</span>
              {item.commitsAhead != null ? ` · ↑ ${item.commitsAhead} AHEAD` : null}
              {item.openPullRequests != null ? ` · ${item.openPullRequests} OPEN PR` : null}
            </p>
          ) : item.repositoryStatus === 'UNRESOLVED' ? (
            <p className="site00-pidx-desktop-row__repo">REPOSITORY · NOT CONNECTED</p>
          ) : null}
          <p className="site00-pidx-desktop-row__status">
            <span className={`site00-pidx-status-dot site00-pidx-status-dot--${item.statusDot}`} aria-hidden="true" />
            {item.status.replace(/_/g, ' ')} · {item.lastUpdatedLabel}
          </p>
          {reviewLabel ? <p className="site00-pidx-desktop-row__review">{reviewLabel}</p> : null}
        </div>
        <ProgressColumn item={item} />
        <div className="site00-pidx-desktop-row__open">
          <span className="site00-pidx-desktop-row__chevron" aria-hidden="true">
            ›
          </span>
          <span className="site00-pidx-desktop-row__open-label">OPEN PROJECT</span>
        </div>
      </Link>
    </li>
  );
}
