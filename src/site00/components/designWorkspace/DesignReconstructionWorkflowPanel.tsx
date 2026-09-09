/**
 * Multi-stage reconstruction workflow — crop / plan / generation / output review.
 * P0.VR.6R7 — editable crop workspace integration.
 */

import { useMemo } from 'react';
import { buildMultiAssetReconstructionPlan } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';
import { summarizeBatchCropReviews } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/founderCropIntelligence.js';
import { getSkinsDesignAuthority } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6/skinsAuthorityRegistry.js';
import type { ReconstructionWorkflowState } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import type { WorkflowView } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderAction.js';
import type { CropReviewState } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/types.js';
import { EditableCropWorkspace } from './EditableCropWorkspace.js';
import { useSite00MobileViewport } from '../../hooks/useSite00MobileViewport.js';

type Props = {
  state: ReconstructionWorkflowState;
  view: WorkflowView;
  onApproveCrop: (index: number, overrideWarnings?: boolean) => void;
  onApproveAllCrops: () => void;
  onApproveGeneration: () => void;
  onApproveOutput: (index: number) => void;
  onClose: () => void;
  onSetCandidateIndex: (index: number) => void;
  onUpdateCropReview: (index: number, review: CropReviewState) => void;
};

function stripStatus(review: CropReviewState): { dot: string; label: string } {
  if (review.reviewStatus === 'APPROVED') return { dot: 'approved', label: '✓' };
  if (review.assetIdentity === 'WRONG_ASSET') return { dot: 'wrong', label: '!' };
  if (review.reviewStatus === 'EDIT_REQUIRED' || review.semanticBoundary?.needsFounderPlacement) return { dot: 'edit', label: '…' };
  if (review.reviewStatus === 'READY_FOR_APPROVAL') return { dot: 'ready', label: '○' };
  return { dot: 'neutral', label: '·' };
}

