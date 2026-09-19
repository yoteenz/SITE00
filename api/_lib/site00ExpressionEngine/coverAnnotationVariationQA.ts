/**
 * Sprint B3.2 — cover annotation variation QA gate.
 */

import type {
  CoverAnnotationVariationQACheck,
  CoverAnnotationVariationQAResult,
  CoverHeaderAnnotationPlan,
} from '../../../shared/site00-expression-engine/chapterCoverAnnotationTypes.js';
import { buildEntry001CoverAnnotationPlan } from './chapterCoverAnnotationPlans.js';
import {
  buildChapterCoverAnnotationVariationSystem,
  combinationsAreIdentical,
  isCircleUnderlineHabit,
  primaryMarkRepeatedBackToBack,
} from './chapterCoverAnnotationVariationSystem.js';
import { getPriorEntryAnnotationHistory } from './coverAnnotationHistoryStore.js';
import { validateCoverAgainstGrammar } from './chapterCoverCohesionQA.js';
import {
  buildEntry001CoverPresentationSpec,
  buildEntry002FounderCoverPresentationSpec,
} from './chapterCoverPresentationGrammar.js';

function markCount(plan: CoverHeaderAnnotationPlan): number {
  const fromFamily = plan.annotationFamily.split('+').filter(Boolean).length;
  const fromFields = plan.secondaryMark ? 2 : 1;
  return Math.max(fromFamily, fromFields);
}

function targetsAreMeaningful(plan: CoverHeaderAnnotationPlan): boolean {
  if (!plan.primaryTargetWord || plan.primaryTargetWord.length < 1) return false;
  const headlineUpper = plan.headline.toUpperCase();
  return headlineUpper.includes(plan.primaryTargetWord.toUpperCase());
}

function toneMatchesMarks(plan: CoverHeaderAnnotationPlan): boolean {
  const toneMarkFit: Record<
    CoverHeaderAnnotationPlan['emotionalTone'],
    CoverHeaderAnnotationPlan['primaryMark'][]
  > = {
    ACCUSATORY: ['CIRCLE', 'UNDERLINE', 'BRACKET', 'DOUBLE_UNDERLINE'],
    IRONIC: ['ASTERISK', 'ARROW', 'SIDE_NOTE_MARK'],
    SKEPTICAL: ['STRIKETHROUGH', 'X_OUT', 'CARET_INSERTION'],
    REVISIONIST: ['STRIKETHROUGH', 'BRACKET', 'CARET_INSERTION', 'DOUBLE_UNDERLINE'],
    DISMISSIVE: ['X_OUT', 'STRIKETHROUGH', 'SIDE_NOTE_MARK'],
    INCREDULOUS: ['ASTERISK', 'ARROW', 'CIRCLE'],
  };

  return toneMarkFit[plan.emotionalTone].includes(plan.primaryMark);
}

