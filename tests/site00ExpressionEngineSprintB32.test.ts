import { describe, it, expect, beforeEach } from 'vitest';
import { bootstrapB32 } from '../api/_lib/site00ExpressionEngine/expressionEngineService.js';
import {
  buildChapterCoverAnnotationVariationSystem,
  annotationFamilyKey,
  combinationsAreIdentical,
  isCircleUnderlineHabit,
} from '../api/_lib/site00ExpressionEngine/chapterCoverAnnotationVariationSystem.js';
import {
  buildEntry001CoverAnnotationPlan,
  buildEntry002CoverAnnotationPlan,
  buildEntry003AnnotationExampleDirection,
  getChapter01CoverAnnotationPlans,
  selectChapterCoverAnnotations,
} from '../api/_lib/site00ExpressionEngine/chapterCoverAnnotationPlans.js';
import {
  listCoverAnnotationHistoryForChapter,
  recordCoverAnnotationHistory,
  resetCoverAnnotationHistoryStore,
} from '../api/_lib/site00ExpressionEngine/coverAnnotationHistoryStore.js';
import {
  buildClutteredAnnotationPlanFixture,
  buildDuplicateAnnotationPlanFixture,
  runCoverAnnotationVariationQA,
} from '../api/_lib/site00ExpressionEngine/coverAnnotationVariationQA.js';
import { CHAPTER_01_ID } from '../api/_lib/site00ExpressionEngine/chapter01Canon.js';
import { resetChapterStore } from '../api/_lib/site00ExpressionEngine/chapterStore.js';
import { resetExpressionEntryStore } from '../api/_lib/site00ExpressionEngine/entryStore.js';
import { resetExpressionEngineMemoryStore } from '../api/_lib/site00ExpressionEngine/projectScope.js';

process.env.EXPRESSION_ENGINE_MEMORY_STORE = '1';

