/**
 * Sprint B3.2 — canonical CoverHeaderAnnotationPlan records for Chapter 01 entries.
 */

import type {
  CoverHeaderAnnotationPlan,
  Entry003AnnotationExampleDirection,
  HeadlineEmotionalTone,
} from '../../../shared/site00-expression-engine/chapterCoverAnnotationTypes.js';
import { CHAPTER_01_ID } from './chapter01Canon.js';
import {
  annotationFamilyKey,
  buildChapterCoverAnnotationVariationSystem,
} from './chapterCoverAnnotationVariationSystem.js';
import { listCoverAnnotationHistoryForChapter } from './coverAnnotationHistoryStore.js';

export function buildEntry001CoverAnnotationPlan(): CoverHeaderAnnotationPlan {
  const primaryMark = 'CIRCLE' as const;
  const secondaryMark = 'UNDERLINE' as const;
  return {
    chapterId: CHAPTER_01_ID,
    entryId: 'entry-001',
    headline: 'WHO TF IS WE?',
    annotationFamily: annotationFamilyKey(primaryMark, secondaryMark),
    primaryTargetWord: 'WE',
    secondaryTargetWord: 'WE',
    primaryMark,
    secondaryMark,
    placementNotes: 'Hand-drawn lime circle around WE; underline beneath question-ending emphasis on WE',
    emotionalTone: 'ACCUSATORY',
    repetitionHistory: [],
    allowedForChapter: true,
    blockedDueToRecentUse: false,
    founderJudgment: 'LOVE_IT',
  };
}

export function buildEntry002CoverAnnotationPlan(): CoverHeaderAnnotationPlan {
  const primaryMark = 'ASTERISK' as const;
  const secondaryMark = 'ARROW' as const;
  const prior = buildEntry001CoverAnnotationPlan();
  return {
    chapterId: CHAPTER_01_ID,
    entryId: 'entry-002',
    headline: 'OH, NOW IT WAS FUN?',
    annotationFamily: annotationFamilyKey(primaryMark, secondaryMark),
    primaryTargetWord: 'NOW',
    secondaryTargetWord: 'FUN',
    primaryMark,
    secondaryMark,
    placementNotes:
      'One lime handwritten asterisk beside NOW; upward hand-drawn arrow under FUN pointing toward FUN',
    emotionalTone: 'IRONIC',
    repetitionHistory: [prior.annotationFamily],
    allowedForChapter: true,
    blockedDueToRecentUse: false,
    founderJudgment: 'LOVE_IT',
  };
}

export function buildEntry003AnnotationExampleDirection(): Entry003AnnotationExampleDirection {
  return {
    entryId: 'entry-003-example',
    headlineExample: 'THEY SAID IT WAS OVER.',
    suggestedBehaviors: [
      ['STRIKETHROUGH', 'X_OUT'],
      ['BRACKET', 'CARET_INSERTION'],
      ['STRIKETHROUGH', 'BRACKET'],
    ],
    result: 'Visibly new annotation behavior while remaining chapter-cohesive',
    note: 'DIRECTION_ONLY_NOT_CANON',
  };
}

export function getChapter01CoverAnnotationPlans(): CoverHeaderAnnotationPlan[] {
  return [buildEntry001CoverAnnotationPlan(), buildEntry002CoverAnnotationPlan()];
}

function inferToneFromHeadline(headline: string): HeadlineEmotionalTone {
  const upper = headline.toUpperCase();
  if (/\?/.test(headline) && /TF|WHO|WHAT|WHY|HOW/.test(upper)) return 'ACCUSATORY';
  if (/NOW|FUN|ICONIC|BACK|REMEMBER/.test(upper)) return 'IRONIC';
  if (/NEVER|NOT|NO\b|WRONG|LIE/.test(upper)) return 'SKEPTICAL';
  if (/WAS|USED TO|BEFORE|THEN/.test(upper)) return 'REVISIONIST';
  if (/WHATEVER|SURE|OKAY|FINE/.test(upper)) return 'DISMISSIVE';
  return 'INCREDULOUS';
}

