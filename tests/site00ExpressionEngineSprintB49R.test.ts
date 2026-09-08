import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  bootstrapB49R3 as bootstrapB49R,
  resetFinalCinematicStoryboardStore,
  resetFinalCinematicStoryboardJudgmentStore,
  recordFinalStoryboardFounderJudgment,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  getStoryboard003HistoricalRecord,
} from '../api/_lib/site00ExpressionEngine/entry002B49R3Bootstrap.js';
import { bootstrapB48 } from '../api/_lib/site00ExpressionEngine/entry002B48Bootstrap.js';
import {
  resetPreStoryboardAuthorityStore,
  persistEntry002PreStoryboardFounderApprovals,
} from '../api/_lib/site00ExpressionEngine/preStoryboardAuthorityStore.js';
import { ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardFounderApproval.js';
import {
  ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION,
  ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION,
  ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION,
  resolveEntry002NextAction,
  resolveEntry002ProductionEligibility,
} from '../api/_lib/site00ExpressionEngine/entry002PipelineState.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardPanelManifest.js';
import { evaluateB49FalsePositiveStructure, runStoryboardStructureQA } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardStructureQA.js';
import { runStoryboardContinuityDomainQA } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardContinuityDomainQA.js';
import { runStoryboardDuplicationQA } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardDuplicationQA.js';
import { runFinalCinematicStoryboardPanelPipeline } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardPanelPipeline.js';
import { isKeyframeEligibleFromFinalStoryboard } from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardRecord.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_004_ID,
  FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_MIN,
  FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
} from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import { B49R2_PANEL_FANOUT_FAILURE_REASON, B49R3_REEL_COHERENCE_FAILURE_REASON } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardHistory.js';
import { resetLineageStore, listGenerationReceiptsForEntry } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { B49_FALSE_POSITIVE_FAILURE_REASON } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardHistory.js';

