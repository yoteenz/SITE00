import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  bootstrapB49R2,
  resetFinalCinematicStoryboardStore,
  resetFinalCinematicStoryboardJudgmentStore,
  recordFinalStoryboardFounderJudgment,
  getStoryboard001HistoricalRecord,
  getStoryboard002HistoricalRecord,
  hasValidFinalCinematicStoryboard,
} from '../api/_lib/site00ExpressionEngine/entry002B49R2Bootstrap.js';
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
import { compileSingleMultiPanelStoryboardPrompt } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardSingleArtifactPrompt.js';
import { compileEntry002FinalCinematicStoryboardBrief } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardBrief.js';
import { buildEntry002ReelTreatmentAuthority } from '../api/_lib/site00ExpressionEngine/entry002ReelTreatment.js';
import { buildEntry002PreStoryboardVisualAuthorities } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardVisualAuthorities.js';
import { attachEntry002PreStoryboardFounderAssets } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityAssets.js';
import { attachPreStoryboardAuthorityRecords } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecordBuilder.js';
import { applyStoredPreStoryboardJudgments } from '../api/_lib/site00ExpressionEngine/preStoryboardFounderJudgment.js';
import { buildEntry002PreStoryboardVisualAuthorityPack } from '../api/_lib/site00ExpressionEngine/entry002PreStoryboardAuthorityRecord.js';
import { evaluateB49FalsePositiveStructure } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardStructureQA.js';
import {
  evaluateB49RPanelFanOutRenderMode,
  runStoryboardRenderModeQA,
} from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardRenderModeQA.js';
import { runSingleStoryboardArtifactQA } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardSingleArtifactQA.js';
import { runStoryboardContinuityDomainQA } from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardContinuityDomainQA.js';
import { isKeyframeEligibleFromFinalStoryboard } from '../api/_lib/site00ExpressionEngine/entry002FinalStoryboardRecord.js';
import { ENTRY_002_CINEMATIC_SEQUENCE_001 } from '../shared/site00-expression-engine/entry002CinematicSequenceIds.js';
import {
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID,
  ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_003_ID,
  FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET,
  buildEntry002FinalCinematicStoryboardPublicStripPath,
} from '../shared/site00-expression-engine/finalCinematicStoryboardIds.js';
import {
  B49_FALSE_POSITIVE_FAILURE_REASON,
  B49R2_PANEL_FANOUT_FAILURE_REASON,
} from '../api/_lib/site00ExpressionEngine/entry002FinalCinematicStoryboardHistory.js';
import { resetLineageStore, listGenerationReceiptsForEntry } from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';

