import { Link } from 'react-router-dom';
import { defaultProjectProductionPillarSummary } from '../../../../shared/site00-production-workspace/projectProductionSummary.js';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import {
  productionAdminDeepLink,
  productionDesignPath,
} from '../../../../shared/site00-production-workspace/routes.js';
import { site00ProjectExperienceWorkspacePath } from '../../config/routes';

type Props = {
  projectSlug: string;
};

/** Project-facing production status only — no workspace embed. */
export function ProjectProductionSummaryStrip({ projectSlug }: Props) {
  const summary = defaultProjectProductionPillarSummary({
    designReviewRequired: true,
    latestDesignOutput: '3 PAGES READY FOR REVIEW',
  });
  const slug = projectSlug.toLowerCase();
  const isAdmin = canAccessAdminPages();

  return (
    <section className="site00-pidx-production-summary" data-testid="project-production-summary">
      <div className="site00-pidx-production-summary__row">
        <div>
          <p className="site00-label">DESIGN</p>
          <p className="site00-body">{summary.designStatus}</p>
          <p className="site00-body">{summary.latestDesignOutput}</p>
        </div>
        <Link to={`/client/projects/${slug}/reviews`} className="site00-pidx-production-summary__action">
          REVIEW DESIGN
        </Link>
      </div>
      <div className="site00-pidx-production-summary__row">
        <div>
          <p className="site00-label">EXPERIENCE</p>
          <p className="site00-body">{summary.experienceStatus}</p>
        </div>
        <Link to={site00ProjectExperienceWorkspacePath(slug, 'build-a-wig', 'review')} className="site00-pidx-production-summary__action">
          REVIEW EXPERIENCE
        </Link>
      </div>
      <div className="site00-pidx-production-summary__row">
        <div>
          <p className="site00-label">EXPRESSION</p>
          <p className="site00-body">{summary.expressionStatus}</p>
        </div>
        <Link to={`/projects/${slug}/content-operations/campaign-board`} className="site00-pidx-production-summary__action">
          REVIEW CAMPAIGN
        </Link>
      </div>
      {isAdmin ? (
        <p className="site00-pidx-production-summary__admin">
          <Link
            to={productionAdminDeepLink({ projectSlug: slug, workspace: 'EXPRESSION', subWorkspace: 'casting' })}
            data-testid="open-in-production-admin"
          >
            OPEN IN PRODUCTION →
          </Link>
          {' · '}
          <Link to={productionDesignPath(slug)}>OPEN DESIGN</Link>
        </p>
      ) : null}
    </section>
  );
}
