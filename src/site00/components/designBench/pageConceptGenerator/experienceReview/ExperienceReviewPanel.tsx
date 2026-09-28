/**
 * P0.VR.EXPERIENCE-REVIEW-PANEL-DESIGN-SYSTEM-ALIGNMENT-AND-READABILITY1
 * P0.VR.EXPERIENCE-REVIEW-HYDRATION-AND-SINGLE-STATE-REGENERATION-UX1
 */

import { useEffect, useMemo, useState } from 'react';

import type { ExperienceExpressionVisualState } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionAuthority.js';
import {
  missingExperienceFalStateIds,
} from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceReviewHydration.js';
import {
  buildExperienceReviewPackageStatus,
  EXPERIENCE_REVIEW_SHELL_LINEAGE,
  resolveExperienceReviewPanelMode,
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
import { experienceExpressionCoverageBlocksApproval } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionCoverageMap.js';
import { slotLabelFromConceptId } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyState.js';
import type { PageConceptGenerationState } from '../../../../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PageConceptContainedPreviewFrame } from '../PageConceptContainedPreviewFrame';
import {
  ExperienceReviewActionBar,
  ExperienceReviewCoverageSection,
  ExperienceReviewDetails,
  ExperienceReviewEmptyState,
  ExperienceReviewErrorState,
  ExperienceReviewHeader,
  ExperienceReviewHydratingState,
  ExperienceReviewLoadingState,
  ExperienceReviewOutputNav,
  ExperienceReviewPreviewStage,
  ExperienceReviewStaleBanner,
  ExperienceReviewStatusStrip,
  ExperienceReviewSelectedOutputActions,
  ExperienceReviewTechnicalDetails,
} from './ExperienceReviewSections';

export type ExperienceReviewPanelProps = {
  state: PageConceptGenerationState;
  projectLabel: string;
  pageLabel: string;
  busy?: boolean;
  hydrating?: boolean;
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
  if (label.includes('DETAIL') || label.includes('PANEL') || label.includes('ENTRY') || state.stateId === 'drawer') {
    return 'ENTRY DETAIL / PANEL';
  }
  if (label.includes('ACCESS') || label.includes('OVERLAY') || label.includes('PROJECT') || state.stateId === 'overlay') {
    return 'PROJECT ACCESS / OVERLAY';
  }
  return label;
}

function nextStateId(states: readonly ExperienceExpressionVisualState[], currentId: string): string | null {
  const i = states.findIndex((s) => s.stateId === currentId);
  if (i < 0 || i >= states.length - 1) return null;
  return states[i + 1]!.stateId;
}

function experienceReviewSelectionStorageKey(projectId: string, pageId: string): string {
  return `site00:experience-review-active:${projectId}:${pageId}`;
}

export function ExperienceReviewPanel(props: ExperienceReviewPanelProps) {
  const authority = props.state.pipelineSet?.experienceExpressionAuthority ?? null;
  const family = props.state.pipelineSet?.viewportAuthorityFamily;
  const conceptLabel = slotLabelFromConceptId(props.state.pipelineSet ?? null, family?.confirmedMobileConceptId ?? null);
  const themeApprovalGate = experienceThemeContinuityBlocksApproval(authority);
  const contentApprovalGate = experienceContentBlocksApproval(authority);
  const coverageApprovalGate = experienceExpressionCoverageBlocksApproval({
    authority,
    pipelineSet: props.state.pipelineSet ?? null,
    functionContract: props.state.functionContract ?? null,
  });
  const packageStatus = buildExperienceReviewPackageStatus(authority, {
    themeBlocked: themeApprovalGate.blocked,
    contentBlocked: contentApprovalGate.blocked,
    coverageBlocked: coverageApprovalGate.blocked,
  });
  const mode: ExperienceReviewPanelMode = resolveExperienceReviewPanelMode(authority, {
    hydrating: props.hydrating === true,
  });
  const approved = authority?.status === 'APPROVED';
  const materialization = validateExperiencePackageMaterialization(authority);
  const themeReceipt = validateExperienceThemeContinuity(authority);
  const contentAuditByStateId = new Map(
    (authority?.experienceContentAudit?.states ?? contentApprovalGate.receipt.audit.states).map((s) => [s.stateId, s]),
  );
  const visualStates = authority?.visualStates ?? [];
  const missingStateIds = missingExperienceFalStateIds(authority);
  const falImageCount = visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE' && v.previewImageUri).length;
  const falTargetCount = visualStates.filter((v) => v.sourceProvider === 'FAL_EXPERIENCE').length;
  const selectionKey = experienceReviewSelectionStorageKey(props.state.projectId, props.state.pageId);
  const [activeStateId, setActiveStateId] = useState(() => {
    if (typeof sessionStorage === 'undefined') return visualStates[0]?.stateId ?? 'base';
    const saved = sessionStorage.getItem(selectionKey);
    if (saved && visualStates.some((v) => v.stateId === saved)) return saved;
    return visualStates[0]?.stateId ?? 'base';
  });
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  useEffect(() => {
    if (!visualStates.length) return;
    const stillValid = visualStates.some((v) => v.stateId === activeStateId);
    if (!stillValid) setActiveStateId(visualStates[0]!.stateId);
  }, [activeStateId, visualStates]);

  useEffect(() => {
    if (typeof sessionStorage === 'undefined' || !activeStateId) return;
    sessionStorage.setItem(selectionKey, activeStateId);
  }, [activeStateId, selectionKey]);

  const activeState: ExperienceExpressionVisualState | null = useMemo(
    () => visualStates.find((v) => v.stateId === activeStateId) ?? visualStates[0] ?? null,
    [activeStateId, visualStates],
  );

  const previousJobForActive = useMemo(() => {
    if (!authority?.generationJobs?.length || !activeState) return null;
    const currentId = activeState.generatedArtifactId;
    return (
      authority.generationJobs.find(
        (j) => j.stateId === activeState.stateId && j.status === 'PRESERVED' && j.artifactId !== currentId,
      ) ?? null
    );
  }, [activeState, authority?.generationJobs]);

  const fullscreenState = fullscreenId ? visualStates.find((v) => v.stateId === fullscreenId) ?? null : null;
  const fullscreenIndex = fullscreenState ? visualStates.findIndex((v) => v.stateId === fullscreenState.stateId) : -1;

  const tabletHandoff = family?.tabletArtifactId ? 'READY' : 'PENDING';
  const desktopHandoff = family?.desktopArtifactId ? 'READY' : 'PENDING';
  const blocked =
    themeApprovalGate.blocked ||
    contentApprovalGate.blocked ||
    coverageApprovalGate.blocked ||
    !materialization.ok ||
    falImageCount < falTargetCount;

  const approveDisabled =
    props.busy ||
    mode === 'GENERATING' ||
    mode === 'FAILED' ||
    mode === 'EMPTY' ||
    mode === 'HYDRATING' ||
    mode === 'STALE' ||
    mode === 'PARTIAL' ||
    blocked ||
    approved;

  const showOutputReview =
    mode !== 'HYDRATING' &&
    (mode === 'READY' ||
      mode === 'PARTIAL' ||
      mode === 'APPROVED' ||
      mode === 'STALE' ||
      mode === 'GENERATING' ||
      (mode === 'EMPTY' && visualStates.length > 0));

  const generatePackageLabel =
    missingStateIds.length > 0 ?
      `GENERATE ${missingStateIds.length} MISSING OUTPUT${missingStateIds.length === 1 ? '' : 'S'}`
    : 'GENERATE EXPERIENCE PACKAGE';
  const showGenerateMissingOnly = missingStateIds.length > 0 && packageStatus.ready > 0;

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
        statusLabel={mode === 'HYDRATING' ? 'LOADING EXPERIENCE PACKAGE' : packageStatus.statusLabel}
        providerLabel={authority?.provider ?? 'FAL'}
        onClose={props.onClose}
      />

      <ExperienceReviewStatusStrip
        packageStatus={packageStatus}
        blockerHint={packageStatus.blockerHint}
        themeAuthority={themeReceipt.authorityTheme}
      />

      {mode === 'STALE' ?
        <ExperienceReviewStaleBanner onRegenerateAffected={() => props.onGenerateExperience?.() ?? props.onRegenerate()} />
      : null}

      {authority?.experienceExpressionCoverageMap ?
        <ExperienceReviewCoverageSection
          coveredCount={authority.experienceExpressionCoverageMap.coveredPatterns.length}
          totalPatterns={authority.experienceExpressionCoverageMap.distinctVisualExpressionPatterns}
          percent={authority.experienceExpressionCoverageMap.experienceCoveragePercent}
          bindings={authority.experienceExpressionCoverageMap.patternBindings}
        />
      : null}

      <div className="s00-exp-review__body" data-testid="experience-review-body">
        {mode === 'HYDRATING' ?
          <ExperienceReviewHydratingState />
        : mode === 'EMPTY' && visualStates.length === 0 ?
          <ExperienceReviewEmptyState
            busy={props.busy}
            generateLabel={generatePackageLabel}
            onGenerate={() => props.onGenerateExperience?.() ?? props.onRegenerate()}
          />
        : mode === 'GENERATING' && !showOutputReview ?
          <ExperienceReviewLoadingState packageStatus={packageStatus} visualStates={visualStates} />
        : mode === 'FAILED' ?
          <ExperienceReviewErrorState
            message={props.state.lastFailure?.message ?? 'Experience generation failed.'}
            onRetry={() => props.onRegenerate()}
            busy={props.busy}
          />
        : showOutputReview ?
          <>
            <ExperienceReviewOutputNav
              visualStates={visualStates}
              activeStateId={activeState?.stateId ?? 'base'}
              approved={approved}
              stateKindLabel={stateKindLabel}
              cardStatus={(state) => visualStateCardStatus(state, authority?.status ?? 'NOT_STARTED')}
              onSelect={(id) => setActiveStateId(id)}
              onInspect={(id) => {
                setActiveStateId(id);
                setFullscreenId(id);
              }}
              onRegenerateState={
                props.onRegenerateState ?
                  (stateId) => props.onRegenerateState?.(stateId)
                : undefined
              }
            />
            <div className="s00-exp-review__stageColumn">
              <ExperienceReviewPreviewStage
                state={activeState}
                stateKindLabel={stateKindLabel}
                onFullscreen={() => activeState && setFullscreenId(activeState.stateId)}
              />
              {activeState ?
                <>
                  <ExperienceReviewSelectedOutputActions
                    state={activeState}
                    stateKindLabel={stateKindLabel}
                    onInspect={() => setFullscreenId(activeState.stateId)}
                    onRegenerate={
                      activeState.sourceProvider === 'FAL_EXPERIENCE' && props.onRegenerateState ?
                        () => props.onRegenerateState?.(activeState.stateId)
                      : undefined
                    }
                  />
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
                    previousArtifactId={previousJobForActive?.artifactId ?? null}
                  />
                  {authority ?
                    <ExperienceReviewTechnicalDetails
                      packageId={authority.id}
                      sourceAuthorityId={authority.sourceConceptId}
                      artifactIds={authority.expressionAssetIds ?? []}
                      legacyReceipt={authority.legacyReconciliationReceipt ?? null}
                    />
                  : null}
                </>
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
        generatePackageLabel={generatePackageLabel}
        showGenerateMissingOnly={showGenerateMissingOnly}
        disableGenerateMissing={props.hydrating === true || missingStateIds.length === 0}
        onApprove={props.onApprove}
        onRegeneratePackage={props.onRegenerate}
        onGeneratePackage={() => props.onGenerateExperience?.() ?? props.onRegenerate()}
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
        onRegenerateMenu={
          props.onRegenerateState ?
            () => props.onRegenerateState?.('menu')
          : undefined
        }
        activeStateId={activeState?.stateId}
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
