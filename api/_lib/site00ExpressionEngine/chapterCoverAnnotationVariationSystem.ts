/**
 * Sprint B3.2 — ChapterCoverAnnotationVariationSystem ruleset.
 */

import type {
  AnnotationMarkType,
  ChapterCoverAnnotationVariationSystem,
} from '../../../shared/site00-expression-engine/chapterCoverAnnotationTypes.js';

const NOW = '2026-09-07T21:00:00.000Z';

export const CHAPTER_COVER_ANNOTATION_SYSTEM_ID = 'system-chapter-cover-annotation-variation-v1';

export const MAX_ANNOTATIONS_PER_COVER = 2;

export function buildChapterCoverAnnotationVariationSystem(): ChapterCoverAnnotationVariationSystem {
  return {
    systemId: CHAPTER_COVER_ANNOTATION_SYSTEM_ID,
    scope: 'ALL_CHAPTERS',
    status: 'LOCKED',
    corePrinciple: 'SAME COVER GRAMMAR — DIFFERENT HEADER INTERJECTION MARKS',
    maxAnnotationsPerCover: 2,
    allowedMarkTypes: [
      'CIRCLE',
      'UNDERLINE',
      'ASTERISK',
      'ARROW',
      'STRIKETHROUGH',
      'X_OUT',
      'CARET_INSERTION',
      'BRACKET',
      'DOUBLE_UNDERLINE',
      'SIDE_NOTE_MARK',
    ],
    optionalFutureMarks: ['BOXED_WORD', 'HIGHLIGHTED_SLASH', 'TICK_MARK', 'CORRECTION_SWOOP'],
    chapterLevelConstants: [
      'black-field cover environment',
      'artifact-first composition',
      'large typographic headline',
      'restrained lime annotation color',
      'overall negative-space discipline',
      'lower entry metadata positioning',
      'cinematic object lighting',
    ],
    entryLevelVariables: [
      'artifact type',
      'subject',
      'headline wording',
      'annotation family',
      'annotation placement',
      'number of annotation moves',
      'specific words targeted',
    ],
    repetitionRules: [
      'No two adjacent entries may use the exact same annotation combination',
      'If Entry N uses CIRCLE + UNDERLINE, Entry N+1 must use materially different behavior',
      'Primary mark should not repeat as primary on the next entry unless founder-approved',
      'Reuse allowed later only with enough intervening variation and different target behavior',
      'Across chapters vocabulary may reuse but must not become automatic default',
    ],
    creativeRule:
      'Annotations must feel like an interjection — hand-done, bespoke, editorial, sharp, minimal. NOT over-designed, crowded, or formulaic.',
    toneMapping: {
      CIRCLE: 'interrogation / spotlight / “this part”',
      UNDERLINE: 'insistence / finality / emphasis',
      ASTERISK: 'side-eye / note-this / snappy emphasis',
      ARROW: 'directional emphasis / “look here”',
      STRIKETHROUGH: 'revision / rejection / contradiction',
      X_OUT: 'hard disagreement / symbolic refusal',
      BRACKET: 'containment / categorization / isolate phrase',
      CARET_INSERTION: 'editorial correction / “actually”',
      DOUBLE_UNDERLINE: 'stronger insistence when needed',
      SIDE_NOTE_MARK: 'tiny editorial cue implying margin note without floating paragraph',
    },
    createdAt: NOW,
    updatedAt: NOW,
  };
}

export function annotationFamilyKey(
  primary: AnnotationMarkType,
  secondary?: AnnotationMarkType,
): string {
  return secondary ? `${primary}+${secondary}` : primary;
}

export function isCircleUnderlineHabit(family: string): boolean {
  return family === 'CIRCLE+UNDERLINE' || family === 'UNDERLINE+CIRCLE';
}

export function combinationsAreIdentical(a: string, b: string): boolean {
  const normalize = (s: string) => s.split('+').sort().join('+');
  return normalize(a) === normalize(b);
}

export function primaryMarkRepeatedBackToBack(
  priorPrimary: AnnotationMarkType,
  nextPrimary: AnnotationMarkType,
): boolean {
  return priorPrimary === nextPrimary;
}