describe('Expression Engine Sprint B4.9R — Storyboard structure recovery (B4.9R3 reel-first)', { timeout: 60000 }, () => {
  beforeEach(async () => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_REEL_STORYBOARD = '1';
    delete process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD;
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();
  });

  it('1. B4.9 false-positive regression — composite without panels fails structure QA', async () => {
    const regression = evaluateB49FalsePositiveStructure({
      compositeExists: true,
      distinctRenderedPanelCount: 0,
    });
    expect(regression.passed).toBe(false);
    expect(regression.result).toBe('FAIL');
    expect(regression.blockers.some((b) => b.includes('false positive'))).toBe(true);

    const eligibility = resolveEntry002ProductionEligibility({
      preStoryboardApproval: { allAuthoritiesLoveIt: true, loveItCount: 5, unreviewedCount: 0, promisingCount: 0, notForMeCount: 0, approvedAuthorityIds: [] },
      storyboardGenerated: true,
      storyboardValid: false,
      structuralQaPassed: false,
    });
    expect(eligibility.finalStoryboardEligibility).not.toBe('AWAITING_FOUNDER_APPROVAL');
    expect(eligibility.founderStoryboardApproval).toBe('INACTIVE');
    expect(eligibility.keyframeEligibility).toBe('BLOCKED');
  });

  it('2. one hero image does not count as storyboard', async () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    const qa = await runStoryboardStructureQA({
      manifest: manifest.map((p, i) =>
        i === 0 ? { ...p, generationStatus: 'RENDERED', previewUrl: '/fake.jpg', assetId: 'same' } : p,
      ),
      compositeExists: true,
      panelOnlyCompositeWithoutDistinctPanels: true,
    });
    expect(qa.passed).toBe(false);
  });

  it('3. Sharp composite alone cannot satisfy panel completeness', async () => {
    const qa = await runStoryboardStructureQA({
      manifest: compileEntry002FinalCinematicStoryboardPanelManifest(),
      compositeExists: true,
      panelOnlyCompositeWithoutDistinctPanels: true,
    });
    expect(qa.passed).toBe(false);
  });

  it('4. minimum 12 distinct panels required', () => {
    expect(FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_MIN).toBeGreaterThanOrEqual(12);
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(manifest.length).toBeGreaterThanOrEqual(FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_MIN);
  });

  it('5. target panel manifest resolves all required beats', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(manifest.length).toBe(FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET);
    const beatIds = new Set(manifest.map((p) => p.beatId));
    expect(beatIds.has('DISCOVERY')).toBe(true);
    expect(beatIds.has('INTERJECTION')).toBe(true);
    expect(beatIds.has('SNAP_BACK')).toBe(true);
    expect(beatIds.has('2016_LANDING')).toBe(true);
    expect(beatIds.has('MEMORY_LIFTS')).toBe(true);
  });

  it('6–8. single-artifact storyboard, narrative beats via full bootstrap', async () => {
    const result = await bootstrapB49R();
    expect(result.finalCinematicStoryboard?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_004_ID);
    expect(result.structuralQA.passed).toBe(true);
    expect(result.finalCinematicStoryboard?.telemetry.selectedStoryboardMomentCount).toBe(9);
    expect(result.finalCinematicStoryboard?.telemetry.panelRenderCount).toBe(0);
    expect(result.reelCoherenceQA.passed).toBe(true);
    expect(result.continuityDomainQA.passed).toBe(true);
  });

  it('9. missing snap-back fails structural QA', async () => {
    const trimmed = compileEntry002FinalCinematicStoryboardPanelManifest().filter(
      (p) => p.beatId !== 'SNAP_BACK',
    );
    const qa = await runStoryboardStructureQA({
      manifest: trimmed,
      compositeExists: false,
    });
    expect(qa.narrativeCoverage.hasSnapBack).toBe(false);
    expect(qa.passed).toBe(false);
  });

  it('10. missing interjection fails structural QA', async () => {
    const noInterjection = compileEntry002FinalCinematicStoryboardPanelManifest().map((p) =>
      p.beatId === 'INTERJECTION' ? { ...p, requiredText: null } : p,
    );
    const qa = await runStoryboardStructureQA({
      manifest: noInterjection,
      compositeExists: false,
    });
    expect(qa.narrativeCoverage.hasInterjection).toBe(false);
    expect(qa.passed).toBe(false);
  });

  it('11. missing 2016 landing fails structural QA', async () => {
    const trimmed = compileEntry002FinalCinematicStoryboardPanelManifest().filter(
      (p) => p.beatId !== '2016_LANDING',
    );
    const qa = await runStoryboardStructureQA({
      manifest: trimmed,
      compositeExists: false,
    });
    expect(qa.narrativeCoverage.has2016Landing).toBe(false);
    expect(qa.passed).toBe(false);
  });

  it('12. missing memory extraction fails structural QA', async () => {
    const trimmed = compileEntry002FinalCinematicStoryboardPanelManifest().filter(
      (p) => p.beatId !== 'MEMORY_LIFTS',
    );
    const qa = await runStoryboardStructureQA({
      manifest: trimmed,
      compositeExists: false,
    });
    expect(qa.narrativeCoverage.hasMemoryExtraction).toBe(false);
    expect(qa.passed).toBe(false);
  });

  it('13. repeated same asset ID fails duplication QA', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest().map((p, i) => ({
      ...p,
      generationStatus: 'RENDERED' as const,
      assetId: i < 3 ? 'DUPLICATE-ASSET' : p.assetId,
      contentHash: i < 3 ? 'same-hash' : `hash-${i}`,
    }));
    const qa = runStoryboardDuplicationQA(manifest);
    expect(qa.passed).toBe(false);
    expect(qa.duplicateAssetIds.length).toBeGreaterThan(0);
  });

  it('14. NDX/subject merging fails continuity when ndx visibility invalid', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest().map((p) => ({
      ...p,
      ndxVisibility: 'full face protagonist reveal merged with subject',
    }));
    const qa = runStoryboardContinuityDomainQA(manifest);
    expect(qa.domains.NDX_PRESENCE).toBe('FAIL');
  });

  it('15–16. nail continuity domains pass on valid manifest', async () => {
    const result = await bootstrapB49R();
    expect(result.continuityDomainQA.domains.NDX_HANDS).toBe('PASS');
    expect(result.continuityDomainQA.domains.SUBJECT_IDENTITY).toBe('PASS');
  });

  it('17–18. full-body phone content contract in manifest', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(manifest.some((p) => /full-body|full body/i.test(p.subjectVisibility))).toBe(true);
    expect(manifest.some((p) => /varied|grid/i.test(p.description))).toBe(true);
  });

  it('19–21. single artifact generation; founder review after QA', async () => {
    const result = await bootstrapB49R();
    expect(result.finalCinematicStoryboard?.generationMode).toBe('REEL_FIRST_SINGLE_ARTIFACT');
    expect(result.finalStoryboardReviewGate.active).toBe(true);
    expect(result.productionEligibility.founderStoryboardApproval).toBe('ACTIVE');
    expect(result.nextAction).toBe(ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION);
  });

  it('22. keyframes blocked until founder LOVE_IT', async () => {
    await bootstrapB49R();
    expect(resolveEntry002ProductionEligibility({
      preStoryboardApproval: { allAuthoritiesLoveIt: true, loveItCount: 5, unreviewedCount: 0, promisingCount: 0, notForMeCount: 0, approvedAuthorityIds: [] },
      storyboardValid: true,
      storyboardGenerated: true,
      storyboardFounderJudgment: 'UNREVIEWED',
      structuralQaPassed: true,
      continuityQaPassed: true,
      duplicationQaPassed: true,
    }).keyframeEligibility).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');

    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const after = await bootstrapB49R();
    expect(after.keyframes).toBe('READY_FOR_GENERATION');
    expect(isKeyframeEligibleFromFinalStoryboard('LOVE_IT')).toBe(true);
  });

  it('23. storyboard 001, 002, 003 preserved as historical failures', async () => {
    await bootstrapB49R();
    const historical001 = getStoryboard001HistoricalRecord();
    expect(historical001?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID);
    expect(historical001?.status).toBe('FAILED_STORYBOARD_STRUCTURE');
    expect(historical001?.referenceOnly).toBe(true);
    expect(historical001?.failureReason).toBe(B49_FALSE_POSITIVE_FAILURE_REASON);
    expect(historical001?.canon).toBe(false);
    expect(historical001?.founderJudgment).toBe('UNREVIEWED');

    const historical002 = getStoryboard002HistoricalRecord();
    expect(historical002?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID);
    expect(historical002?.status).toBe('FAILED_STORYBOARD_RENDER_MODE');
    expect(historical002?.failureReason).toBe(B49R2_PANEL_FANOUT_FAILURE_REASON);
    expect(historical002?.referenceOnly).toBe(true);

    const historical003 = getStoryboard003HistoricalRecord();
    expect(historical003?.status).toBe('FAILED_REEL_COHERENCE');
    expect(historical003?.failureReason).toBe(B49R3_REEL_COHERENCE_FAILURE_REASON);
  });

  it('24. storyboard 004 consumes all five authority IDs', async () => {
    const result = await bootstrapB49R();
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      expect(result.finalCinematicStoryboard?.authorityIds).toContain(expected.authorityId);
    }
  });

  it('25. provider telemetry records single storyboard render, zero panel renders', async () => {
    const result = await bootstrapB49R();
    expect(result.finalCinematicStoryboard?.telemetry.storyboardRenderCount).toBe(1);
    expect(result.finalCinematicStoryboard?.telemetry.panelRenderCount).toBe(0);
    expect(result.telemetryNote).toContain('REEL_COHERENCE_PASS');
  });

  it('26. local composite records assembly not generation for storyboard 001', async () => {
    await bootstrapB49R();
    const historical = getStoryboard001HistoricalRecord();
    expect(historical?.assembled).toBe(true);
    expect(historical?.rendered).toBe(false);
    expect(historical?.telemetry.panelRenderCount).toBe(0);
    expect(historical?.provider).toBe('local-sharp-composite');
  });

  it('27. reel storyboard strip 004 exists on disk', async () => {
    await bootstrapB49R();
    const stripPath = path.join(
      process.cwd(),
      'public',
      buildEntry002FinalCinematicStoryboardPublicStripPath(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_004_ID).replace(/^\//, ''),
    );
    await expect(fs.access(stripPath)).resolves.toBeUndefined();
  });

  it('28. complete sequence reconstructable from manifest ordering', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    const numbers = manifest.map((p) => p.panelNumber);
    expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    expect(numbers[0]).toBe(1);
    expect(numbers[numbers.length - 1]).toBe(16);
  });

  it('30. pipeline gate correction — invalid storyboard keeps founder review inactive', async () => {
    const b48 = await bootstrapB48();
    expect(b48.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);

    const qaFail = await runStoryboardStructureQA({
      manifest: compileEntry002FinalCinematicStoryboardPanelManifest(),
      compositeExists: true,
      panelOnlyCompositeWithoutDistinctPanels: true,
    });
    expect(qaFail.passed).toBe(false);

    const next = resolveEntry002NextAction({
      preStoryboardApproval: { allAuthoritiesLoveIt: true, loveItCount: 5, unreviewedCount: 0, promisingCount: 0, notForMeCount: 0, approvedAuthorityIds: [] },
      storyboardGenerated: true,
      storyboardValid: false,
      structuralQaPassed: false,
    });
    expect(next).toBe(ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION);
  });

  it('31. cinematic sequence remains non-canon reference', async () => {
    const result = await bootstrapB49R();
    expect(result.cinematicSequence.sequenceId).toBe(ENTRY_002_CINEMATIC_SEQUENCE_001);
    expect(result.cinematicSequence.visualAuthority).toBe(false);
    expect(result.cinematicSequence.referenceOnly).toBe(true);
  });

  it('32. video remains blocked after LOVE_IT', async () => {
    await bootstrapB49R();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const result = await bootstrapB49R();
    expect(result.video).toBe('BLOCKED');
  });

  it('33. panel lineage receipts when FAL not used — deterministic panels skip dispatch receipts', async () => {
    await bootstrapB49R();
    const receipts = listGenerationReceiptsForEntry('entry-002');
    const panelReceipts = receipts.filter((r) => r.assetId.includes('PANEL'));
    expect(panelReceipts.length).toBe(0);
  });
});
