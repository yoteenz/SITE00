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
  const generating = authority?.status === 'GENERATING';
  const failed = authority?.status === 'FAILED';
  const falImageCount = (authority?.visualStates ?? []).filter(
    (v) => v.sourceProvider === 'FAL_EXPERIENCE' && v.previewImageUri,
  ).length;
  const falTargetCount = (authority?.visualStates ?? []).filter((v) => v.sourceProvider === 'FAL_EXPERIENCE').length;
  const visualStates = authority?.visualStates ?? [];
  const packagingPlan = authority?.packagingPlan ?? null;
  const modularPromptCount = authority?.expressionPrompts?.length ?? 0;
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
          STATUS ·{' '}
          {approved ? 'APPROVED'
          : generating ? 'GENERATING EXPRESSIONS'
          : failed ? 'GENERATION FAILED'
          : authority.status === 'READY_FOR_REVIEW' ? 'READY FOR REVIEW'
          : authority.status}
        </p>
        <p data-testid="page-concept-experience-expression-count">
          PACKAGE · {visualStates.length} outputs (≤5) · {falImageCount}/{falTargetCount || '—'} FAL generated
        </p>
        {packagingPlan ?
          <p data-testid="page-concept-experience-packaging-summary">
            PROMPTS · {modularPromptCount} decomposed → {packagingPlan.totalPlannedOutputs} planned FAL image
            {packagingPlan.totalPlannedOutputs === 1 ? '' : 's'} (+ BASE inherit). {packagingPlan.packagingReasoning}
          </p>
        : null}
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
            <span>{state.outputLabel ?? state.label}</span>
            {state.packagingMode === 'COMBINED' ?
              <span className="s00-pcg__experienceStateTabMeta"> · COMBINED</span>
            : null}
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
          <p data-testid="page-concept-experience-state-meta">
            {activeState.outputLabel ?? activeState.label}
            {activeState.packagingMode ? ` · ${activeState.packagingMode}` : ''}
            {activeState.sourceExpressionTypes?.length ?
              ` · ${activeState.sourceExpressionTypes.join(' + ')}`
            : ''}
          </p>
          <p>{activeState.caption}</p>
          <p data-testid="page-concept-experience-handoff-note">
            Handoff · Tablet &amp; Desktop inherit this expression package with the approved mobile authority.
          </p>
        </div>
      : null}

      {packagingPlan?.groupedOutputs.length ?
        <section className="s00-pcg__experiencePackagingPlan" data-testid="page-concept-experience-packaging-plan">
          <h3>PLANNED OUTPUTS</h3>
          <ul>
            {packagingPlan.groupedOutputs.map((group) => (
              <li key={group.id} data-testid={`page-concept-experience-planned-${group.stateId}`}>
                {group.label} · {group.groupedExpressionTypes.length > 1 ? 'COMBINED' : 'SINGLE'} ·{' '}
                {group.groupedExpressionTypes.join(' + ')}
              </li>
            ))}
          </ul>
        </section>
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
              disabled={props.busy || generating || failed || falImageCount < falTargetCount}
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
