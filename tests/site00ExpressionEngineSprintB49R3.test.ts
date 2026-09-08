import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  bootstrapB49R3,
  resetFinalCinematicStoryboardStore,
  resetFinalCinematicStoryboardJudgmentStore,
  recordFinalStoryboardFounderJudgment,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  getStoryboard003HistoricalRecord,
  hasValidFinalCinematicStoryboard,
} from '../api/_lib/site00ExpressionEngine/entry002B49R3Bootstrap.js';
import {
  resetPreStoryboardAuthorityStore,
  persistEntry002PreStoryboardFounderApprovals,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardFounderApproval.js';
import {
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION,
  resolveEntry002NextAction,
} from '../api/_lib/site00ExpressionEngine/entry002PipelineState.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardPanelManifest.js';
import {
  compileEntry002ReelVisualConception,
  assertReelConceptionReady,
} from '../api/_lib/site00ExpressionEngine/entry002ReelVisualConception.js';
import { compileReelFirstStoryboardPrompt } from '../api/_lib/site00ExpressionEngine/entry002ReelStoryboardPrompt.js';
import { compileEntry002FinalCinematicStoryboardBrief } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardBrief.js';
import { buildEntry002ReelTreatmentAuthority } from '../api/_lib/site00ExpressionEngine/entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { attachEntry002PreStoryboardFounderAssets } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityAssets.js';
import { attachPreStoryboardAuthorityRecords } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecordBuilder.js';
import { applyStoredPreStoryboardJudgments } from '../api/_lib/site00ExpressionEngine/preStoryboardFounderJudgment.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import {
  resolveFinalStoryboardCompilationContract,
  assertStoryboardCompilationFailClosed,
} from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardCompilationContract.js';
import {
  runReelCoherenceQA,
  evaluateB49R2UnrelatedCollageReelCoherence,
} from '../api/_lib/site00ExpressionEngine/entry002ReelCoherenceQA.js';
import { runReelStoryboardBoardTypeQA } from '../api/_lib/site00ExpressionEngine/entry002ReelStoryboardBoardTypeQA.js';
import { evaluateB49FalsePositiveStructure } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardStructureQA.js';
import { evaluateB49RPanelFanOutRenderMode } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardRenderModeQA.js';
import { B49R3_REEL_COHERENCE_FAILURE_REASON } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardHistory.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_004_ID,
  FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET,
  REEL_STORYBOARD_MOMENT_COUNT_TARGET,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
} from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { resetLineageStore } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

function compileBrief() {
  const treatment = buildEntry002ReelTreatmentAuthority();
  const authorities = attachPreStoryboardAuthorityRecords(
    applyStoredPreStoryboardJudgments(
      attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
    ),
  );
  const pack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
  assertStoryboardCompilationFailClosed(resolveFinalStoryboardCompilationContract(pack));
  return compileEntry002FinalCinematicStoryboardBrief({ treatment, preStoryboardAuthorityPack: pack });
}

