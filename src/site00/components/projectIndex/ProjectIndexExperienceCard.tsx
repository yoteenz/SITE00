import { Link } from 'react-router-dom';
import type { ProjectIndexItem } from '../../../../shared/site00-projects/projectIndexItem.js';

type ProjectIndexExperienceCardProps = {
  item: ProjectIndexItem;
  interactive?: boolean;
};

export function ProjectIndexExperienceCard({ item, interactive = true }: ProjectIndexExperienceCardProps) {
  if (!interactive) {
    return (
      <article
        className="site00-pidx-exp-card site00-pidx-design-card--shell-placeholder"
        aria-hidden="true"
      >
        <div className="site00-pidx-exp-card__link site00-pidx-design-card__link--muted">
          <span className="site00-pidx-exp-card__badge">BETA</span>
          <div className="site00-pidx-exp-card__body">
            <div className="site00-pidx-exp-card__visual" aria-hidden="true">
              E
            </div>
            <div>
              <h2>{item.projectName}</h2>
              <p>{item.projectType}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="site00-pidx-exp-card">
      <Link to={item.openRoute} className="site00-pidx-exp-card__link">
        <span className="site00-pidx-exp-card__badge">BETA · EXPERIENCE MODULE</span>
        <div className="site00-pidx-exp-card__body">
          <div className="site00-pidx-exp-card__visual" aria-hidden="true">
            E
          </div>
          <div>
            <h2 className="site00-pidx-design-card__name">{item.projectName}</h2>
            <p className="site00-pidx-design-card__type">{item.descriptor ?? item.projectType}</p>
            <p className="site00-pidx-design-card__phase">{item.currentPhase}</p>
          </div>
        </div>
        <span className="site00-pidx-exp-card__cta">OPEN EXPERIENCE →</span>
      </Link>
    </article>
  );
}
