import { Link } from 'react-router-dom';
import type { ProjectRecommendation } from '../../../../shared/site00-project-discovery/types.js';
import { SITE00_ROUTES } from '../../config/routes';

type DiscoveryResultPanelProps = {
  title: string;
  recommendation: ProjectRecommendation;
  onComplete?: () => void;
};

export function DiscoveryResultPanel({ title, recommendation }: DiscoveryResultPanelProps) {
  return (
    <div className="site00-idnty-assessment-card site00-idnty-assessment-card--complete">
      <p className="site00-idnty-assessment__marker">PROJECT DISCOVERY</p>
      <h2 className="site00-idnty-assessment-card__title">{title}</h2>
      <p className="site00-idnty-assessment-card__subtitle">{recommendation.headline}</p>

      <div className="site00-idnty-complete-summary">
        <h3 className="site00-idnty-complete-summary__heading">RECOMMENDED SITE 00 PATH</h3>
        <dl className="site00-idnty-review-list">
          <div className="site00-idnty-review-list__row">
            <dt>STATUS</dt>
            <dd>{recommendation.status.replace(/_/g, ' ')}</dd>
          </div>
          <div className="site00-idnty-review-list__row">
            <dt>IDENTITY</dt>
            <dd>{recommendation.identityNeed.replace(/_/g, ' ')}</dd>
          </div>
          <div className="site00-idnty-review-list__row">
            <dt>BUILD CLASS</dt>
            <dd>{recommendation.experienceClass.replace(/_/g, ' ')}</dd>
          </div>
          {recommendation.additions.map((a) => (
            <div key={a} className="site00-idnty-review-list__row">
              <dt>INCLUDES</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
        <p className="site00-idnty-assessment-card__subtitle">
          Deep Brand Lore, Personality, and Creative Appetite intelligence is collected after project activation — not during public discovery.
        </p>
      </div>

      <div className="site00-idnty-complete-actions">
        <Link to={SITE00_ROUTES.support} className="site00-btn site00-btn--primary">
          BOOK DISCOVERY CALL →
        </Link>
        <Link to={SITE00_ROUTES.idnty} className="site00-btn">
          RETURN TO IDNTY
        </Link>
      </div>
    </div>
  );
}
