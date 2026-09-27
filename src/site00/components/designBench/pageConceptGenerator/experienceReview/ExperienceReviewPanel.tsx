/**
 * P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1
 */

import { useMemo, useState } from 'react';

import type { ExperienceExpressionVisualState } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import {
  buildExperienceReviewPackageStatus,
  EXPERIENCE_REVIEW_SHELL_LINEAGE,
  type ExperienceReviewPanelMode,
} from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewPresentation.js';
import {
  validateExperiencePackageMaterialization,
  visualStateCardStatus,
} from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experiencePackageMaterialization.js';
import {
  experienceThemeContinuityBlocksApproval,
  founderThemeReviewLine,
  themeLabelForState,
  validateExperienceThemeContinuity,
} from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceThemeContinuity.js';
import {
  experienceContentBlocksApproval,
  manifestForState,
} from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceContentManifest.js';
import { slotLabelFromConceptId } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyState.js';
import type { PageConceptGenerationState } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PageConceptContainedPreviewFrame } from '../PageConceptContainedPreviewFrame';
import {
  ExperienceReviewActionBar,
  ExperienceReviewDetails,
  ExperienceReviewEmptyState,
  ExperienceReviewErrorState,
  ExperienceReviewHeader,
  ExperienceReviewLoadingState,
  ExperienceReviewOutputNav,
  ExperienceReviewPreviewStage,
  ExperienceReviewStatusStrip,
} from './ExperienceReviewSections';

