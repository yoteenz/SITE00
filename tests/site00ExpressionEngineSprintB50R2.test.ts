/**
 * B5.0R2 — Storyboard cost guard + founder-supplied import + downstream LOCKED semantics.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  bootstrapB49R4,
  importFounderSuppliedStoryboardForEntry002,
  recordFinalStoryboardFounderJudgment,
  resetFinalCinematicStoryboardStore,
  resetFinalCinematicStoryboardJudgmentStore,
  hasValidFinalCinematicStoryboard,
  getStoryboard005HistoricalRecord,
} from '../api/_lib/site00ExpressionEngine/entry002B49R4Bootstrap.js';
import {
  resetPreStoryboardAuthorityStore,
  persistEntry002PreStoryboardFounderApprovals,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import {
  resetStoryboardGenerationCostGuard,
  getStoryboardCostTelemetry,
  evaluateStoryboardGenerationGuard,
} from '../api/_lib/site00ExpressionEngine/storyboardGenerationCostGuard.js';
import { compileEntry002ProductionBlueprint } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import { translateExpressionEngineError } from '../src/site00/components/founderWorkspace/expressionEngine/expressionEngineErrorState';
import {
  buildSocialPackageReadiness,
  socialPackageStatusToJourneyStatus,
} from '../src/site00/components/founderWorkspace/expressionEngine/socialPackageReadiness';
import { buildProductionJourney } from '../src/site00/components/founderWorkspace/expressionEngine/productionJourney';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID,
} from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

const blueprint = compileEntry002ProductionBlueprint();

describe('B5.0R2 storyboard generation cost guard', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD = '1';
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetStoryboardGenerationCostGuard();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();
  });

  it('1–3. read-only bootstrap never dispatches provider generation', async () => {
    const before = getStoryboardCostTelemetry();
    const result = await bootstrapB49R4({ skipGeneration: true });
    const after = getStoryboardCostTelemetry();
    expect(after.storyboardProviderDispatchCount).toBe(before.storyboardProviderDispatchCount);
    expect(after.storyboardAutoRetryCount).toBe(0);
    expect(result.storyboardCostGuard?.storyboardAutoRetryCount).toBe(0);
  });

  it('4–5. explicit POST path dispatches at most one provider attempt', async () => {
    const result = await bootstrapB49R4({
      dispatchFal: true,
      explicitFounderAction: true,
      skipGeneration: false,
    });
    const telemetry = getStoryboardCostTelemetry();
    expect(telemetry.storyboardGenerationAttemptCount).toBe(1);
    expect(telemetry.storyboardProviderDispatchCount).toBeLessThanOrEqual(1);
    expect(result.finalCinematicStoryboard?.telemetry.storyboardDispatchCount).toBeLessThanOrEqual(1);
  });

  it('6–8. failed QA does not auto-retry; guard blocks implicit generation', async () => {
    await bootstrapB49R4({
      dispatchFal: true,
      explicitFounderAction: true,
      skipGeneration: false,
    });
    const telemetryAfterFirst = getStoryboardCostTelemetry();
    await bootstrapB49R4({ skipGeneration: true });
    const telemetryAfterRead = getStoryboardCostTelemetry();
    expect(telemetryAfterRead.storyboardAutoRetryCount).toBe(0);
    expect(telemetryAfterRead.storyboardProviderDispatchCount).toBe(telemetryAfterFirst.storyboardProviderDispatchCount);
  });

  it('9. founder may explicitly request another generation attempt', async () => {
    resetStoryboardGenerationCostGuard();
    await bootstrapB49R4({
      dispatchFal: true,
      explicitFounderAction: true,
      skipGeneration: false,
    });
    resetFinalCinematicStoryboardStore();
    await bootstrapB49R4({
      dispatchFal: true,
      explicitFounderAction: true,
      skipGeneration: false,
    });
    expect(getStoryboardCostTelemetry().storyboardGenerationAttemptCount).toBe(2);
  });

  it('hard guard requires explicit founder action and final storyboard stage', () => {
    const blocked = evaluateStoryboardGenerationGuard({
      explicitFounderAction: false,
      currentStageIsFinalStoryboard: true,
      allFiveAuthoritiesApproved: true,
      generationInFlight: false,
      autoRetry: false,
      storyboardGenerationAllowed: true,
    });
    expect(blocked.allowed).toBe(false);

    const allowed = evaluateStoryboardGenerationGuard({
      explicitFounderAction: true,
      currentStageIsFinalStoryboard: true,
      allFiveAuthoritiesApproved: true,
      generationInFlight: false,
      autoRetry: false,
      storyboardGenerationAllowed: true,
    });
    expect(allowed.allowed).toBe(true);
  });
});

describe('B5.0R2 founder-supplied storyboard import', () => {
  beforeEach(() => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD = '1';
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetStoryboardGenerationCostGuard();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();
  });

  it('10–13. founder import creates v006 with zero provider dispatches', async () => {
    const result = await importFounderSuppliedStoryboardForEntry002('A');
    const sb = result.finalCinematicStoryboard;
    expect(sb?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_006_ID);
    expect(sb?.storyboardSource).toBe('FOUNDER_SUPPLIED');
    expect(sb?.sourceArtifactOrigin).toBe('FOUNDER_SUPPLIED');
    expect(sb?.telemetry.storyboardDispatchCount).toBe(0);
    expect(sb?.telemetry.storyboardProviderDispatchCount).toBe(0);
    expect(getStoryboardCostTelemetry().storyboardImportedCount).toBeGreaterThanOrEqual(1);
  });

  it('14. imported storyboard preserves lineage to treatment + five authorities', async () => {
    const result = await importFounderSuppliedStoryboardForEntry002('B');
    const sb = result.finalCinematicStoryboard!;
    expect(sb.sourceTreatmentId).toBe('NDX-ENTRY-002-REEL-TREATMENT-001');
    expect(sb.authorityIds).toHaveLength(5);
    expect(sb.chapterId).toBeTruthy();
    expect(sb.worldId).toBeTruthy();
  });

  it('15–16. imported storyboard enters founder review and accepts LOVE_IT', async () => {
    await importFounderSuppliedStoryboardForEntry002('A');
    const read = await bootstrapB49R4({ skipGeneration: true });
    expect(read.finalStoryboardReviewGate.active).toBe(true);
    expect(hasValidFinalCinematicStoryboard()).toBe(true);

    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const approved = await bootstrapB49R4({ skipGeneration: true });
    expect(approved.finalCinematicStoryboard?.founderJudgment).toBe('LOVE_IT');
    expect(approved.productionEligibility.keyframeEligibility).not.toBe('BLOCKED');
  });

  it('17–18. downstream unlock does not require provider-generated source', async () => {
    await importFounderSuppliedStoryboardForEntry002('A');
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const approved = await bootstrapB49R4({ skipGeneration: true });
    expect(approved.finalCinematicStoryboard?.storyboardSource).toBe('FOUNDER_SUPPLIED');
    expect(approved.productionEligibility.keyframeEligibility).toMatch(/READY|ELIGIBLE|PENDING/);
  });

  it('19–20. storyboard history preserves failed versions; v005 non-canon after import', async () => {
    await bootstrapB49R4({
      dispatchFal: true,
      explicitFounderAction: true,
      skipGeneration: false,
    });
    await importFounderSuppliedStoryboardForEntry002('A');
    const historical = getStoryboard005HistoricalRecord();
    expect(historical?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_005_ID);
    expect(historical?.referenceOnly).toBe(true);
    expect(historical?.canon).toBe(false);
  });
});

describe('B5.0R2 downstream LOCKED semantics + error translation', () => {
  it('21. raw API error translates to recoverable founder state', () => {
    const view = translateExpressionEngineError('{"ERROR":"BRANDID AND ENTRYNUMBER REQUIRED"}');
    expect(view?.title).toBe('ENTRY CONTEXT UNAVAILABLE');
    expect(view?.recoverable).toBe(true);
    expect(view?.title).not.toContain('{');
  });

  it('22–24. Social Package LOCKED before Final Reel; INCOMPLETE only after unlock', () => {
    const locked = buildSocialPackageReadiness(blueprint, false);
    expect(locked.packageStatus).toBe('LOCKED');
    expect(locked.campaignBoardEligible).toBe(false);

    const unlocked = buildSocialPackageReadiness(blueprint, true);
    expect(unlocked.packageStatus).toBe('INCOMPLETE');
    expect(unlocked.campaignBoardEligible).toBe(false);

    const journey = buildProductionJourney({
      coverAuthority: 'APPROVED',
      reelTreatment: 'LOCKED',
      preStoryboardComplete: true,
      activeProductionStep: 'FINAL_CINEMATIC_STORYBOARD',
      finalStoryboardStatus: 'READY_FOR_GENERATION',
      finalStoryboardValid: false,
      finalStoryboardApproved: false,
      keyframeEligibility: 'BLOCKED',
      videoEligibility: 'BLOCKED',
      finalReelApproved: false,
      derivedSocialStatus: 'LOCKED',
      socialPackageStatus: socialPackageStatusToJourneyStatus(locked),
      campaignBoardEligible: false,
    });
    expect(journey.find((s) => s.id === 'SOCIAL_PACKAGE')?.status).toBe('LOCKED');
    expect(journey.find((s) => s.id === 'CAMPAIGN_BOARD')?.status).toBe('LOCKED');
    expect(journey.find((s) => s.id === 'STORYBOARD')?.status).toBe('ACTIVE');
  });
});