describe('Expression Engine Sprint B4.9R2 — Single-artifact cinematic storyboard recovery', { timeout: 60000 }, () => {
  beforeEach(async () => {
    process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_STORYBOARD = '1';
    delete process.env.EXPRESSION_ENGINE_TEST_DETERMINISTIC_PANELS;
    resetPreStoryboardAuthorityStore();
    resetFinalCinematicStoryboardStore();
    resetFinalCinematicStoryboardJudgmentStore();
    resetLineageStore();
    persistEntry002PreStoryboardFounderApprovals();
  });

  it('1. generation mode = SINGLE_MULTI_PANEL_ARTIFACT', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.generationMode).toBe('SINGLE_MULTI_PANEL_ARTIFACT');
  });

  it('2. internal panel manifest contains 16 entries', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(manifest.length).toBe(FINAL_CINEMATIC_STORYBOARD_PANEL_COUNT_TARGET);
  });

  it('3. 16 manifest entries do not cause 16 provider dispatches', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.telemetry.panelManifestCount).toBe(16);
    expect(result.finalCinematicStoryboard?.telemetry.panelDispatchCount).toBe(0);
    expect(result.finalCinematicStoryboard?.telemetry.storyboardDispatchCount).toBe(0);
  });

  it('4. final storyboard provider dispatch count = 0 in deterministic CI (1 when FAL)', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.telemetry.storyboardDispatchCount).toBe(0);
  });

  it('5. final storyboard render count = 1', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.telemetry.storyboardRenderCount).toBe(1);
  });

  it('6. final storyboard asset count = 1', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.rendered).toBe(true);
    expect(result.singleArtifact?.rendered).toBe(true);
  });

  it('7. independent storyboard panel asset count = 0', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.telemetry.panelRenderCount).toBe(0);
    expect(result.renderModeQA.independentStoryboardPanelAssetCount).toBe(0);
  });

  it('8. B4.9 failure mode A — one hero image fails structural QA', async () => {
    const qa = await runSingleStoryboardArtifactQA({
      manifest: compileEntry002FinalCinematicStoryboardPanelManifest(),
      storyboardImagePath: null,
      generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
      storyboardAssetCount: 1,
      heroImageOnly: true,
    });
    expect(qa.passed).toBe(false);
    expect(qa.blockers.some((b) => b.includes('notSingleHeroComposition'))).toBe(true);
  });

  it('9. one art-direction card fails structural QA (B4.9 regression)', async () => {
    const regression = evaluateB49FalsePositiveStructure({
      compositeExists: true,
      distinctRenderedPanelCount: 0,
    });
    expect(regression.passed).toBe(false);
  });

  it('10. one moodboard fails structural QA contract', async () => {
    const qa = await runSingleStoryboardArtifactQA({
      manifest: compileEntry002FinalCinematicStoryboardPanelManifest().slice(0, 3),
      storyboardImagePath: '/assets/fake.jpg',
      generationMode: 'SINGLE_MULTI_PANEL_ARTIFACT',
      storyboardAssetCount: 1,
    });
    expect(qa.passed).toBe(false);
  });

  it('11. one multi-panel sequential storyboard may pass', async () => {
    const result = await bootstrapB49R2();
    expect(result.structuralQA.passed).toBe(true);
    expect(result.renderModeQA.passed).toBe(true);
  });

  it('12. B4.9 false-positive remains prevented', async () => {
    const regression = evaluateB49FalsePositiveStructure({
      compositeExists: true,
      distinctRenderedPanelCount: 0,
    });
    expect(regression.result).toBe('FAIL');
    expect(regression.blockers.some((b) => b.toLowerCase().includes('false positive'))).toBe(true);
  });

  it('13. B4.9R panel-fan-out is prevented', () => {
    const qa = evaluateB49RPanelFanOutRenderMode({
      independentStoryboardPanelAssetCount: 16,
      storyboardAssetCount: 1,
    });
    expect(qa.passed).toBe(false);
    expect(qa.blockers).toContain('PANEL_FAN_OUT_INSTEAD_OF_SINGLE_STORYBOARD_ARTIFACT');
  });

  it('14. Sharp cannot create final storyboard visuals from authority assets (render mode)', () => {
    const qa = runStoryboardRenderModeQA({
      generationMode: 'PANEL_FAN_OUT',
      storyboardDispatchCount: 16,
      storyboardRenderCount: 1,
      storyboardAssetCount: 1,
      independentStoryboardPanelAssetCount: 16,
    });
    expect(qa.passed).toBe(false);
  });

  it('15. panel manifest remains available as planning metadata', async () => {
    const result = await bootstrapB49R2();
    expect(result.panelManifest.length).toBe(16);
    expect(result.finalCinematicStoryboard?.panelManifest.length).toBe(16);
  });

  it('16. all required story beats exist in manifest', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    const beatIds = new Set(manifest.map((p) => p.beatId));
    for (const beat of [
      'DISCOVERY',
      '2016_LANDING',
      'MEMORY_LIFTS',
      'INTERJECTION',
      'SNAP_BACK',
    ]) {
      expect(beatIds.has(beat)).toBe(true);
    }
  });

  it('17. compiled storyboard prompt includes all required beats', async () => {
    const result = await bootstrapB49R2();
    const prompt = result.compiledPrompt;
    expect(prompt).toContain('DISCOVERY');
    expect(prompt).toContain('SNAP_BACK');
    expect(prompt).toContain('16 DISTINCT sequential panels');
  });

  it('18. all five authority IDs are attached/resolved', async () => {
    const result = await bootstrapB49R2();
    for (const expected of ENTRY_002_PRE_STORYBOARD_FOUNDER_APPROVALS) {
      expect(result.storyboardBrief.authorityIds).toContain(expected.authorityId);
      expect(result.finalCinematicStoryboard?.authorityIds).toContain(expected.authorityId);
    }
  });

  it('19. character firewall is included in prompt', async () => {
    const result = await bootstrapB49R2();
    expect(result.compiledPrompt).toContain('CHARACTER FIREWALL');
    expect(result.storyboardBrief.characterFirewall.ndx).toBeTruthy();
  });

  it('20. NDX short lime nails rule is included', async () => {
    const result = await bootstrapB49R2();
    expect(result.storyboardBrief.characterFirewall.ndxNails).toBe('SHORT_LIME_GREEN');
    expect(result.compiledPrompt.toLowerCase()).toContain('lime');
  });

  it('21. subject French-tip rule is included', async () => {
    const result = await bootstrapB49R2();
    expect(result.storyboardBrief.characterFirewall.subjectNails).toBe('FRENCH_TIPS');
    expect(result.compiledPrompt.toLowerCase()).toContain('french');
  });

  it('22. full-body phone content rule is included', async () => {
    const result = await bootstrapB49R2();
    expect(result.storyboardBrief.phoneContentRules.framing).toBe('FULL_BODY_OUTFIT_LED');
  });

  it('23. pose variation rule is included', async () => {
    const result = await bootstrapB49R2();
    expect(result.storyboardBrief.phoneContentRules.poseVariation).toBe(true);
  });

  it('24. 2016 old-Instagram rule is included', async () => {
    const result = await bootstrapB49R2();
    const text = result.panelManifest.map((p) => p.description + p.phoneState).join(' ').toLowerCase();
    expect(text).toMatch(/2016|instagram|ig ui|old ig/);
  });

  it('25. memory extraction beat is included', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(manifest.some((p) => p.beatId === 'MEMORY_LIFTS')).toBe(true);
  });

  it('26. contradiction beat is included', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(
      manifest.some((p) => p.beatId === 'CONTRADICTION_STITCH' || p.beatId === 'FULL_CONTRADICTION'),
    ).toBe(true);
  });

  it('27. mandatory interjection is exact', async () => {
    const result = await bootstrapB49R2();
    expect(result.storyboardBrief.mandatoryInterjection).toBe(
      'THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.',
    );
    expect(result.compiledPrompt).toContain('THE CLOTHES NEVER GOT AN APOLOGY. JUST A REBRAND.');
  });

  it('28. snap-back beat exists', () => {
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    expect(manifest.some((p) => p.beatId === 'SNAP_BACK')).toBe(true);
  });

  it('29. Entry 003 remains absent', async () => {
    const result = await bootstrapB49R2();
    const text = result.compiledPrompt.toLowerCase();
    expect(text).not.toContain('entry 003');
    expect(text).not.toContain('entry-003');
  });

  it('30. founder review activates only after single-artifact QA PASS', async () => {
    const result = await bootstrapB49R2();
    expect(hasValidFinalCinematicStoryboard()).toBe(true);
    expect(result.finalStoryboardReviewGate.active).toBe(true);
    expect(result.productionEligibility.founderStoryboardApproval).toBe('ACTIVE');
    expect(result.nextAction).toBe(ENTRY_002_FOUNDER_REVIEW_FINAL_STORYBOARD_ACTION);
  });

  it('31. keyframes remain blocked', async () => {
    const result = await bootstrapB49R2();
    expect(result.keyframes).toBe('BLOCKED_PENDING_FINAL_STORYBOARD_APPROVAL');
  });

  it('32. video remains blocked', async () => {
    const result = await bootstrapB49R2();
    expect(result.video).toBe('BLOCKED');
  });

  it('33. storyboard 001 remains failed historical attempt', async () => {
    await bootstrapB49R2();
    const historical = getStoryboard001HistoricalRecord();
    expect(historical?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_001_ID);
    expect(historical?.status).toBe('FAILED_STORYBOARD_STRUCTURE');
    expect(historical?.failureReason).toBe(B49_FALSE_POSITIVE_FAILURE_REASON);
    expect(historical?.referenceOnly).toBe(true);
  });

  it('34. storyboard 002 remains failed historical attempt', async () => {
    await bootstrapB49R2();
    const historical = getStoryboard002HistoricalRecord();
    expect(historical?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_002_ID);
    expect(historical?.status).toBe('FAILED_STORYBOARD_RENDER_MODE');
    expect(historical?.failureReason).toBe(B49R2_PANEL_FANOUT_FAILURE_REASON);
    expect(historical?.referenceOnly).toBe(true);
  });

  it('35. storyboard 003 becomes current review candidate only after successful QA', async () => {
    const result = await bootstrapB49R2();
    expect(result.finalCinematicStoryboard?.storyboardId).toBe(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_003_ID);
    expect(result.finalCinematicStoryboard?.status).toBe('AWAITING_FOUNDER_APPROVAL');
    expect(result.finalCinematicStoryboard?.structuralQaStatus).toBe('PASS');
    expect(result.finalCinematicStoryboard?.renderModeQaStatus).toBe('PASS');
    const stripPath = path.join(
      process.cwd(),
      'public',
      buildEntry002FinalCinematicStoryboardPublicStripPath(ENTRY_002_FINAL_CINEMATIC_STORYBOARD_STRIP_003_ID).replace(/^\//, ''),
    );
    await expect(fs.access(stripPath)).resolves.toBeUndefined();
  });

  it('36. telemetry uses STORYBOARD_RENDERED not PANELS_GENERATED', async () => {
    const result = await bootstrapB49R2();
    expect(result.telemetryNote).toContain('STORYBOARD_RENDERED=1');
    expect(result.telemetryNote).not.toContain('PANELS_GENERATED');
  });

  it('37. keyframes eligible only after founder LOVE_IT', async () => {
    await bootstrapB49R2();
    recordFinalStoryboardFounderJudgment({ founderJudgment: 'LOVE_IT' });
    const after = await bootstrapB49R2();
    expect(after.keyframes).toBe('READY_FOR_GENERATION');
    expect(isKeyframeEligibleFromFinalStoryboard('LOVE_IT')).toBe(true);
  });

  it('38. invalid storyboard keeps founder review inactive', async () => {
    const b48 = await bootstrapB48();
    expect(b48.nextAction).toBe(ENTRY_002_FINAL_STORYBOARD_NEXT_ACTION);
    const next = resolveEntry002NextAction({
      preStoryboardApproval: {
        allAuthoritiesLoveIt: true,
        loveItCount: 5,
        unreviewedCount: 0,
        promisingCount: 0,
        notForMeCount: 0,
        approvedAuthorityIds: [],
      },
      storyboardGenerated: true,
      storyboardValid: false,
      structuralQaPassed: false,
    });
    expect(next).toBe(ENTRY_002_REPAIR_FINAL_STORYBOARD_ACTION);
  });

  it('39. cinematic sequence remains non-canon reference', async () => {
    const result = await bootstrapB49R2();
    expect(result.cinematicSequence.sequenceId).toBe(ENTRY_002_CINEMATIC_SEQUENCE_001);
    expect(result.cinematicSequence.referenceOnly).toBe(true);
  });

  it('40. compiled prompt helper includes manifest beats', () => {
    const treatment = buildEntry002ReelTreatmentAuthority();
    const authorities = attachPreStoryboardAuthorityRecords(
      applyStoredPreStoryboardJudgments(
        attachEntry002PreStoryboardFounderAssets(buildEntry002PreStoryboardVisualAuthorities()),
      ),
    );
    const pack = buildEntry002PreStoryboardVisualAuthorityPack(authorities);
    const brief = compileEntry002FinalCinematicStoryboardBrief({ treatment, preStoryboardAuthorityPack: pack });
    const manifest = compileEntry002FinalCinematicStoryboardPanelManifest();
    const prompt = compileSingleMultiPanelStoryboardPrompt({ manifest, brief });
    expect(prompt).toContain('ONE SINGLE professional cinematic storyboard sheet');
    expect(prompt.split('Panel ').length).toBeGreaterThan(16);
  });

  it('41. continuity domain QA passes on manifest', async () => {
    const result = await bootstrapB49R2();
    expect(result.continuityDomainQA.passed).toBe(true);
    expect(runStoryboardContinuityDomainQA(result.panelManifest).passed).toBe(true);
  });

  it('42. no independent panel lineage receipts at storyboard stage', async () => {
    await bootstrapB49R2();
    const receipts = listGenerationReceiptsForEntry('entry-002');
    const panelReceipts = receipts.filter((r) => r.assetId.includes('PANEL'));
    expect(panelReceipts.length).toBe(0);
  });
});