describe('Expression Engine Sprint B4.9R3 — Reel-first storyboard conception', { timeout: 60000 }, () => {
  beforeEach(async () => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD = '1';
    delete process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD;
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();
  });

  it('1. storyboard begins from ReelVisualConception', async () => {
    const result = await bootstrapB49R3();
    expect(result.reelVisualConception.reelId).toBe('NDX-ENTRY-002-REEL-TREATMENT-001');
    expect(result.reelVisualConception.selectedStoryboardMoments.length).toBe(9);
  });

  it('2. narrative beat manifest does not equal visual panel count', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    const conception = compileEntry002ReelVisualConception(manifest);
    expect(manifest.length).toBe(FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET);
    expect(conception.selectedStoryboardMoments.length).toBe(REEL_STORYBOARD_MOMENT_COUNT_TARGET);
    expect(manifest.length).not.toBe(conception.selectedStoryboardMoments.length);
  });

  it('3. 16 narrative beats compile to 9 selected storyboard moments', () => {
    const conception = compileEntry002ReelVisualConception();
    expect(conception.selectedStoryboardMoments.length).toBe(9);
  });

  it('4. selected moments preserve chronological order', () => {
    const conception = compileEntry002ReelVisualConception();
    expect(() => assertReelConceptionReady(conception)).not.toThrow();
    expect(conception.selectedStoryboardMoments.map((m) => m.momentNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('5–6. prompt describes complete reel before stills and one-reel doctrine', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    const conception = compileEntry002ReelVisualConception(manifest);
    const prompt = compileReelFirstStoryboardPrompt({ conception, brief: compileBrief() });
    expect(prompt).toContain('THE COMPLETE REEL AS ONE CONTINUOUS FILM');
    expect(prompt).toContain('ONE REEL, NOT NINE SEPARATE CONCEPTS');
    expect(prompt.indexOf('THE COMPLETE REEL')).toBeLessThan(prompt.indexOf('NINE SELECTED STILLS'));
  });

  it('7–14. continuity anchors in conception and prompt', () => {
    const conception = compileEntry002ReelVisualConception();
    const prompt = compileReelFirstStoryboardPrompt({ conception, brief: compileBrief() });
    expect(conception.continuityAnchors.length).toBeGreaterThanOrEqual(6);
    expect(conception.physicalWorld).toContain('dark');
    expect(conception.lightingArc).toContain('→');
    expect(conception.cameraLanguage).toContain('over-shoulder');
    expect(conception.ndxBehavior).toContain('lime');
    expect(conception.subjectBehavior).toContain('same woman');
    expect(conception.phoneBehavior).toContain('Same phone');
    expect(conception.editSuiteReveal).toMatch(/emerge|gradual|reveals/i);
    expect(conception.snapBackTreatment).toMatch(/Frame 01|opening/i);
    expect(prompt).toContain('Continuity anchors');
  });

  it('15–17. one image, nine stills, zero independent panel renders', async () => {
    const result = await bootstrapB49R3();
    expect(result.finalCinematicStoryboard?.telemetry.storyboardRenderCount).toBe(1);
    expect(result.finalCinematicStoryboard?.telemetry.selectedStoryboardMomentCount).toBe(9);
    expect(result.finalCinematicStoryboard?.telemetry.panelRenderCount).toBe(0);
  });

  it('18–19. authority board layouts excluded; visual authority content consumed', () => {
    const conception = compileEntry002ReelVisualConception();
    const prompt = compileReelFirstStoryboardPrompt({ conception, brief: compileBrief() });
    expect(conception.excludeAuthorityBoardLayouts).toBe(true);
    expect(prompt).toContain('DO NOT IMITATE AUTHORITY-BOARD');
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      expect(Object.keys(conception.authorityRoles)).toContain(expected.authorityId);
    }
  });

  it('20. panels cannot be independently reorderable', () => {
    const conception = compileEntry002ReelVisualConception();
    expect(conception.selectedStoryboardMoments.every((m) => m.reorderable === false)).toBe(true);
    const fail = runReelCoherenceQA({ conception, reorderableMoments: true });
    expect(fail.passed).toBe(false);
  });

  it('21–27. reel coherence QA regression cases', () => {
    const conception = compileEntry002ReelVisualConception();
    expect(runReelCoherenceQA({ conception }).passed).toBe(true);
    expect(runReelCoherenceQA({ conception, unrelatedScenes: true }).passed).toBe(false);
    expect(runReelCoherenceQA({ conception, environmentResets: true }).passed).toBe(false);
    expect(runReelCoherenceQA({ conception, identityResets: true }).passed).toBe(false);
    expect(evaluateB49R2UnrelatedCollageReelCoherence(conception).passed).toBe(false);
    expect(runReelStoryboardBoardTypeQA({
      storyboardAssetCount: 1,
      selectedMomentCount: 9,
      isUnrelatedContactSheet: true,
    }).passed).toBe(false);
  });

  it('28–30. B4.9, B4.9R, B4.9R2 regressions preserved', () => {
    expect(evaluateB49FalsePositiveStructure({ compositeExists: true, distinctRenderedPanelCount: 0 }).passed).toBe(false);
    expect(evaluateB49RPanelFanOutRenderMode({ independentStoryboardPanelAssetCount: 16, storyboardAssetCount: 1 }).passed).toBe(false);
    expect(evaluateB49R2UnrelatedCollageReelCoherence(compileEntry002ReelVisualConception()).passed).toBe(false);
  });

  it('31. founder review inactive until reel coherence passes', async () => {
    const failNext = resolveEntry002NextAction({
      preStoryboardApproval: { allAuthoritiesLoveIt: true, loveItCount: 5, unreviewedCount: 0, promisingCount: 0, notForMeCount: 0, approvedAuthorityIds: [] },
      storyboardGenerated: true,
      storyboardValid: false,
      structuralQaPassed: false,
    });
    expect(failNext).toBe(ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION);
  });

  it('32–33. keyframes and video remain blocked', async () => {
    const result = await bootstrapB49R3();
    expect(result.keyframes).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');
    expect(result.video).toBe('BLOCKED');
  });

  it('34–35. storyboard 004 reviewable only after QA; not auto-approved', async () => {
    const result = await bootstrapB49R3();
    expect(result.finalCinematicStoryboard?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID);
    expect(result.finalCinematicStoryboard?.approved).toBe(false);
    expect(result.finalCinematicStoryboard?.canon).toBe(false);
    expect(hasValidFinalCinematicStoryboard()).toBe(true);
    expect(result.finalStoryboardReviewGate.active).toBe(true);
    expect(result.nextAction).toBe(ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION);
  });

  it('36. storyboard 003 historical FAILED_REEL_COHERENCE', async () => {
    await bootstrapB49R3();
    const h = getStoryboard003HistoricalRecord();
    expect(h?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID);
    expect(h?.status).toBe('FAILED_REEL_COHERENCE');
    expect(h?.failureReason).toBe(B49R3_REEL_COHERENCE_FAILURE_REASON);
    expect(h?.referenceOnly).toBe(true);
  });

  it('37. generation mode REEL_FIRST_SINGLE_ARTIFACT', async () => {
    const result = await bootstrapB49R3();
    expect(result.finalCinematicStoryboard?.generationMode).toBe('REEL_FIRST_SINGLE_ARTIFACT');
  });

  it('38. strip 004 exists on disk', async () => {
    await bootstrapB49R3();
    const stripPath = path.join(
      process.cwd(),
      'public',
      buildEntry002FinalCinematicStoryboardPublicStripPath(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_004_ID).replace(/^\//, ''),
    );
    await expect(fs.access(stripPath)).resolves.toBeUndefined();
  });

  it('39. keyframes unlock only after LOVE_IT', async () => {
    await bootstrapB49R3();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const after = await bootstrapB49R3();
    expect(after.keyframes).toBe('READY_FOR_GENERATION');
  });

  it('40. all QA passes on successful bootstrap', async () => {
    const result = await bootstrapB49R3();
    expect(result.structuralQA.passed).toBe(true);
    expect(result.reelCoherenceQA.passed).toBe(true);
    expect(result.boardTypeQA.passed).toBe(true);
    expect(result.renderModeQA.passed).toBe(true);
    expect(result.continuityDomainQA.passed).toBe(true);
  });
});
