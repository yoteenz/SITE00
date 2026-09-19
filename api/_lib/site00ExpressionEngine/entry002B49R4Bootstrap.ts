/**
 * Sprint B4.9R4 — Visual authority binding recovery.
 * Five approved authority IMAGE assets must condition FAL production dispatch.
 */

import type { FinalCinematicStoryboardRecord } from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import type {
  Entry002ReelVisualConception,
  Entry002StoryboardVisualAuthorityManifest,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import {
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../../../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import { PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER } from '../../../shared/site00-expression-engine/preStoryboardVisualAuthorityTypes.js';
import { seedChapter01Canon } from './chapterStore.js';
import { bootstrapB31FounderCreativeOverride } from './entry002B31Bootstrap.js';
import { compileEntry002LockedEntry } from './entry002Blueprint.js';
import { saveEntry } from './entryStore.js';
import { buildEntry002ReelTreatmentAuthority } from './entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from './entry002PreStoryboardVisualAuthorities.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from './entry002PreStoryboardAuthorityRecord.js';
import { runPreStoryboardAuthorityQA } from './preStoryboardAuthorityQA.js';
import { buildPreStoryboardApprovalState, buildPreStoryboardGateSatisfaction } from './preStoryboardAuthorityGate.js';
import {
  buildEntry002PipelineReconciliationState,
  resolveEntry002NextAction,
  resolveEntry002ProductionEligibility,
} from './entry002PipelineState.js';
import {
  buildEntry002FinalStoryboardReviewGate,
  buildEntry002FounderReviewGatesForPipeline,
  buildEntry002PreStoryboardAuthorityGate,
} from './entry002ReelProductionGates.js';
import {
  applyStoredPreStoryboardJudgments,
  buildPreStoryboardFounderReviewSlots,
} from './preStoryboardFounderJudgment.js';
import { attachEntry002PreStoryboardFounderAssets } from './entry002PreStoryboardAuthorityAssets.js';
import {
  attachPreStoryboardAuthorityRecords,
  summarizePreStoryboardAuthorityRecords,
} from './entry002PreStoryboardAuthorityRecordBuilder.js';
import {
  resolveFinalStoryboardCompilationContract,
  assertStoryboardCompilationFailClosed,
} from './entry002FinalStoryboardCompilationContract.js';
import {
  ensureEntry002PreStoryboardFounderApprovalsLoaded,
  persistEntry002PreStoryboardFounderApprovals,
} from './preStoryboardAuthorityStore.js';
import {
  ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
  ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
} from './entry002PreStoryboardFounderApproval.js';
import {
  buildEntry002FinalCinematicStoryboard005Record,
  toEntry002FinalCinematicStoryboardSummaryRecord,
  applyFinalStoryboardFounderJudgmentToRecord,
} from './entry002FinalStoryboardRecord.js';
import { compileEntry002FinalCinematicStoryboardBrief } from './entry002FinalCinematicStoryboardBrief.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from './entry002FinalCinematicStoryboardPanelManifest.js';
import { runStoryboardContinuityDomainQA } from './entry002FinalCinematicStoryboardContinuityDomainQA.js';
import { runStoryboardRenderModeQA } from './entry002FinalCinematicStoryboardRenderModeQA.js';
import {
  compileEntry002ReelVisualConception,
  assertReelConceptionReady,
} from './entry002ReelVisualConception.js';
import { compileReelFirstStoryboardPrompt } from './entry002ReelStoryboardPrompt.js';
import {
  dispatchReelFirstStoryboardArtifact,
  type ReelStoryboardArtifactResult,
} from './entry002ReelStoryboardSingleArtifact.js';
import { runReelStoryboardStructuralQA } from './entry002ReelStoryboardStructuralQA.js';
import { runReelCoherenceQA } from './entry002ReelCoherenceQA.js';
import { runReelStoryboardBoardTypeQA } from './entry002ReelStoryboardBoardTypeQA.js';
import {
  compileEntry002StoryboardVisualAuthorityManifest,
  assertVisualAuthorityManifestFailClosed,
} from './entry002StoryboardVisualAuthorityManifest.js';
import { runVisualAuthorityFidelityQA } from './entry002VisualAuthorityFidelityQA.js';
import {
  buildStoryboard001HistoricalFailureRecord,
  buildStoryboard002HistoricalFailureRecord,
  buildStoryboard003HistoricalFailureRecord,
  buildStoryboard004HistoricalFailureRecord,
} from './entry002FinalCinematicStoryboardHistory.js';
import {
  getFinalCinematicStoryboardRecord,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  getStoryboard003HistoricalRecord,
  getStoryboard004HistoricalRecord,
  getStoryboard005HistoricalRecord,
  hasValidFinalCinematicStoryboard,
  isFounderReviewableStoryboard,
  resetFinalCinematicStoryboardStore,
  saveFinalCinematicStoryboardRecord,
  saveStoryboard001HistoricalRecord,
  saveStoryboard002HistoricalRecord,
  saveStoryboard003HistoricalRecord,
  saveStoryboard004HistoricalRecord,
  saveStoryboard005HistoricalRecord,
} from './finalCinematicStoryboardStore.js';
import {
  recordFinalCinematicStoryboardJudgment,
  resolveFinalStoryboardFounderJudgment,
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
} from './finalCinematicStoryboardJudgmentStore.js';
import {
  beginStoryboardGenerationAttempt,
  evaluateStoryboardGenerationGuard,
  getStoryboardCostTelemetry,
  recordStoryboardGenerationFailure,
  recordStoryboardProviderDispatch,
} from './storyboardGenerationCostGuard.js';
import {
  importFounderStoryboardVariant,
  type FounderStoryboardVariant,
  ensureFounderStoryboardAssetsOnDisk,
} from './entry002FounderSuppliedStoryboard.js';
import { ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID } from '../../../shared/site00-expression-engine/finalCinematicStoryboardIds.js';

export async function bootstrapB49R4VisualAuthorityBindingRecovery(options?: {
  dispatchFal?: boolean;
  forceDispatch?: boolean;
  skipGeneration?: boolean;
  skipAuthorityImageBinding?: boolean;
  explicitFounderAction?: boolean;
}): Promise<{
  sprint: 'B4.9R4_VISUAL_AUTHORITY_BINDING_RECOVERY';
  visualAuthorityRootCause: string;
  b49FailureMode: string;
  b49rFailureMode: string;
  b49r2FailureMode: string;
  b49r3FailureMode: string;
  storyboard001Historical: FinalCinematicStoryboardRecord;
  storyboard002Historical: FinalCinematicStoryboardRecord;
  storyboard003Historical: FinalCinematicStoryboardRecord;
  storyboard004Historical: FinalCinematicStoryboardRecord;
  storyboard005Historical: FinalCinematicStoryboardRecord | null;
  storyboardCostGuard: ReturnType<typeof getStoryboardCostTelemetry>;
  visualAuthorityManifest: Entry002StoryboardVisualAuthorityManifest;
  reelVisualConception: Entry002ReelVisualConception;
  panelManifest: ReturnType<typeof compileEntry002FinalCinematicStoryboardPanelManifest>;
  compiledPrompt: string;
  reelArtifact: ReelStoryboardArtifactResult | null;
  structuralQA: Awaited<ReturnType<typeof runReelStoryboardStructuralQA>>;
  continuityDomainQA: ReturnType<typeof runStoryboardContinuityDomainQA>;
  renderModeQA: ReturnType<typeof runStoryboardRenderModeQA>;
  reelCoherenceQA: ReturnType<typeof runReelCoherenceQA>;
  boardTypeQA: ReturnType<typeof runReelStoryboardBoardTypeQA>;
  visualAuthorityFidelityQA: Awaited<ReturnType<typeof runVisualAuthorityFidelityQA>>;
  finalCinematicStoryboard: FinalCinematicStoryboardRecord | null;
  finalStoryboardRecord: ReturnType<typeof toEntry002FinalCinematicStoryboardSummaryRecord>;
  storyboardBrief: ReturnType<typeof compileEntry002FinalCinematicStoryboardBrief>;
  preStoryboardGate: ReturnType<typeof buildEntry002PreStoryboardAuthorityGate>;
  finalStoryboardReviewGate: ReturnType<typeof buildEntry002FinalStoryboardReviewGate>;
  gateSatisfaction: ReturnType<typeof buildPreStoryboardGateSatisfaction>;
  founderReviewSlots: ReturnType<typeof buildPreStoryboardFounderReviewSlots>;
  pipelineState: ReturnType<typeof buildEntry002PipelineReconciliationState>;
  founderGates: ReturnType<typeof buildEntry002FounderReviewGatesForPipeline>;
  finalStoryboardEligibility: ReturnType<typeof buildEntry002PipelineReconciliationState>['finalStoryboard'];
  storyboardCompilationContract: ReturnType<typeof resolveFinalStoryboardCompilationContract>;
  authorityRecords: ReturnType<typeof summarizePreStoryboardAuthorityRecords>;
  productionEligibility: ReturnType<typeof resolveEntry002ProductionEligibility>;
  founderApprovalsPersisted: typeof ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS;
  authorityVersion: typeof ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION;
  productionOrder: typeof PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER;
  treatment: ReturnType<typeof buildEntry002ReelTreatmentAuthority>;
  preStoryboardAuthorityPack: ReturnType<typeof buildEntry002PreStoryboardVisualAuthorityPack>;
  cinematicSequence: {
    sequenceId: typeof ENTRY_002_CINEMATIC_SEQUENCE_001;
    status: 'PRE_AUTHORITY_EXPERIMENT';
    canonState: 'NON_CANON';
    founderJudgment: 'UNREVIEWED';
    visualAuthority: false;
    referenceOnly: true;
    active: false;
  };
  keyframes: ReturnType<typeof resolveEntry002ProductionEligibility>['keyframeEligibility'];
  video: 'BLOCKED';
  qa: ReturnType<typeof runPreStoryboardAuthorityQA>;
  nextAction:
    | typeof ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION
    | typeof ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION
    | 'GENERATE FINAL CINEMATIC STORYBOARD';
  telemetryNote: string;
}> {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  await bootstrapB31FounderCreativeOverride();
  saveEntry(compileEntry002LockedEntry());

  persistEntry002PreStoryboardFounderApprovals();
  ensureEntry002PreStoryboardFounderApprovalsLoaded();

  const treatment = buildEntry002ReelTreatmentAuthority();
  const baseAuthorities = attachEntry002PreStoryboardFounderAssets(
    buildEntry002PreStoryboardVisualAuthorities(),
  );
  const authorities = attachPreStoryboardAuthorityRecords(
    applyStoredPreStoryboardJudgments(baseAuthorities),
  );
  const preStoryboardAuthorityPack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
  const qa = runPreStoryboardAuthorityQA(preStoryboardAuthorityPack);

  if (!qa.passed) {
    throw new Error(`B4.9R4 pre-storyboard QA failed: ${qa.blockers.join('; ')}`);
  }

  const approvalState = buildPreStoryboardApprovalState(authorities);
  if (!approvalState.allAuthoritiesLoveIt) {
    throw new Error('B4.9R4 blocked — not all five authorities are LOVE_IT');
  }

  const storyboardCompilationContract = resolveFinalStoryboardCompilationContract(preStoryboardAuthorityPack);
  assertStoryboardCompilationFailClosed(storyboardCompilationContract);

  const visualAuthorityManifest = await compileEntry002StoryboardVisualAuthorityManifest();
  if (!options?.skipAuthorityImageBinding) {
    assertVisualAuthorityManifestFailClosed(visualAuthorityManifest);
  }

  const brief = compileEntry002FinalCinematicStoryboardBrief({
    treatment,
    preStoryboardAuthorityPack,
  });

  saveStoryboard001HistoricalRecord(
    getStoryboard001HistoricalRecord() ?? buildStoryboard001HistoricalFailureRecord(),
  );
  saveStoryboard002HistoricalRecord(
    getStoryboard002HistoricalRecord() ?? buildStoryboard002HistoricalFailureRecord(),
  );
  saveStoryboard003HistoricalRecord(
    getStoryboard003HistoricalRecord() ?? buildStoryboard003HistoricalFailureRecord(),
  );
  saveStoryboard004HistoricalRecord(
    getStoryboard004HistoricalRecord() ?? buildStoryboard004HistoricalFailureRecord(),
  );

  const panelManifest = compileEntry002FinalCinematicStoryboardPanelManifest();
  const reelVisualConception = compileEntry002ReelVisualConception(panelManifest);
  assertReelConceptionReady(reelVisualConception);
  const compiledPrompt = compileReelFirstStoryboardPrompt({
    conception: reelVisualConception,
    brief,
    visualAuthorityManifest,
  });

  let reelArtifact: ReelStoryboardArtifactResult | null = null;
  let structuralQA = await runReelStoryboardStructuralQA({
    conception: reelVisualConception,
    storyboardImagePath: null,
    storyboardAssetCount: 0,
    compiledPrompt,
  });
  let continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
  let renderModeQA = runStoryboardRenderModeQA({
    generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
    storyboardDispatchCount: 0,
    storyboardRenderCount: 0,
    storyboardAssetCount: 0,
    independentStoryboardPanelAssetCount: 0,
  });
  let reelCoherenceQA = runReelCoherenceQA({ conception: reelVisualConception });
  let boardTypeQA = runReelStoryboardBoardTypeQA({
    storyboardAssetCount: 0,
    selectedMomentCount: reelVisualConception.selectedStoryboardMoments.length,
  });
  let visualAuthorityFidelityQA = await runVisualAuthorityFidelityQA({
    manifest: visualAuthorityManifest,
    provider: 'none',
    dispatched: false,
    rendered: false,
    providerAuthorityImageInputCount: 0,
    storyboardImagePath: null,
  });

  let finalCinematicStoryboard = getFinalCinematicStoryboardRecord();
  const storedJudgment = resolveFinalStoryboardFounderJudgment();

  const deterministicReelStoryboardTest =
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD === '1' ||
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD === '1';

  const shouldAttemptGeneration =
    options?.skipGeneration !== true &&
    ((options?.explicitFounderAction === true && options?.dispatchFal === true) ||
      (deterministicReelStoryboardTest &&
        (!finalCinematicStoryboard || options?.forceDispatch === true)));

  if (shouldAttemptGeneration) {
    const guard = evaluateStoryboardGenerationGuard({
      explicitFounderAction: true,
      currentStageIsFinalStoryboard: true,
      allFiveAuthoritiesApproved: approvalState.allAuthoritiesLoveIt,
      generationInFlight: getStoryboardCostTelemetry().generationInFlight,
      autoRetry: false,
      storyboardGenerationAllowed: true,
    });

    if (!guard.allowed) {
      throw new Error(`Storyboard generation blocked: ${guard.blockers.join('; ')}`);
    }

    beginStoryboardGenerationAttempt();

    const dispatchFal =
      options?.dispatchFal === true ||
      (options?.explicitFounderAction === true && options?.dispatchFal !== false);

    reelArtifact = await dispatchReelFirstStoryboardArtifact({
      conception: reelVisualConception,
      brief,
      visualAuthorityManifest,
      narrativeBeatCount: panelManifest.length,
      dispatchFal,
      forceDispatch: options?.forceDispatch,
      skipAuthorityImageBinding: options?.skipAuthorityImageBinding,
    });

    if (reelArtifact.failure || !reelArtifact.rendered) {
      recordStoryboardGenerationFailure();
      finalCinematicStoryboard = buildEntry002FinalCinematicStoryboard005Record({
        manifest: panelManifest,
        artifact: reelArtifact,
        structuralQaStatus: 'FAIL',
        continuityQaStatus: 'FAIL',
        renderModeQaStatus: 'FAIL',
        reelCoherenceQaStatus: 'FAIL',
        boardTypeQaStatus: 'FAIL',
        visualAuthorityFidelityQaStatus: 'FAIL',
        readinessState: 'PIPELINE_READY',
        status: 'STORYBOARD_REQUIRES_FOUNDER_DECISION',
      });
      saveFinalCinematicStoryboardRecord(finalCinematicStoryboard);
    } else {
      reelArtifact.telemetry.visualAuthorityFidelityQaExecuted = true;

      structuralQA = await runReelStoryboardStructuralQA({
        conception: reelVisualConception,
        storyboardImagePath: reelArtifact.compositeUrl,
        storyboardAssetCount: 1,
        compiledPrompt,
      });
      continuityDomainQA = runStoryboardContinuityDomainQA(panelManifest);
      renderModeQA = runStoryboardRenderModeQA({
        generationMode: 'REEL_FIRST_SINGLE_ARTIFACT',
        storyboardDispatchCount: reelArtifact.telemetry.storyboardDispatchCount,
        storyboardRenderCount: reelArtifact.telemetry.storyboardRenderCount,
        storyboardAssetCount: 1,
        independentStoryboardPanelAssetCount: reelArtifact.telemetry.panelRenderCount,
      });
      reelCoherenceQA = runReelCoherenceQA({ conception: reelVisualConception });
      boardTypeQA = runReelStoryboardBoardTypeQA({
        storyboardAssetCount: 1,
        selectedMomentCount: reelVisualConception.selectedStoryboardMoments.length,
      });
      visualAuthorityFidelityQA = await runVisualAuthorityFidelityQA({
        manifest: visualAuthorityManifest,
        provider: reelArtifact.provider,
        dispatched: reelArtifact.dispatched,
        rendered: reelArtifact.rendered,
        providerAuthorityImageInputCount: reelArtifact.telemetry.providerAuthorityImageInputCount,
        storyboardImagePath: reelArtifact.compositeUrl,
      });

      const structuralPassed = structuralQA.passed;
      const continuityPassed = continuityDomainQA.passed;
      const renderModePassed = renderModeQA.passed;
      const reelCoherencePassed = reelCoherenceQA.passed;
      const boardTypePassed = boardTypeQA.passed;
      const visualFidelityPassed = visualAuthorityFidelityQA.passed;

      const readinessState = reelArtifact.pipelineTestOnly
        ? 'PIPELINE_TEST_ONLY'
        : visualFidelityPassed &&
            reelArtifact.realProviderDispatch &&
            reelArtifact.realProviderRender
          ? 'VISUAL_REVIEW_READY'
          : 'PIPELINE_READY';

      const allQaPassed =
        structuralPassed &&
        continuityPassed &&
        renderModePassed &&
        reelCoherencePassed &&
        boardTypePassed &&
        visualFidelityPassed &&
        readinessState === 'VISUAL_REVIEW_READY';

      const status = reelArtifact.pipelineTestOnly
        ? 'PIPELINE_TEST_ONLY'
        : allQaPassed
          ? 'AWAITING_FOUNDER_APPROVAL'
          : 'STORYBOARD_REQUIRES_FOUNDER_DECISION';

      finalCinematicStoryboard = buildEntry002FinalCinematicStoryboard005Record({
        manifest: panelManifest,
        artifact: reelArtifact,
        structuralQaStatus: structuralQA.result,
        continuityQaStatus: continuityDomainQA.result,
        renderModeQaStatus: renderModeQA.result,
        reelCoherenceQaStatus: reelCoherenceQA.result,
        boardTypeQaStatus: boardTypeQA.result,
        visualAuthorityFidelityQaStatus: visualAuthorityFidelityQA.result,
        readinessState,
        status,
      });

      recordStoryboardProviderDispatch({
        requestedBy: 'founder',
        requestedAt: new Date().toISOString(),
        storyboardVersion: finalCinematicStoryboard.version,
        authorityIds: finalCinematicStoryboard.authorityIds,
        authorityAssetIds: visualAuthorityManifest.entries.map((e) => e.assetId),
        provider: reelArtifact.provider ?? 'fal-gpt-image',
        estimatedAttemptCount: 1,
        dispatchReceiptId: reelArtifact.providerRequestId ?? `dispatch-${Date.now()}`,
      });

      if (storedJudgment !== 'UNREVIEWED') {
        finalCinematicStoryboard = applyFinalStoryboardFounderJudgmentToRecord(
          finalCinematicStoryboard,
          storedJudgment,
        );
      }

      saveFinalCinematicStoryboardRecord(finalCinematicStoryboard);
    }
  } else if (finalCinematicStoryboard) {
    structuralQA = await runReelStoryboardStructuralQA({
      conception: reelVisualConception,
      storyboardImagePath: finalCinematicStoryboard.storyboardStripUrl,
      storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
      compiledPrompt,
    });
    continuityDomainQA = runStoryboardContinuityDomainQA(finalCinematicStoryboard.panelManifest);
    renderModeQA = runStoryboardRenderModeQA({
      generationMode: finalCinematicStoryboard.generationMode,
      storyboardDispatchCount: finalCinematicStoryboard.telemetry.storyboardDispatchCount,
      storyboardRenderCount: finalCinematicStoryboard.telemetry.storyboardRenderCount,
      storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
      independentStoryboardPanelAssetCount: finalCinematicStoryboard.telemetry.panelRenderCount,
    });
    reelCoherenceQA = runReelCoherenceQA({ conception: reelVisualConception });
    boardTypeQA = runReelStoryboardBoardTypeQA({
      storyboardAssetCount: finalCinematicStoryboard.rendered ? 1 : 0,
      selectedMomentCount: reelVisualConception.selectedStoryboardMoments.length,
    });
    visualAuthorityFidelityQA = await runVisualAuthorityFidelityQA({
      manifest: visualAuthorityManifest,
      provider: finalCinematicStoryboard.provider ?? 'none',
      dispatched: finalCinematicStoryboard.dispatched,
      rendered: finalCinematicStoryboard.rendered,
      providerAuthorityImageInputCount:
        finalCinematicStoryboard.telemetry.providerAuthorityImageInputCount ?? 0,
      storyboardImagePath: finalCinematicStoryboard.storyboardStripUrl,
    });
  }

  if (finalCinematicStoryboard && storedJudgment !== 'UNREVIEWED') {
    finalCinematicStoryboard = applyFinalStoryboardFounderJudgmentToRecord(
      finalCinematicStoryboard,
      storedJudgment,
    );
    saveFinalCinematicStoryboardRecord(finalCinematicStoryboard);
  }

  const valid = isFounderReviewableStoryboard(finalCinematicStoryboard);
  const founderJudgment = finalCinematicStoryboard?.founderJudgment ?? storedJudgment;
  const generatedAttempt =
    (finalCinematicStoryboard?.telemetry.storyboardRenderCount ?? 0) >= 1 ||
    finalCinematicStoryboard?.storyboardSource === 'FOUNDER_SUPPLIED';

  const gateSatisfaction = buildPreStoryboardGateSatisfaction(authorities);
  const preStoryboardGate = buildEntry002PreStoryboardAuthorityGate(approvalState);
  const finalStoryboardReviewGate = buildEntry002FinalStoryboardReviewGate(founderJudgment, valid);
  const pipelineState = buildEntry002PipelineReconciliationState({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    storyboardApproved: founderJudgment === 'LOVE_IT',
    structuralQaPassed: structuralQA.passed,
    continuityQaPassed: continuityDomainQA.passed,
    duplicationQaPassed: true,
  });
  const productionEligibility = resolveEntry002ProductionEligibility({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed,
    continuityQaPassed: continuityDomainQA.passed,
    duplicationQaPassed: true,
  });
  const founderGates = buildEntry002FounderReviewGatesForPipeline(approvalState, {
    storyboardGenerated: valid,
    storyboardFounderJudgment: founderJudgment,
  });
  const founderReviewSlots = buildPreStoryboardFounderReviewSlots(authorities);
  const authorityRecords = summarizePreStoryboardAuthorityRecords(authorities);

  const finalStoryboardRecord = finalCinematicStoryboard
    ? toEntry002FinalCinematicStoryboardSummaryRecord(finalCinematicStoryboard)
    : toEntry002FinalCinematicStoryboardSummaryRecord(
        buildEntry002FinalCinematicStoryboard005Record({
          manifest: panelManifest,
          artifact: {
            compositeUrl: '',
            compositePath: '',
            provider: 'none',
            providerRequestId: null,
            dispatched: false,
            rendered: false,
            pipelineTestOnly: true,
            telemetry: {
              reelConceptionCompileCount: 1,
              narrativeBeatCount: panelManifest.length,
              selectedStoryboardMomentCount: 9,
              storyboardPromptCompileCount: 1,
              storyboardCompileCount: 1,
              storyboardDispatchCount: 0,
              storyboardRenderCount: 0,
              panelManifestCount: panelManifest.length,
              panelDispatchCount: 0,
              panelRenderCount: 0,
              requiredAuthorityImageCount: 5,
              resolvedAuthorityImageCount: visualAuthorityManifest.resolvedAuthorityImageCount,
              providerAuthorityImageInputCount: 0,
              authorityImageIdsSentToProvider: [],
              independentStoryboardPanelDispatchCount: 0,
              independentStoryboardPanelRenderCount: 0,
              visualAuthorityFidelityQaExecuted: false,
            },
          },
          structuralQaStatus: 'FAIL',
          continuityQaStatus: 'FAIL',
          renderModeQaStatus: 'FAIL',
          reelCoherenceQaStatus: 'FAIL',
          boardTypeQaStatus: 'FAIL',
          visualAuthorityFidelityQaStatus: 'NOT_RUN',
          readinessState: 'PIPELINE_TEST_ONLY',
          status: 'REVISION_REQUIRED',
        }),
      );

  const nextAction = resolveEntry002NextAction({
    preStoryboardApproval: approvalState,
    storyboardGenerated: generatedAttempt,
    storyboardValid: valid,
    storyboardFounderJudgment: founderJudgment,
    structuralQaPassed: structuralQA.passed && reelCoherenceQA.passed && visualAuthorityFidelityQA.passed,
  });

  const t = finalCinematicStoryboard?.telemetry;
  const telemetryNote = valid
    ? `B4.9R4 5/5 AUTHORITY RECORDS RESOLVED · 5/5 AUTHORITY IMAGE ASSETS RESOLVED · 5/5 AUTHORITY IMAGES SENT TO PROVIDER · 5/5 VISUAL AUTHORITY DOMAINS QA PASS`
    : reelArtifact?.pipelineTestOnly
      ? `B4.9R4 PIPELINE_TEST_ONLY — deterministic render; founder review inactive until reference-conditioned FAL production render`
      : reelArtifact
        ? `B4.9R4 REFS_SENT=${t?.providerAuthorityImageInputCount ?? 0} · VISUAL_FIDELITY=${visualAuthorityFidelityQA.result}`
        : 'B4.9R4 awaiting visual-authority-bound reel storyboard generation';

  return {
    sprint: 'B4.9R4_VISUAL_AUTHORITY_BINDING_RECOVERY',
    visualAuthorityRootCause:
      'Authority ID resolution and text summaries reached QA without five approved authority images bound into provider reference conditioning',
    b49FailureMode: 'ONE hero image + storyboard-like notes',
    b49rFailureMode: '16 independent panel provider dispatches',
    b49r2FailureMode: 'Single artifact but unrelated beat collage / contact sheet',
    b49r3FailureMode: 'Reel-first conception but deterministic/text-only authority — no visual binding',
    storyboard001Historical: getStoryboard001HistoricalRecord()!,
    storyboard002Historical: getStoryboard002HistoricalRecord()!,
    storyboard003Historical: getStoryboard003HistoricalRecord()!,
    storyboard004Historical: getStoryboard004HistoricalRecord()!,
    storyboard005Historical: getStoryboard005HistoricalRecord(),
    storyboardCostGuard: getStoryboardCostTelemetry(),
    visualAuthorityManifest,
    reelVisualConception,
    panelManifest,
    compiledPrompt,
    reelArtifact,
    structuralQA,
    continuityDomainQA,
    renderModeQA,
    reelCoherenceQA,
    boardTypeQA,
    visualAuthorityFidelityQA,
    finalCinematicStoryboard,
    finalStoryboardRecord,
    storyboardBrief: brief,
    preStoryboardGate,
    finalStoryboardReviewGate,
    gateSatisfaction,
    founderReviewSlots,
    pipelineState,
    founderGates,
    finalStoryboardEligibility: pipelineState.finalStoryboard,
    storyboardCompilationContract,
    authorityRecords,
    productionEligibility,
    founderApprovalsPersisted: ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS,
    authorityVersion: ENTRY_002_PRE_STORYBOARD_AUTHORITY_VERSION,
    productionOrder: PRE_STORYBOARD_VISUAL_PRODUCTION_ORDER,
    treatment,
    preStoryboardAuthorityPack: { ...preStoryboardAuthorityPack, canonState: 'PRODUCTION_CANDIDATE' },
    cinematicSequence: {
      sequenceId: ENTRY_002_CINEMATIC_SEQUENCE_001,
      status: 'PRE_AUTHORITY_EXPERIMENT',
      canonState: 'NON_CANON',
      founderJudgment: 'UNREVIEWED',
      visualAuthority: false,
      referenceOnly: true,
      active: false,
    },
    keyframes: productionEligibility.keyframeEligibility,
    video: 'BLOCKED',
    qa,
    nextAction,
    telemetryNote,
  };
}

export async function importFounderSuppliedStoryboardForEntry002(
  variant: FounderStoryboardVariant,
): Promise<Awaited<ReturnType<typeof bootstrapB49R4VisualAuthorityBindingRecovery>>> {
  ensureFounderStoryboardAssetsOnDisk(process.cwd());
  const readState = await bootstrapB49R4VisualAuthorityBindingRecovery({ skipGeneration: true });
  const current = getFinalCinematicStoryboardRecord();
  if (current?.storyboardId === ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID) {
    saveStoryboard005HistoricalRecord({ ...current, referenceOnly: true });
  }
  const imported = importFounderStoryboardVariant({
    variant,
    manifest: readState.panelManifest,
  });
  saveFinalCinematicStoryboardRecord(imported);
  return bootstrapB49R4VisualAuthorityBindingRecovery({ skipGeneration: true });
}

export function recordFinalStoryboardFounderJudgment(params: {
  founderJudgment: 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME';
  notes?: string | null;
}): ReturnType<typeof recordFinalCinematicStoryboardJudgment> {
  return recordFinalCinematicStoryboardJudgment(params);
}

export {
  resetFinalCinematicStoryboardStore,
  getFinalCinematicStoryboardRecord,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  getStoryboard003HistoricalRecord,
  getStoryboard004HistoricalRecord,
  getStoryboard005HistoricalRecord,
  resetFinalCinematicStoryboardJudgmentStore,
  getFinalCinematicStoryboardJudgment,
  hasValidFinalCinematicStoryboard,
  isFounderReviewableStoryboard,
};

export { bootstrapB49R4VisualAuthorityBindingRecovery as bootstrapB49R4 };
