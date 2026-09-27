/**
 * P0.VR.MOBILE-AUTHORITY-CONFIRM-AND-EXPERIENCE-EXPRESSION-STAGE-FIX1
 * P0.VR.PAGE-SYSTEM-REVIEW-FAMILY-EXPANSION-AND-EXPERIENCE-REVIEW-PANEL1
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
  onRegenerateState?: (stateId: string) => void;
  onClose: () => void;
};

function stateKindLabel(state: ExperienceExpressionVisualState): string {
  const label = (state.outputLabel ?? state.label).toUpperCase();
  if (label.includes('BASE')) return 'BASE PAGE';
  if (label.includes('MENU') || label.includes('NAV')) return 'MENU / EXPANDED NAV';
  if (label.includes('DETAIL') || label.includes('PANEL') || label.includes('ENTRY')) return 'ENTRY DETAIL / PANEL';
  if (label.includes('ACCESS') || label.includes('OVERLAY') || label.includes('PROJECT')) return 'PROJECT ACCESS / OVERLAY';
  return label;
}

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
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  const activeState: ExperienceExpressionVisualState | null = useMemo(
    () => visualStates.find((v) => v.stateId === activeStateId) ?? visualStates[0] ?? null,
    [activeStateId, visualStates],
  );

  const fullscreenState = fullscreenId ? visualStates.find((v) => v.stateId === fullscreenId) ?? null : null;
  const fullscreenIndex = fullscreenState ? visualStates.findIndex((v) => v.stateId === fullscreenState.stateId) : -1;

  const tabletHandoff = family?.tabletArtifactId ? 'READY' : 'PENDING';
  const desktopHandoff = family?.desktopArtifactId ? 'READY' : 'PENDING';

  if (!authority) {
    return (
      <div className="s00-pcg__experienceReview" data-testid="page-concept-experience-review-empty">
        <p>Experience expression has not been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="s00-pcg__experienceReview s00-pcg__experienceReview--dedicated" data-testid="page-concept-experience-expression-review">
      <header className="s00-pcg__experienceReviewHead">
        <h2>EXPERIENCE EXPRESSION</h2>
        <p data-testid="page-concept-experience-project-page">
          PROJECT: {props.projectLabel.toUpperCase()} · PAGE: {props.pageLabel.toUpperCase()}
        </p>
        <p data-testid="page-concept-experience-source-line">
          SOURCE: MOBILE AUTHORITY · {conceptLabel ?? '—'}
        </p>
        <p data-testid="page-concept-experience-status-line">
          STATUS:{' '}
          {approved ? 'APPROVED'
          : generating ? 'GENERATING'
          : failed ? 'GENERATION FAILED'
          : authority.status === 'READY_FOR_REVIEW' ? 'READY FOR REVIEW'
          : authority.status}
        </p>
        <p data-testid="page-concept-experience-expression-count">
          PACKAGE: {visualStates.length} VISUALS
        </p>
        {packagingPlan ?
          <p data-testid="page-concept-experience-packaging-summary">
            EXPRESSION PROMPTS: {modularPromptCount} · VISUAL OUTPUTS: {packagingPlan.totalPlannedOutputs} ·{' '}
            {packagingPlan.packagingReasoning}
          </p>
        : null}
      </header>

      <section className="s00-pcg__experiencePackageSummary" data-testid="page-concept-experience-package-summary">
        <p>APPROVED MOBILE AUTHORITY ✓</p>
        <p>
          EXPRESSION PROMPTS · {modularPromptCount} · VISUAL OUTPUTS · {visualStates.length} · FAL {falImageCount}/
          {falTargetCount || '—'}
        </p>
        <p>TABLET HANDOFF · {tabletHandoff}</p>
        <p>DESKTOP HANDOFF · {desktopHandoff}</p>
      </section>

      <div className="s00-pcg__experienceVisualCards" data-testid="page-concept-experience-visual-cards">
        {visualStates.map((state) => (
          <article
            key={state.stateId}
            className="s00-pcg__experienceVisualCard"
            data-testid={`page-concept-experience-card-${state.stateId}`}
          >
            <PageConceptContainedPreviewFrame
              size="thumb"
              status={state.previewImageUri ? 'READY' : 'PENDING'}
              imageSrc={state.previewImageUri}
              testId={`page-concept-experience-card-thumb-${state.stateId}`}
            />
            <p className="s00-pcg__experienceVisualCardLabel">{stateKindLabel(state)}</p>
            <p className="s00-pcg__experienceVisualCardMeta">
              {state.sourceProvider === 'INHERITED_MOBILE' ? 'INHERITED' : 'GENERATED'} · {state.sourceProvider} ·{' '}
              {state.falPromptVersion ?? 'v1'}
            </p>
            <div className="s00-pcg__experienceVisualCardActions">
              <button
                type="button"
                className="s00-pcg__secAction"
                data-testid={`page-concept-experience-inspect-${state.stateId}`}
                onClick={() => {
                  setActiveStateId(state.stateId);
                  setFullscreenId(state.stateId);
                }}
              >
                INSPECT
              </button>
              {state.sourceProvider === 'FAL_EXPERIENCE' && props.onRegenerateState ?
                <button
                  type="button"
                  className="s00-pcg__secAction"
                  disabled={props.busy}
                  data-testid={`page-concept-regenerate-experience-state-${state.stateId}`}
                  onClick={() => props.onRegenerateState?.(state.stateId)}
                >
                  REGENERATE THIS STATE
                </button>
              : null}
            </div>
          </article>
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
          <p data-testid="page-concept-experience-state-meta">{stateKindLabel(activeState)}</p>
        </div>
      : null}

      {fullscreenState ?
        <div className="s00-pcg__experienceFullscreen" role="dialog" data-testid="page-concept-experience-fullscreen">
          <PageConceptContainedPreviewFrame
            size="mobile"
            status={fullscreenState.previewImageUri ? 'READY' : 'PENDING'}
            imageSrc={fullscreenState.previewImageUri}
            testId="page-concept-experience-fullscreen-image"
          />
          <div className="s00-pcg__experienceFullscreenNav">
            <button
              type="button"
              className="s00-pcg__secAction"
              disabled={fullscreenIndex <= 0}
              onClick={() => {
                const prev = visualStates[fullscreenIndex - 1];
                if (prev) setFullscreenId(prev.stateId);
              }}
            >
              PREVIOUS
            </button>
            <button type="button" className="s00-pcg__secAction" onClick={() => setFullscreenId(null)}>
              CLOSE
            </button>
            <button
              type="button"
              className="s00-pcg__secAction"
              disabled={fullscreenIndex >= visualStates.length - 1}
              onClick={() => {
                const next = visualStates[fullscreenIndex + 1];
                if (next) setFullscreenId(next.stateId);
              }}
            >
              NEXT
            </button>
          </div>
        </div>
      : null}

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
              APPROVE EXPERIENCE PACKAGE
            </button>
            <button
              type="button"
              className="s00-pcg__secAction"
              disabled={props.busy}
              data-testid="page-concept-regenerate-experience"
              onClick={props.onRegenerate}
            >
              REGENERATE PACKAGE
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
