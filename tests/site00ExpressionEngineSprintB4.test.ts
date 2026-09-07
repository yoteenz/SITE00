import { describe, it, expect, beforeEach } from 'vitest';
import {
  bootstrapB4,
  downstreamFormatsOnHold,
  founderGateBlocksProgression,
  buildEntry002FounderReviewGates,
  buildEntry002ReelPhoneRole,
  buildEntry002ReelFashionDirection,
  buildEntry002ReelEditSuiteBehavior,
} from '../api/_lib/site00ExpressionEngine/entry002ReelProduction.js';
import {
  buildEntry002ReelArgumentArc,
  buildEntry002ReelShotPlan,
  ENTRY_002_REEL_ID,
} from '../api/_lib/site00ExpressionEngine/entry002ReelShotPlan.js';
import { buildEntry002ReelAudioPlan, getEntry002ReelVoOption } from '../api/_lib/site00ExpressionEngine/entry002ReelAudioPlan.js';
import { compileEntry002ReelKeyframes } from '../api/_lib/site00ExpressionEngine/entry002ReelKeyframes.js';
import { compileEntry002ReelProviderRouting } from '../api/_lib/site00ExpressionEngine/entry002ReelProviderRouting.js';
import { runEntry002ReelQA, cinematicShotPassesWithoutCoverAnnotations } from '../api/_lib/site00ExpressionEngine/entry002ReelQA.js';
import {
  listGenerationReceiptsForEntry,
  orphanAssetCannotReachProductionReady,
  resetLineageStore,
} from '../api/_lib/site00ExpressionEngine/lineageRegistration.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';
import { resetCoverAnnotationHistoryStore } from '../api/_lib/site00ExpressionEngine/coverAnnotationHistoryStore.js';
import { buildEntry002ChapterMapping } from '../api/_lib/site00ExpressionEngine/chapterEntryMappings.js';
import { validateEntryAgainstChapterGrammar } from '../api/_lib/site00ExpressionEngine/chapterGrammarValidation.js';
import { buildChapter01ArgumentGrammar } from '../api/_lib/site00ExpressionEngine/chapter01Canon.js';
import { compileEntry002LockedEntry } from '../api/_lib/site00ExpressionEngine/entry002Blueprint.js';
import {
  buildReelAnnotationUsageContract,
  entry003AnnotationsPreAssignedInB4,
  getLockedEntry002CoverAnnotationPlan,
  runCoverAnnotationQAForSurface,
} from '../api/_lib/site00ExpressionEngine/entry002ReelAnnotationUsage.js';
import { buildEntry002CoverAnnotationPlan } from '../api/_lib/site00ExpressionEngine/chapterCoverAnnotationPlans.js';
import { CHAPTER_COVER_ANNOTATION_SYSTEM_ID } from '../api/_lib/site00ExpressionEngine/chapterCoverAnnotationVariationSystem.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B4 — Entry 002 REEL Production', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetLineageStore();
    resetChapterStore();
    resetCoverAnnotationHistoryStore();
  });

  it('1. Entry 002 Reel maps to Chapter 01 grammar', async () => {
    const b4 = await bootstrapB4();
    expect(b4.qa.chapterGrammar.valid).toBe(true);
    expect(b4.qa.chapterGrammar.chapterId).toBe('ndxbook-chapter-01');
  });

  it('2. subject remains 2016 IG BADDIE FASHION', async () => {
    const b4 = await bootstrapB4();
    expect(b4.fashionDirection.subject).toBe('2016 IG BADDIE FASHION');
    expect(b4.shotPlan.some((s) => s.title.includes('BADDIE FASHION'))).toBe(true);
  });

  it('3. phone is evidence device not comment feed', () => {
    const phone = buildEntry002ReelPhoneRole();
    expect(phone.notAllowed.some((n) => n.includes('COMMENT'))).toBe(true);
    expect(phone.evidenceBehavior.length).toBeGreaterThan(0);
  });

  it('4. edit suite remains world reframing mechanism', () => {
    const suite = buildEntry002ReelEditSuiteBehavior();
    expect(suite.forbiddenElements).toContain('Adobe UI clone');
    expect(suite.allowedElements).toContain('physical timeline strips');
  });

  it('5. cover does not become reel template', async () => {
    const b4 = await bootstrapB4();
    expect(b4.qa.coverNotTemplate.passed).toBe(true);
    expect(b4.shotPlan[0].description.toLowerCase()).toContain('not edit suite establishing');
  });

  it('6. TV / broadcast grammar blocked in reel plan', async () => {
    const b4 = await bootstrapB4();
    expect(b4.qa.entry001Differentiation.passed).toBe(true);
    const planText = b4.shotPlan.map((s) => s.description).join(' ').toLowerCase();
    expect(planText).not.toContain('television');
  });

  it('7. audio required before video completion', async () => {
    const b4 = await bootstrapB4();
    expect(b4.audioPlan.status).toBe('COMPLETE');
    expect(b4.qa.audioBeforeVideo.passed).toBe(true);
    expect(b4.videoDispatched).toBe(false);
  });

  it('8. staged keyframe gate required', async () => {
    const b4 = await bootstrapB4();
    expect(b4.keyframes.length).toBe(3);
    expect(b4.keyframes.map((k) => k.role)).toEqual(['START', 'MID', 'END']);
    const gates = b4.founderGates;
    expect(gates.find((g) => g.gateId === 'GATE_1_KEYFRAME')?.founderJudgment).toBe('UNREVIEWED');
    expect(founderGateBlocksProgression(gates)).toBe(true);
  });

  it('9. no orphan asset allowed', async () => {
    const b4 = await bootstrapB4();
    for (const kf of b4.keyframes) {
      expect(orphanAssetCannotReachProductionReady(kf.receipt)).toBe(false);
      expect(kf.receipt.entryId).toBe('entry-002');
      expect(kf.receipt.assetId).toBeTruthy();
    }
  });

  it('10. no LEGACY_UNTRACKED', async () => {
    const b4 = await bootstrapB4();
    expect(b4.keyframes.every((k) => k.receipt.trackingState === 'TRACKED')).toBe(true);
    expect(b4.telemetry.lineageCompleteness).toBe('COMPLETE');
  });

  it('11. downstream formats remain unproduced', async () => {
    const b4 = await bootstrapB4();
    expect(b4.downstreamHold.every((d) => d.produced === false)).toBe(true);
    expect(b4.downstreamHold.every((d) => d.status === 'UNLOCKED_PENDING_PRODUCTION')).toBe(true);
    const receipts = listGenerationReceiptsForEntry('entry-002');
    expect(receipts.every((r) => r.format === 'REEL' || r.format === 'COVER')).toBe(true);
    expect(receipts.filter((r) => r.format === 'CAROUSEL').length).toBe(0);
  });

  it('12. founder gate blocks progression without LOVE_IT', () => {
    const gates = buildEntry002FounderReviewGates();
    expect(founderGateBlocksProgression(gates)).toBe(true);
    const approved = gates.map((g) =>
      g.gateId === 'GATE_1_KEYFRAME' ? { ...g, founderJudgment: 'LOVE_IT' as const } : g,
    );
    expect(founderGateBlocksProgression(approved)).toBe(false);
  });

  it('13. annotation variation respected — reel is not cover annotations in motion', async () => {
    const b4 = await bootstrapB4();
    expect(b4.qa.reelAnnotationOveruse.passed).toBe(true);
    expect(b4.qa.annotationVariation).toBeNull();
    expect(cinematicShotPassesWithoutCoverAnnotations()).toBe(true);
    expect(runCoverAnnotationQAForSurface({ surface: 'REEL_CINEMATIC' })).toBeNull();
  });

  it('B4 patch consumes locked B3.2 annotation system without reimplementing', async () => {
    const b4 = await bootstrapB4();
    expect(b4.annotationUsage.rule.systemId).toBe(CHAPTER_COVER_ANNOTATION_SYSTEM_ID);
    expect(b4.annotationUsage.rule.doNotReimplement).toBe(true);
    expect(b4.annotationUsage.entry003PreAssigned).toBe(false);
    expect(entry003AnnotationsPreAssignedInB4()).toBe(false);
  });

  it('Entry 002 cover annotation plan remains frozen ASTERISK+ARROW', () => {
    const locked = getLockedEntry002CoverAnnotationPlan();
    const canonical = buildEntry002CoverAnnotationPlan();
    expect(locked.annotationFamily).toBe('ASTERISK+ARROW');
    expect(locked).toEqual(canonical);
    expect(locked.primaryMark).toBe('ASTERISK');
    expect(locked.secondaryMark).toBe('ARROW');
  });

  it('title card policy allows omit/simplify — cover remains primary authority', () => {
    const contract = buildReelAnnotationUsageContract();
    expect(contract.titleCardPolicy.mayOmit).toBe(true);
    expect(contract.titleCardPolicy.maySimplify).toBe(true);
    expect(contract.titleCardPolicy.coverRemainsPrimaryAuthority).toBe(true);
  });

  it('annotation QA runs only for cover surface not cinematic shots', async () => {
    const b4 = await bootstrapB4();
    expect(b4.qa.annotationSurfaceQA).not.toBeNull();
    expect(b4.qa.annotationSurfaceQA?.passed).toBe(true);
    expect(b4.annotationUsage.annotationQASecondaryForReel).toBe(true);
  });

  it('14. existing Expression Engine compatibility — chapter mapping validates', () => {
    const entry = compileEntry002LockedEntry();
    const grammar = buildChapter01ArgumentGrammar();
    const validation = validateEntryAgainstChapterGrammar({
      entry,
      mapping: buildEntry002ChapterMapping(),
      grammar,
      allMappings: [buildEntry002ChapterMapping()],
    });
    expect(validation.valid).toBe(true);
  });

  it('argument arc follows reel rhythm CLAIM→RECEIPT→CONTRADICTION→INTERJECTION→SYNTHESIS', () => {
    expect(buildEntry002ReelArgumentArc()).toEqual([
      'CLAIM',
      'RECEIPT',
      'CONTRADICTION',
      'INTERJECTION',
      'SYNTHESIS',
    ]);
  });

  it('provider routing autoDispatch false for all reel tasks', () => {
    const routes = compileEntry002ReelProviderRouting();
    expect(routes.every((r) => r.autoDispatch === false)).toBe(true);
    expect(routes.some((r) => r.taskClass === 'VIDEO_START_END_FRAME')).toBe(true);
    expect(routes.some((r) => r.taskClass === 'TTS_DIALOGUE')).toBe(true);
  });

  it('VO script option compiled', () => {
    const vo = getEntry002ReelVoOption();
    expect(vo.toLowerCase()).toContain('tacky');
    expect(vo.toLowerCase()).toContain('the edit did');
  });

  it('reel id and runtime target set', async () => {
    const b4 = await bootstrapB4();
    expect(b4.reelId).toBe(ENTRY_002_REEL_ID);
    expect(b4.runtimeTargetSec.min).toBeGreaterThanOrEqual(28);
  });

  it('downstream hold helper lists all non-reel formats', () => {
    const hold = downstreamFormatsOnHold();
    expect(hold.map((h) => h.format)).toEqual([
      'CAROUSEL',
      'STORY',
      'CTA_STORY',
      'HIGHLIGHT',
      'TIKTOK',
      'X',
    ]);
  });

  it('QA passes for compiled keyframes without video dispatch', () => {
    const audio = buildEntry002ReelAudioPlan();
    const kf = compileEntry002ReelKeyframes();
    const qa = runEntry002ReelQA({ keyframes: kf, audioPlan: audio, videoDispatched: false });
    expect(qa.passed).toBe(true);
  });
});