function pickTargetWords(headline: string): { primary: string; secondary?: string } {
  const words = headline.replace(/[?!.,]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return { primary: headline };
  const tensionWords = ['WE', 'NOW', 'FUN', 'THEY', 'NEVER', 'NOT', 'WHO', 'WHAT', 'THIS', 'THAT'];
  const primary =
    words.find((w) => tensionWords.includes(w.toUpperCase())) ?? words[Math.floor(words.length / 2)];
  const secondary = words.find((w) => w.toUpperCase() !== primary.toUpperCase() && w.length > 2);
  return { primary: primary.toUpperCase(), secondary: secondary?.toUpperCase() };
}

const TONE_MARK_PREFERENCES: Record<HeadlineEmotionalTone, Array<[string, string?]>> = {
  ACCUSATORY: [
    ['CIRCLE', 'UNDERLINE'],
    ['CIRCLE', undefined],
    ['BRACKET', 'UNDERLINE'],
  ],
  IRONIC: [
    ['ASTERISK', 'ARROW'],
    ['ASTERISK', undefined],
    ['SIDE_NOTE_MARK', 'ARROW'],
  ],
  SKEPTICAL: [
    ['STRIKETHROUGH', 'X_OUT'],
    ['X_OUT', 'STRIKETHROUGH'],
    ['CARET_INSERTION', 'STRIKETHROUGH'],
  ],
  REVISIONIST: [
    ['STRIKETHROUGH', 'BRACKET'],
    ['BRACKET', 'CARET_INSERTION'],
    ['DOUBLE_UNDERLINE', 'STRIKETHROUGH'],
  ],
  DISMISSIVE: [
    ['X_OUT', undefined],
    ['STRIKETHROUGH', undefined],
    ['SIDE_NOTE_MARK', undefined],
  ],
  INCREDULOUS: [
    ['ASTERISK', 'ARROW'],
    ['CIRCLE', 'ASTERISK'],
    ['ARROW', 'ASTERISK'],
  ],
};

export function selectChapterCoverAnnotations(input: {
  chapterId: string;
  entryId: string;
  headlineText: string;
  priorEntryAnnotations?: CoverHeaderAnnotationPlan[];
  entryNumber?: number;
}): CoverHeaderAnnotationPlan {
  const system = buildChapterCoverAnnotationVariationSystem();
  const priorFromStore =
    input.entryNumber != null
      ? listCoverAnnotationHistoryForChapter(input.chapterId).filter(
          (h) => h.entryNumber < input.entryNumber!,
        )
      : [];
  const priorPlans =
    input.priorEntryAnnotations ??
    priorFromStore.map((h) => ({
      chapterId: h.chapterId,
      entryId: h.entryId,
      headline: h.headline,
      annotationFamily: h.annotationFamily,
      primaryTargetWord: h.targetedWords[0] ?? '',
      secondaryTargetWord: h.targetedWords[1],
      primaryMark: h.primaryMark,
      secondaryMark: h.secondaryMark,
      placementNotes: '',
      emotionalTone: inferToneFromHeadline(h.headline),
      repetitionHistory: [],
      allowedForChapter: true,
      blockedDueToRecentUse: false,
    }));

  const immediatePrior = priorPlans[priorPlans.length - 1];
  const tone = inferToneFromHeadline(input.headlineText);
  const targets = pickTargetWords(input.headlineText);
  const preferences = TONE_MARK_PREFERENCES[tone];
  const avoidedPatterns: string[] = [];

  let selectedPrimary: CoverHeaderAnnotationPlan['primaryMark'] = 'ASTERISK';
  let selectedSecondary: CoverHeaderAnnotationPlan['secondaryMark'];
  let blockedDueToRecentUse = false;

  for (const [primary, secondary] of preferences) {
    const family = annotationFamilyKey(
      primary as CoverHeaderAnnotationPlan['primaryMark'],
      secondary as CoverHeaderAnnotationPlan['secondaryMark'] | undefined,
    );
    if (immediatePrior && family === immediatePrior.annotationFamily) {
      avoidedPatterns.push(family);
      continue;
    }
    if (immediatePrior && immediatePrior.primaryMark === primary) {
      avoidedPatterns.push(`primary:${primary}`);
      continue;
    }
    selectedPrimary = primary as CoverHeaderAnnotationPlan['primaryMark'];
    selectedSecondary = secondary as CoverHeaderAnnotationPlan['secondaryMark'] | undefined;
    break;
  }

  if (avoidedPatterns.length > 0 && !selectedSecondary && selectedPrimary === immediatePrior?.primaryMark) {
    blockedDueToRecentUse = true;
    selectedPrimary = 'BRACKET';
    selectedSecondary = 'CARET_INSERTION';
  }

  const markCount = selectedSecondary ? 2 : 1;
  if (markCount > system.maxAnnotationsPerCover) {
    selectedSecondary = undefined;
  }

  const family = annotationFamilyKey(selectedPrimary, selectedSecondary);
  const repetitionHistory = priorPlans.map((p) => p.annotationFamily);

  return {
    chapterId: input.chapterId,
    entryId: input.entryId,
    headline: input.headlineText,
    annotationFamily: family,
    primaryTargetWord: targets.primary,
    secondaryTargetWord: targets.secondary,
    primaryMark: selectedPrimary,
    secondaryMark: selectedSecondary,
    placementNotes: `Auto-selected for ${tone.toLowerCase()} tone; max ${system.maxAnnotationsPerCover} marks`,
    emotionalTone: tone,
    repetitionHistory,
    allowedForChapter: !blockedDueToRecentUse,
    blockedDueToRecentUse,
    founderJudgment: null,
  };
}