export function runCoverAnnotationVariationQA(input: {
  plan: CoverHeaderAnnotationPlan;
  entryNumber: number;
  priorPlan?: CoverHeaderAnnotationPlan | null;
}): CoverAnnotationVariationQAResult {
  const { plan, entryNumber } = input;
  const system = buildChapterCoverAnnotationVariationSystem();
  const prior =
    input.priorPlan ??
    (() => {
      const hist = getPriorEntryAnnotationHistory(plan.chapterId, entryNumber);
      if (!hist) return null;
      return {
        chapterId: hist.chapterId,
        entryId: hist.entryId,
        headline: hist.headline,
        annotationFamily: hist.annotationFamily,
        primaryTargetWord: hist.targetedWords[0] ?? '',
        secondaryTargetWord: hist.targetedWords[1],
        primaryMark: hist.primaryMark,
        secondaryMark: hist.secondaryMark,
        placementNotes: '',
        emotionalTone: 'ACCUSATORY' as const,
        repetitionHistory: [],
        allowedForChapter: true,
        blockedDueToRecentUse: false,
      } satisfies CoverHeaderAnnotationPlan;
    })();

  const checks: CoverAnnotationVariationQACheck[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  const coverSpec =
    plan.entryId === 'entry-001'
      ? buildEntry001CoverPresentationSpec()
      : plan.entryId === 'entry-002'
        ? buildEntry002FounderCoverPresentationSpec()
        : null;

  const cohesionPassed = coverSpec ? validateCoverAgainstGrammar(coverSpec).passed : true;
  checks.push({
    check: 'chapter cohesion preserved',
    passed: cohesionPassed,
    severity: cohesionPassed ? 'PASS' : 'BLOCK',
  });
  if (!cohesionPassed) blockers.push('chapter cohesion lost');

  const distinctFromPrior =
    !prior || !combinationsAreIdentical(plan.annotationFamily, prior.annotationFamily);
  checks.push({
    check: 'distinct from immediately previous entry',
    passed: distinctFromPrior,
    severity: distinctFromPrior ? 'PASS' : 'BLOCK',
    detail: prior ? `prior=${prior.annotationFamily} current=${plan.annotationFamily}` : 'first entry',
  });
  if (!distinctFromPrior) blockers.push('identical annotation pattern reused back-to-back');

  const countOk = markCount(plan) <= system.maxAnnotationsPerCover;
  checks.push({
    check: 'annotation count restrained',
    passed: countOk,
    severity: countOk ? 'PASS' : 'BLOCK',
    detail: `${markCount(plan)} marks (max ${system.maxAnnotationsPerCover})`,
  });
  if (!countOk) blockers.push('too many annotation marks');

  const meaningfulTargets = targetsAreMeaningful(plan);
  checks.push({
    check: 'target words meaningful',
    passed: meaningfulTargets,
    severity: meaningfulTargets ? 'PASS' : 'BLOCK',
  });
  if (!meaningfulTargets) blockers.push('decorative but meaningless annotation targets');

  const toneOk = toneMatchesMarks(plan);
  checks.push({
    check: 'annotation style matches entry tone',
    passed: toneOk,
    severity: toneOk ? 'PASS' : 'WARN',
  });
  if (!toneOk) warnings.push('annotation tone mapping soft mismatch');

  const notTemplated = !plan.blockedDueToRecentUse && plan.allowedForChapter;
  checks.push({
    check: 'avoids templated repetition',
    passed: notTemplated,
    severity: notTemplated ? 'PASS' : 'BLOCK',
  });
  if (!notTemplated) blockers.push('blocked due to recent annotation reuse');

  const noClutter = markCount(plan) <= 2;
  checks.push({
    check: 'avoids annotation clutter',
    passed: noClutter,
    severity: noClutter ? 'PASS' : 'BLOCK',
  });

  const noCircleUnderlineHabit =
    !(prior && isCircleUnderlineHabit(prior.annotationFamily) && isCircleUnderlineHabit(plan.annotationFamily));
  checks.push({
    check: 'avoids repeated circle/underline habit',
    passed: noCircleUnderlineHabit,
    severity: noCircleUnderlineHabit ? 'PASS' : 'BLOCK',
  });
  if (!noCircleUnderlineHabit) blockers.push('repeated circle/underline habit');

  if (prior && primaryMarkRepeatedBackToBack(prior.primaryMark, plan.primaryMark)) {
    checks.push({
      check: 'primary mark not repeated back-to-back',
      passed: false,
      severity: 'BLOCK',
    });
    blockers.push('primary annotation mark reused on adjacent entry');
  } else {
    checks.push({
      check: 'primary mark not repeated back-to-back',
      passed: true,
      severity: 'PASS',
    });
  }

  checks.push({
    check: 'annotations feel editorial not sticker-system',
    passed: system.allowedMarkTypes.includes(plan.primaryMark),
    severity: 'PASS',
  });

  return {
    chapterId: plan.chapterId,
    entryId: plan.entryId,
    passed: blockers.length === 0,
    blocking: blockers.length > 0,
    checks,
    blockers,
    warnings,
  };
}

/** Fixture: back-to-back duplicate annotation pattern for QA tests. */
export function buildDuplicateAnnotationPlanFixture(): CoverHeaderAnnotationPlan {
  const e1 = buildEntry001CoverAnnotationPlan();
  return {
    ...e1,
    entryId: 'entry-002-duplicate-fixture',
    headline: 'COPY PASTE HEADLINE?',
    blockedDueToRecentUse: true,
    allowedForChapter: false,
  };
}

/** Fixture: overloaded headline annotations. */
export function buildClutteredAnnotationPlanFixture(): CoverHeaderAnnotationPlan {
  return {
    ...buildEntry001CoverAnnotationPlan(),
    entryId: 'entry-clutter-fixture',
    primaryMark: 'CIRCLE',
    secondaryMark: 'UNDERLINE',
    annotationFamily: 'CIRCLE+UNDERLINE+ASTERISK+ARROW',
    placementNotes: 'intentionally invalid for QA test',
  };
}