export function DesignReconstructionWorkflowPanel({
  state,
  view,
  onApproveCrop,
  onApproveAllCrops,
  onApproveGeneration,
  onApproveOutput,
  onClose,
  onSetCandidateIndex,
  onUpdateCropReview,
}: Props) {
  const { job, activeCandidateIndex, cropReviews } = state;
  const total = job.candidateAssets.length;
  const active = job.candidateAssets[activeCandidateIndex];
  const activeReview = cropReviews[activeCandidateIndex];
  const authority = getSkinsDesignAuthority('MOBILE');
  const isMobile = useSite00MobileViewport();
  const batch = useMemo(() => summarizeBatchCropReviews(cropReviews), [cropReviews]);
  const plan = view === 'generation-plan' || view === 'generation-executing' ? buildMultiAssetReconstructionPlan(job) : null;
  const validForBatch = cropReviews.filter((r) => r.reviewStatus === 'READY_FOR_APPROVAL' && r.assetIdentity === 'CONFIRMED').length;

  if (!active || !activeReview) return null;

  if (view === 'crop-review') {
    return (
      <div className="site00-dw-rri-workflow" data-stage="crop-review">
        <header className="site00-dw-rri-workflow__head site00-dw-rri-workflow__head--compact">
          <button type="button" className="site00-dw-rri-workflow__back" onClick={onClose} aria-label="Back">
            ←
          </button>
          <p className="site00-dw-rri-workflow__batch">
            {batch.total} ASSETS · {batch.editRequired > 0 ? '1 EDITING' : `${batch.approved} APPROVED`} · GENERATION {batch.generationBlocked ? 'LOCKED' : 'READY'}
          </p>
        </header>

        <nav className="site00-dw-crop-strip" aria-label="Asset strip">
          {job.candidateAssets.map((c, i) => {
            const review = cropReviews[i]!;
            const st = stripStatus(review);
            return (
              <button
                key={c.candidateId}
                type="button"
                className={`site00-dw-crop-strip__item${i === activeCandidateIndex ? ' is-active' : ''}`}
                onClick={() => onSetCandidateIndex(i)}
              >
                <img src={c.sourceCrop.sourceCropUrl} alt="" />
                <span className={`site00-dw-crop-strip__dot is-${st.dot}`} aria-hidden>{st.label}</span>
                <span className="site00-dw-crop-strip__label">{String(i + 1).padStart(2, '0')} {c.brandKey.replace(/_/g, ' ').split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

        <EditableCropWorkspace
          review={activeReview}
          sourceImageUrl={authority?.publicUrl ?? active.sourceCrop.sourceCropUrl}
          isMobile={isMobile}
          assetIndex={activeCandidateIndex + 1}
          assetTotal={total}
          onReviewChange={(review) => onUpdateCropReview(activeCandidateIndex, review)}
          onApproveCrop={(overrideWarnings) => onApproveCrop(activeCandidateIndex, overrideWarnings)}
          onWrongAsset={() => onUpdateCropReview(activeCandidateIndex, { ...activeReview, reviewStatus: 'REJECTED', assetIdentity: 'WRONG_ASSET' })}
        />

        <footer className="site00-dw-rri-workflow__footer site00-dw-rri-workflow__footer--compact">
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onApproveAllCrops}>
            APPROVE ALL VALID ({validForBatch})
          </button>
        </footer>
      </div>
    );
  }

  if (view === 'generation-plan') {
    return (
      <div className="site00-dw-rri-workflow" data-stage="generation-plan">
        <header className="site00-dw-rri-workflow__head">
          <button type="button" className="site00-dw-rri-workflow__back" onClick={onClose}>
            ← BACK
          </button>
          <div>
            <span>CROPS APPROVED ✓</span>
            <h2>RECONSTRUCTION PLAN READY</h2>
            <p>{plan?.totalDispatches ?? total} ASSETS · REVIEW PROMPTS BEFORE DISPATCH</p>
          </div>
        </header>
        <ul className="site00-dw-rri-workflow__plan-list">
          {plan?.entries.map((entry) => (
            <li key={entry.candidateId}>
              <strong>{entry.semanticSlot}</strong>
              <span>{entry.method} · {entry.model}</span>
              <span>{entry.backgroundPolicy}</span>
              <details>
                <summary>HUMAN SUMMARY</summary>
                <p>RECONSTRUCT CANONICAL ASSET FROM APPROVED CROP · {entry.targetBinding}</p>
                <summary>PROMPT</summary>
                <pre>{entry.generatedPrompt}</pre>
              </details>
            </li>
          ))}
        </ul>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onApproveGeneration}>
          APPROVE GENERATION — AUTHORIZE UP TO {plan?.totalDispatches ?? total} PRIMARY DISPATCHES
        </button>
      </div>
    );
  }

  if (view === 'generation-executing') {
    return (
      <div className="site00-dw-rri-workflow" data-stage="generation-executing">
        <header className="site00-dw-rri-workflow__head">
          <h2>RECONSTRUCTING ASSETS</h2>
        </header>
        <ul className="site00-dw-rri-workflow__exec-list">
          {job.candidateAssets.map((c, i) => (
            <li key={c.candidateId}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{c.brandKey.replace(/_/g, ' ')}</strong>
              <span className={`is-${c.generationStatus.toLowerCase()}`}>{c.generationStatus}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (view === 'output-review') {
    return (
      <div className="site00-dw-rri-workflow" data-stage="output-review">
        <header className="site00-dw-rri-workflow__head">
          <button type="button" className="site00-dw-rri-workflow__back" onClick={onClose}>
            ← BACK
          </button>
          <h2>OUTPUT REVIEW — AWAITING FOUNDER REVIEW</h2>
        </header>
        <div className="site00-dw-rri-workflow__compare">
          <div className="site00-dw-rri-workflow__pane">
            <span>REFERENCE CROP</span>
            <img src={active.sourceCrop.sourceCropUrl} alt="" />
          </div>
          <div className="site00-dw-rri-workflow__pane">
            <span>OUTPUT</span>
            {active.output?.outputUrl ? (
              <img src={active.output.outputUrl} alt="" />
            ) : (
              <div className="site00-dw-rri-workflow__failed">FAILED — RETRY AVAILABLE</div>
            )}
          </div>
        </div>
        <div className="site00-dw-rri-workflow__nav">
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={() => onApproveOutput(activeCandidateIndex)}>
            LOVE IT
          </button>
          <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" disabled>
            REVISE (REGENERATION REQUIRES APPROVAL)
          </button>
        </div>
      </div>
    );
  }

  return null;
}