export type ExperienceReviewPanelProps = {
  state: PageConceptGenerationState;
  projectLabel: string;
  pageLabel: string;
  busy?: boolean;
  onApprove: () => void;
  onRegenerate: () => void;
  onRegenerateState?: (stateId: string, forceInheritAuthorityTheme?: boolean) => void;
  onGenerateExperience?: () => void;
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

function nextStateId(states: readonly ExperienceExpressionVisualState[], currentId: string): string | null {
  const i = states.findIndex((s) => s.stateId === currentId);
  if (i < 0 || i >= states.length - 1) return null;
  return states[i + 1]!.stateId;
}

export function ExperienceReviewPanel(props: ExperienceReviewPanelProps) {
  const authority = props.state.pipelineSet?.experienceExpressionAuthority ?? null;
  const family = props.state.pipelineSet?.viewportAuthorityFamily;
  const conceptLabel = slotLabelFromConceptId(props.state.pipelineSet ?? null, family?.confirmedMobileConceptId ?? null);
  const packageStatus = buildExperienceReviewPackageStatus(authority);
  const mode: ExperienceReviewPanelMode = packageStatus.mode;
  const approved = authority?.status === 'APPROVED';
  const materialization = validateExperiencePackageMaterialization(authority);
  const themeReceipt = validateExperienceThemeContinuity(authority);
  const themeApprovalGate = experienceThemeContinuityBlocksApproval(authority);
  const contentApprovalGate = experienceContentBlocksApproval(authority);
  const contentAuditByStateId = new Map(
    (authority?.experienceContentAudit?.states ?? contentApprovalGate.receipt.audit.states).map((s) => [s.stateId, s]),
  );
  const visualStates = authority?.visualStates ?? [];
  const falImageCount = visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE' && v.previewImageUri).length;
  const falTargetCount = visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE').length;
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
  const blocked =
    themeApprovalGate.blocked ||
    contentApprovalGate.blocked ||
    !materialization.ok ||
    falImageCount < falTargetCount;

  const approveDisabled =
    props.busy ||
    mode === 'GENERATING' ||
    mode === 'FAILED' ||
    mode === 'EMPTY' ||
    mode === 'PARTIAL' ||
    blocked ||
    approved;

  return (
    <div
      className="s00-pcg s00-exp-review"
      data-testid="page-concept-experience-expression-review"
      data-experience-review-shell="experience-review-shell"
      data-review-shell-lineage={EXPERIENCE_REVIEW_SHELL_LINEAGE}
    >
      <ExperienceReviewHeader
        projectLabel={props.projectLabel}
        pageLabel={props.pageLabel}
        conceptLabel={conceptLabel}
        outputCount={packageStatus.planned}
        statusLabel={packageStatus.statusLabel}
        providerLabel={authority?.provider ?? 'FAL'}
        onClose={props.onClose}
      />

      <ExperienceReviewStatusStrip
        packageStatus={packageStatus}
        blocked={blocked && !approved}
        themeAuthority={themeReceipt.authorityTheme}
      />

      <div className="s00-exp-review__body" data-testid="experience-review-body">
        {mode === 'EMPTY' ?
          <ExperienceReviewEmptyState
            busy={props.busy}
            onGenerate={() => props.onGenerateExperience?.() ?? props.onRegenerate()}
          />
        : mode === 'GENERATING' ?
          <ExperienceReviewLoadingState packageStatus={packageStatus} visualStates={visualStates} />
        : mode === 'FAILED' ?
          <ExperienceReviewErrorState
            message={props.state.lastFailure?.message ?? 'Experience generation failed.'}
            onRetry={() => props.onRegenerate()}
            busy={props.busy}
          />
        : mode === 'READY' || mode === 'PARTIAL' || mode === 'APPROVED' ?
          <>
            <ExperienceReviewOutputNav
              visualStates={visualStates}
              activeStateId={activeState?.stateId ?? 'base'}
              approved={approved}
              stateKindLabel={stateKindLabel}
              cardStatus={(state) => visualStateCardStatus(state, authority?.status ?? 'NOT_STARTED')}
              onSelect={(id) => setActiveStateId(id)}
            />
            <div className="s00-exp-review__stageColumn">
              <ExperienceReviewPreviewStage
                state={activeState}
                stateKindLabel={stateKindLabel}
                onFullscreen={() => activeState && setFullscreenId(activeState.stateId)}
              />
              {activeState ?
                <ExperienceReviewDetails
                  state={activeState}
                  stateKindLabel={stateKindLabel}
                  conceptLabel={conceptLabel}
                  themeLine={themeLabelForState(activeState)}
                  founderThemeLine={founderThemeReviewLine(activeState)}
                  tabletHandoff={tabletHandoff}
                  desktopHandoff={desktopHandoff}
                  contentAudit={contentAuditByStateId.get(activeState.stateId)}
                  manifest={manifestForState(authority?.experienceContentManifests, activeState.stateId)}
                />
              : null}
            </div>
          </>
        : null}
      </div>

      <ExperienceReviewActionBar
        mode={mode}
        approved={approved}
        busy={props.busy}
        approveDisabled={approveDisabled}
        onApprove={props.onApprove}
        onRegeneratePackage={props.onRegenerate}
        onRegenerateState={
          activeState && props.onRegenerateState ?
            () => props.onRegenerateState?.(activeState.stateId)
          : undefined
        }
        onRegenerateStateInheritTheme={
          activeState && props.onRegenerateState ?
            () => props.onRegenerateState?.(activeState.stateId, true)
          : undefined
        }
        onReviewNext={
          activeState ?
            () => {
              const next = nextStateId(visualStates, activeState.stateId);
              if (next) setActiveStateId(next);
            }
          : undefined
        }
        onClose={props.onClose}
        showRegenerateState={Boolean(activeState?.sourceProvider === 'FAL_EXPERIENCE' && props.onRegenerateState)}
      />

      {fullscreenState ?
        <div className="s00-exp-review__fullscreen" role="dialog" data-testid="page-concept-experience-fullscreen">
          <PageConceptContainedPreviewFrame
            size="mobile"
            status={fullscreenState.previewImageUri ? 'READY' : 'PENDING'}
            imageSrc={fullscreenState.previewImageUri}
            testId="page-concept-experience-fullscreen-image"
          />
          <div className="s00-exp-review__fullscreenNav">
            <button
              type="button"
              className="s00-exp-review__btn s00-exp-review__btn--white"
              disabled={fullscreenIndex <= 0}
              onClick={() => {
                const prev = visualStates[fullscreenIndex - 1];
                if (prev) setFullscreenId(prev.stateId);
              }}
            >
              PREVIOUS
            </button>
            <button
              type="button"
              className="s00-exp-review__btn s00-exp-review__btn--black"
              onClick={() => setFullscreenId(null)}
            >
              CLOSE
            </button>
            <button
              type="button"
              className="s00-exp-review__btn s00-exp-review__btn--white"
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
    </div>
  );
}
