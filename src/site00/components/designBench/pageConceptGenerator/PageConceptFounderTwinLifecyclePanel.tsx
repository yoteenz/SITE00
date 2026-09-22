/**
 * Twin handoff, build progress, review, and live promotion (presentation only).
 */

import { Link } from 'react-router-dom';

import { assertOpusShellTargetSurface } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptTwinLiveFirewall.js';
import { livePromotionVisible } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptFounderReviewPresentation.js';
import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export function PageConceptFounderTwinLifecyclePanel({
  state,
  busy,
}: {
  state: PageConceptGenerationState;
  busy?: boolean;
}) {
  const twinPkg = state.pipelineSet?.twinImplementationPackage;
  const status = state.generationStatus;
  const showHandoff = Boolean(twinPkg) || status === 'VIEWPORT_FAMILY_LOCKED' || status === 'TWIN_IMPLEMENTATION_PACKAGE_READY';
  const showTwinBuild = status === 'TWIN_IMPLEMENTATION_PACKAGE_READY' && twinPkg;
  const showTwinReview = status === 'TWIN_READY_FOR_REVIEW';
  const showLivePromote = livePromotionVisible(state);

  if (!showHandoff && !showTwinReview && !showLivePromote) return null;

  return (
    <section className="s00-pcg__twinLifecycle" data-testid="page-concept-founder-twin-lifecycle">
      {showHandoff && twinPkg ?
        <div className="s00-pcg__twinHandoff" data-testid="page-concept-ready-for-twin">
          <h4>READY FOR TWIN</h4>
          <ul className="s00-pcg__twinPackageList">
            <li>MOBILE AUTHORITY</li>
            <li>TABLET AUTHORITY</li>
            <li>DESKTOP AUTHORITY</li>
            <li>EXPERIENCE CONTRACT</li>
            <li>PAGE FAMILY SYSTEM</li>
            <li>SKINS</li>
            <li>FUNCTION CONTRACT</li>
          </ul>
          <p className="s00-pcg__twinLiveNote" data-testid="page-concept-twin-live-unchanged">
            LIVE PAGE WILL NOT BE MODIFIED.
          </p>
          <Link
            to={twinPkg.twinRoute}
            className="s00-pcg__twinPrimaryLink"
            data-testid="page-concept-create-twin-shell-opus"
            onClick={() => assertOpusShellTargetSurface(twinPkg.targetSurface)}
          >
            CREATE TWIN SHELL WITH OPUS
          </Link>
        </div>
      : null}

      {showTwinBuild ?
        <div className="s00-pcg__twinBuild" data-testid="page-concept-twin-build-progress">
          <h4>TWIN BUILD</h4>
          <ul>
            <li>OPUS SHELL · RUNNING / COMPLETE</li>
            <li>COMPOSER IMPLEMENTATION · PENDING</li>
            <li>TWIN CAPTURE · MOBILE · TABLET · DESKTOP</li>
            <li>LIVE · UNCHANGED</li>
          </ul>
        </div>
      : null}

      {showTwinReview ?
        <div className="s00-pcg__twinReview" data-testid="page-concept-twin-review">
          <h4>AUTHORITY VS TWIN</h4>
          <p>Compare MOBILE, TABLET, and DESKTOP before approving twin implementation.</p>
          <div className="s00-pcg__twinReviewActions">
            <button type="button" className="s00-pcg__secAction" disabled={busy}>
              REQUEST CORRECTION
            </button>
            <button type="button" className="s00-pcg__secAction" disabled={busy}>
              GENERATE ASSETS
            </button>
            <button type="button" className="s00-pcg__secAction s00-pcg__secAction--primary" disabled={busy} data-testid="page-concept-approve-twin">
              APPROVE TWIN
            </button>
          </div>
        </div>
      : null}

      {showLivePromote ?
        <div className="s00-pcg__livePromotion" data-testid="page-concept-live-promotion">
          <h4>TWIN APPROVED</h4>
          <p>LIVE CURRENT · TWIN APPROVED</p>
          <button type="button" className="s00-pcg__livePromoteBtn" disabled={busy} data-testid="page-concept-promote-twin-live">
            PROMOTE TWIN TO LIVE
          </button>
        </div>
      : null}
    </section>
  );
}
