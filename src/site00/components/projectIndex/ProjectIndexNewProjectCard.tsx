import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';

/** Founder-only utility grid entry — not a project, not numbered, not counted in metrics. */
export const PROJECT_INDEX_NEW_PROJECT_ENTRY_TYPE = 'NEW_PROJECT_UTILITY' as const;

export function ProjectIndexNewProjectCard() {
  return (
    <li
      className="site00-pidx-new-card"
      data-site00-entry={PROJECT_INDEX_NEW_PROJECT_ENTRY_TYPE}
      data-unnumbered
    >
      <Link to={SITE00_ROUTES.bldrState} className="site00-pidx-new-card__link">
        <div className="site00-pidx-new-card__top">
          <span className="site00-pidx-new-card__top-spacer" aria-hidden="true" />
          <span className="site00-pidx-new-card__open-btn" aria-hidden="true">
            ↗
          </span>
        </div>

        <div className="site00-pidx-new-card__visual" aria-hidden="true">
          <span className="site00-pidx-new-card__target">
            <span className="site00-pidx-new-card__target-ring site00-pidx-new-card__target-ring--outer" />
            <span className="site00-pidx-new-card__target-ring site00-pidx-new-card__target-ring--inner" />
            <span className="site00-pidx-new-card__target-axis site00-pidx-new-card__target-axis--h" />
            <span className="site00-pidx-new-card__target-axis site00-pidx-new-card__target-axis--v" />
            <span className="site00-pidx-new-card__plus">+</span>
          </span>
        </div>

        <h3 className="site00-pidx-new-card__name">NEW PROJECT</h3>
        <div className="site00-pidx-new-card__copy">
          <p className="site00-pidx-new-card__tagline">ANOTHER IDEA.</p>
          <p className="site00-pidx-new-card__tagline">ANOTHER WORLD.</p>
          <p className="site00-pidx-new-card__tagline">LET&apos;S BUILD.</p>
        </div>

        <span className="site00-pidx-new-card__cta">CREATE PROJECT →</span>
      </Link>
    </li>
  );
}
