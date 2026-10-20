import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FounderWorkspaceApp from '../../admin/founder-workspace/FounderWorkspaceApp';
import { IDNTY_FOUNDER_WORKSPACE_ROUTES } from '../../admin/founder-workspace/config/routes';
import { resolveReviewEntry } from './digitalFoundationReviewRegistry';

const REVIEW_ARTIFACT_ID = '5fc5481e-601c-4676-93c7-659e952b15f0';

/** Map review hash anchors to in-memory founder workspace locations (real app tree). */
export function founderReviewPathForAnchor(anchorId: string): string {
  const entry = resolveReviewEntry(anchorId);
  const id = entry?.reviewId ?? anchorId.replace(/^df-r-founder-/, '').toUpperCase();
  switch (id) {
    case 'OVERVIEW':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.overview;
    case 'FOUNDATIONS':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations;
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
    case 'CREATE_CLIENT':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations;
    case 'CLIENT_RECORD':
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.client(REVIEW_ARTIFACT_ID);
    default:
      return IDNTY_FOUNDER_WORKSPACE_ROUTES.overview;
  }
}

export default function DigitalFoundationReviewFounderHost({ anchorId }: { anchorId: string }) {
  const path = founderReviewPathForAnchor(anchorId);
  return (
    <div className="df-review__founder-host">
      <p className="df-review__sim df-review__sim--inline">
        SIMULATED · FOUNDER WORKSPACE · CLOUD PREVIEW ADMIN FIXTURES · INERT ACTIONS
      </p>
      <div className="df-review__founder-frame">
        <MemoryRouter initialEntries={[path]} key={path}>
          <Routes>
            <Route path="/admin/site00/founder-workspace/*" element={<FounderWorkspaceApp />} />
          </Routes>
        </MemoryRouter>
      </div>
    </div>
  );
}
