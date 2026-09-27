/**
 * P0.VR.MOBILE-AUTHORITY-CONFIRM-AND-EXPERIENCE-EXPRESSION-STAGE-FIX1
 */

import { useMemo, useState } from 'react';

import type { ExperienceExpressionVisualState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import { slotLabelFromConceptId } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyState.js';
import type { PageConceptGenerationState } from '../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PageConceptContainedPreviewFrame } from './PageConceptContainedPreviewFrame';

export type PageConceptExperienceExpressionReviewPanelProps = {
  state: PageConceptGenerationState;
  projectLabel: string;
  pageLabel: string;
  busy?: boolean;
  onApprove: () => void;
  onRegenerate: () => void;
  onClose: () => void;
};

export function PageConceptExperienceExpressionReviewPanel(props: PageConceptExperienceExpressionReviewPanelProps) {
  const authority = props.state.pipelineSet?.experienceExpressionAuthority ?? null;
  const family = props.state.pipelineSet?.viewportAuthorityFamily;
  const conceptLabel = slotLabelFromConceptId(props.state.pipelineSet ?? null, family?.confirmedMobileConceptId ?? null);
  const approved = authority?.status === 'APPROVED';
  const visualStates = authority?.visualStates ?? [];
  const [activeStateId, setActiveStateId] = useState(visualStates[0]?.stateId ?? 'base');

  const activeState: ExperienceExpressionVisualState | null = useMemo(
    () => visualStates.find((v) => v.stateId === activeStateId) ?? visualStates[0] ?? null,
    [activeStateId, visualStates],
  );

  if (!authority) {
    return (
      <div className="s00-pcg__experienceReview" data-testid="page-concept-experience-review-empty">
        <p>Experience expression has not been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="s00-pcg__experienceReview" data-testid="page-concept-experience-expression-review">
      <header className="s00-pcg__experienceReviewHead">
        <h2>EXPERIENCE EXPRESSION</h2>
        <p>
          {props.projectLabel.toUpperCase()} / {props.pageLabel.toUpperCase()}
        </p>
        <p data-testid="page-concept-experience-source-line">
          SOURCE · MOBILE AUTHORITY · {conceptLabel ?? '—'}
        </p>
        <p data-testid="page-concept-experience-status-line">
          STATUS · {approved ? 'APPROVED' : 'READY FOR REVIEW'}
        </p>
      </header>

      <div className="s00-pcg__experienceStateTabs" role="tablist">
        {visualStates.map((state) => (
          <button
            key={state.stateId}
            type="button"
            role="tab"
            aria-selected={activeStateId === state.stateId}
            className="s00-pcg__experienceStateTab"
            data-testid={`page-concept-experience-state-${state.stateId}`}
            onClick={() => setActiveStateId(state.stateId)}
          >
            {state.label}
          </button>
        ))}
      </div>

      {activeState ?
        <div className="s00-pcg__experienceStatePreview" data-testid="page-concept-experience-visual-preview">
          <PageConceptContainedPreviewFrame
            size="mobile"
            status={activeState.previewImageUri ? 'READY' : 'PENDING'}
            imageSrc={activeState.previewImageUri}
            testId={`page-concept-experience-visual-${activeState.stateId}`}
          />
          <p>{activeState.caption}</p>
        </div>
      : null}

      <section className="s00-pcg__experienceBehaviorSummary" data-testid="page-concept-experience-behavior-summary">
        <h3>BEHAVIOR SUMMARY</h3>
        <pre>{authority.behaviorContract}</pre>
      </section>

      <section className="s00-pcg__experienceInheritance" data-testid="page-concept-experience-inheritance">
        <p>MOBILE AUTHORITY ✓</p>
        <p>PROJECT EXPRESSION ✓</p>
        <p>FUNCTION MAP ✓</p>
      </section>

      <div className="s00-pcg__experienceReviewActions">
        {!approved ?
          <>
            <button
              type="button"
              className="s00-pcg__secAction s00-pcg__secAction--primary"
              disabled={props.busy}
              data-testid="page-concept-approve-experience-review"
              onClick={props.onApprove}
            >
              APPROVE EXPERIENCE
            </button>
            <button
              type="button"
              className="s00-pcg__secAction"
              disabled={props.busy}
              data-testid="page-concept-regenerate-experience"
              onClick={props.onRegenerate}
            >
              REGENERATE EXPERIENCE
            </button>
          </>
        : null}
        <button type="button" className="s00-pcg__secAction" data-testid="page-concept-close-experience-review" onClick={props.onClose}>
          {approved ? 'CLOSE' : 'CANCEL'}
        </button>
      </div>
    </div>
  );
}
