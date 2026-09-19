import { Link } from 'react-router-dom';

import { PRODUCTION_DESIGN_POSTURE } from '../../../../../shared/site00-design-workspace-production/twinLifecycle.js';
import { site00ProjectDesignPath } from '../../../config/routes';

type Props = {
  projectSlug: string;
};

export function DesignTwinReviewBanner({ projectSlug }: Props) {
  const slug = projectSlug.toLowerCase();

  return (
    <div className="tod-ref-banner tod-ref-banner--review" role="status" data-testid="design-twin-review-banner">
      <span>
        TWIN REVIEW AUTHORITY · FUNCTIONAL QA · AWAITING FOUNDER APPROVAL · production route is{' '}
        {PRODUCTION_DESIGN_POSTURE.replace(/_/g, ' ').toLowerCase()}
      </span>
      <Link to={site00ProjectDesignPath(slug)}>OPEN PROVISIONAL PRODUCTION DESIGN</Link>
    </div>
  );
}
