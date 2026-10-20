import type { ReactNode } from 'react';
import { RegistryFilterProvider } from '../../admin/founder-workspace/data/registryFilters';
import { OverlayProvider } from '../../admin/founder-workspace/overlay/OverlayContext';
import { ClientRecordPage } from '../../admin/founder-workspace/pages/ClientRecordPage';
import { CorrespondencePage } from '../../admin/founder-workspace/pages/CorrespondencePage';
import { FoundationsPage } from '../../admin/founder-workspace/pages/FoundationsPage';
import { OperationsPage } from '../../admin/founder-workspace/pages/OperationsPage';
import { OverviewPage } from '../../admin/founder-workspace/pages/OverviewPage';
import { ReferralsPage } from '../../admin/founder-workspace/pages/ReferralsPage';
import { ReviewsPage } from '../../admin/founder-workspace/pages/ReviewsPage';
import { SystemPage } from '../../admin/founder-workspace/pages/SystemPage';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../../admin/founder-workspace/config/routes';
import { resolveReviewEntry } from './digitalFoundationReviewRegistry';

const REVIEW_ARTIFACT_ID = '5fc5481e-601c-4676-93c7-659e952b15f0';

/** Map review hash anchors to in-memory founder workspace locations (real app tree). */
export function founderReviewPathForAnchor(anchorId: string): string {
  const reviewId = founderReviewIdForAnchor(anchorId);
  switch (reviewId) {
    case 'OVERVIEW':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.overview;
    case 'FOUNDATIONS':
    case 'CREATE_CLIENT':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations;
    case 'CLIENT_RECORD':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.client(REVIEW_ARTIFACT_ID);
    case 'REVIEWS':
    case 'REVIEWS_INTAKE_QUEUE':
    case 'INTAKE_REVIEW_DETAIL':
    case 'QUOTE_APPROVAL':
    case 'QUOTE_REVISE':
    case 'CLARIFICATION_REQUEST':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews;
    case 'OPERATIONS':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.operations;
    case 'CORRESPONDENCE':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.correspondence;
    case 'REFERRALS':
    case 'REFERRALS_CARD_STUDIO':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.referrals;
    case 'SYSTEM':
    case 'SYSTEM_TEST_LAB':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.system;
    default:
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.overview;
  }
}

export function founderReviewIdForAnchor(anchorId: string): string {
  const entry = resolveReviewEntry(anchorId);
  return entry?.reviewId ?? anchorId.replace(/^df-r-founder-/, '').toUpperCase();
}

function founderReviewPage(reviewId: string): ReactNode {
  switch (reviewId) {
    case 'OVERVIEW':
      return <OverviewPage />;
    case 'FOUNDATIONS':
    case 'CREATE_CLIENT':
      return <FoundationsPage />;
    case 'CLIENT_RECORD':
      return <ClientRecordPage reviewArtifactId={REVIEW_ARTIFACT_ID} />;
    case 'REVIEWS':
    case 'REVIEWS_INTAKE_QUEUE':
    case 'INTAKE_REVIEW_DETAIL':
    case 'QUOTE_APPROVAL':
    case 'QUOTE_REVISE':
    case 'CLARIFICATION_REQUEST':
      return <ReviewsPage />;
    case 'OPERATIONS':
      return <OperationsPage />;
    case 'CORRESPONDENCE':
      return <CorrespondencePage />;
    case 'REFERRALS':
    case 'REFERRALS_CARD_STUDIO':
      return <ReferralsPage />;
    case 'SYSTEM':
    case 'SYSTEM_TEST_LAB':
      return <SystemPage />;
    default:
      return <OverviewPage />;
  }
}

export default function DigitalFoundationReviewFounderHost({ anchorId }: { anchorId: string }) {
  const reviewId = founderReviewIdForAnchor(anchorId);
  const path = founderReviewPathForAnchor(anchorId);

  return (
    <div className="df-review__founder-host" data-founder-review-path={path}>
      <p className="df-review__sim df-review__sim--inline">
        SIMULATED · FOUNDER WORKSPACE · CLOUD PREVIEW ADMIN FIXTURES · INERT ACTIONS · {path}
      </p>
      <div className="df-review__founder-frame">
        <RegistryFilterProvider>
          <OverlayProvider>{founderReviewPage(reviewId)}</OverlayProvider>
        </RegistryFilterProvider>
      </div>
    </div>
  );
}