describe('Expression Engine Sprint B3.2 — Chapter Cover Annotation Variation', () => {
  beforeEach(() => {
    resetExpressionEntryStore();
    resetExpressionEngineMemoryStore();
    resetChapterStore();
    resetCoverAnnotationHistoryStore();
  });

  it('ChapterCoverAnnotationVariationSystem is locked and all-chapters scoped', () => {
    const system = buildChapterCoverAnnotationVariationSystem();
    expect(system.status).toBe('LOCKED');
    expect(system.scope).toBe('ALL_CHAPTERS');
    expect(system.maxAnnotationsPerCover).toBe(2);
    expect(system.allowedMarkTypes.length).toBe(10);
  });

  it('Entry 001 uses circle + underline on WE (accusatory)', () => {
    const plan = buildEntry001CoverAnnotationPlan();
    expect(plan.primaryMark).toBe('CIRCLE');
    expect(plan.secondaryMark).toBe('UNDERLINE');
    expect(plan.primaryTargetWord).toBe('WE');
    expect(plan.emotionalTone).toBe('ACCUSATORY');
    expect(plan.annotationFamily).toBe('CIRCLE+UNDERLINE');
  });

  it('Entry 002 uses asterisk + upward arrow (ironic) — distinct from Entry 001', () => {
    const e1 = buildEntry001CoverAnnotationPlan();
    const e2 = buildEntry002CoverAnnotationPlan();
    expect(e2.primaryMark).toBe('ASTERISK');
    expect(e2.secondaryMark).toBe('ARROW');
    expect(e2.primaryTargetWord).toBe('NOW');
    expect(e2.secondaryTargetWord).toBe('FUN');
    expect(e2.emotionalTone).toBe('IRONIC');
    expect(combinationsAreIdentical(e1.annotationFamily, e2.annotationFamily)).toBe(false);
    expect(e2.repetitionHistory).toContain('CIRCLE+UNDERLINE');
  });

  it('adjacent entries do not share exact annotation combination', () => {
    const plans = getChapter01CoverAnnotationPlans();
    expect(plans.length).toBe(2);
    expect(plans[0].annotationFamily).not.toBe(plans[1].annotationFamily);
  });

  it('selectChapterCoverAnnotations avoids immediate prior combination', () => {
    const e1 = buildEntry001CoverAnnotationPlan();
    recordCoverAnnotationHistory(e1, 1);
    recordCoverAnnotationHistory(buildEntry002CoverAnnotationPlan(), 2);

    const selected = selectChapterCoverAnnotations({
      chapterId: CHAPTER_01_ID,
      entryId: 'entry-003',
      headlineText: 'THEY NEVER SAID SORRY.',
      entryNumber: 3,
      priorEntryAnnotations: getChapter01CoverAnnotationPlans(),
    });

    expect(selected.annotationFamily).not.toBe('ASTERISK+ARROW');
    expect(selected.primaryMark).not.toBe('ASTERISK');
    expect(selected.blockedDueToRecentUse).toBe(false);
  });

  it('annotation history persists chapter entry records', async () => {
    const b32 = await bootstrapB32();
    expect(b32.annotationHistory.length).toBe(2);
    expect(b32.annotationHistory[0].entryId).toBe('entry-001');
    expect(b32.annotationHistory[1].entryId).toBe('entry-002');
    expect(listCoverAnnotationHistoryForChapter(CHAPTER_01_ID).length).toBe(2);
  });

  it('runCoverAnnotationVariationQA passes for Entry 001 and 002', async () => {
    const b32 = await bootstrapB32();
    expect(b32.variationQA.every((q) => q.passed)).toBe(true);
    expect(b32.chapter01RepetitionStatus).toBe('DISTINCT_ADJACENT_ENTRIES');
  });

  it('blocks identical annotation pattern back-to-back', () => {
    const e1 = buildEntry001CoverAnnotationPlan();
    const duplicate = buildDuplicateAnnotationPlanFixture();
    const qa = runCoverAnnotationVariationQA({
      plan: duplicate,
      entryNumber: 2,
      priorPlan: e1,
    });
    expect(qa.passed).toBe(false);
    expect(qa.blockers.some((b) => b.includes('back-to-back') || b.includes('identical'))).toBe(true);
  });

  it('blocks too many annotation marks', () => {
    const cluttered = buildClutteredAnnotationPlanFixture();
    const qa = runCoverAnnotationVariationQA({
      plan: cluttered,
      entryNumber: 3,
      priorPlan: buildEntry002CoverAnnotationPlan(),
    });
    expect(qa.blockers.some((b) => b.includes('too many'))).toBe(true);
  });

  it('detects circle/underline habit repetition', () => {
    expect(isCircleUnderlineHabit('CIRCLE+UNDERLINE')).toBe(true);
    expect(isCircleUnderlineHabit('ASTERISK+ARROW')).toBe(false);
  });

  it('Entry 003 example direction is direction-only not canon', () => {
    const ex = buildEntry003AnnotationExampleDirection();
    expect(ex.note).toBe('DIRECTION_ONLY_NOT_CANON');
    expect(ex.suggestedBehaviors.length).toBeGreaterThan(0);
  });

  it('annotation family key normalizes mark pairs', () => {
    expect(annotationFamilyKey('CIRCLE', 'UNDERLINE')).toBe('CIRCLE+UNDERLINE');
    expect(annotationFamilyKey('ASTERISK', 'ARROW')).toBe('ASTERISK+ARROW');
  });

  it('chapter-level constants vs entry-level variables are separated', () => {
    const system = buildChapterCoverAnnotationVariationSystem();
    expect(system.chapterLevelConstants).toContain('black-field cover environment');
    expect(system.entryLevelVariables).toContain('annotation family');
    expect(system.entryLevelVariables).toContain('annotation placement');
  });

  it('creative rule emphasizes interjection not sticker system', () => {
    const system = buildChapterCoverAnnotationVariationSystem();
    expect(system.creativeRule.toLowerCase()).toContain('interjection');
    expect(system.creativeRule.toLowerCase()).toContain('minimal');
  });

  it('bootstrap produces no assets', async () => {
    const b32 = await bootstrapB32();
    expect(b32.assetsGeneratedThisSprint).toBe(0);
  });

  it('tone mapping includes circle and asterisk guides', () => {
    const system = buildChapterCoverAnnotationVariationSystem();
    expect(system.toneMapping.CIRCLE).toContain('spotlight');
    expect(system.toneMapping.ASTERISK).toContain('side-eye');
  });
});
