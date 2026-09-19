/**
 * Chapter Cover Annotation Variation System — shared types (Sprint B3.2).
 * Applies to entry covers within a chapter and future chapters.
 */

export const ANNOTATION_MARK_TYPES = [
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
] as const;

export type AnnotationMarkType = (typeof ANNOTATION_MARK_TYPES)[number];

export const OPTIONAL_FUTURE_ANNOTATION_MARKS = [
  'BOXED_WORD',
  'HIGHLIGHTED_SLASH',
  'TICK_MARK',
  'CORRECTION_SWOOP',
] as const;

export const HEADLINE_EMOTIONAL_TONES = [
  'ACCUSATORY',
  'IRONIC',
  'SKEPTICAL',
  'REVISIONIST',
  'DISMISSIVE',
  'INCREDULOUS',
] as const;

export type HeadlineEmotionalTone = (typeof HEADLINE_EMOTIONAL_TONES)[number];

export type CoverHeaderAnnotationPlan = {
  chapterId: string;
  entryId: string;
  headline: string;
  annotationFamily: string;
  primaryTargetWord: string;
  secondaryTargetWord?: string;
  primaryMark: AnnotationMarkType;
  secondaryMark?: AnnotationMarkType;
  placementNotes: string;
  emotionalTone: HeadlineEmotionalTone;
  repetitionHistory: string[];
  allowedForChapter: boolean;
  blockedDueToRecentUse: boolean;
  founderJudgment?: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null;
};

export type ChapterCoverAnnotationVariationSystem = {
  systemId: string;
  scope: 'ALL_CHAPTERS';
  status: 'LOCKED';
  corePrinciple: string;
  maxAnnotationsPerCover: 2;
  allowedMarkTypes: AnnotationMarkType[];
  optionalFutureMarks: readonly string[];
  chapterLevelConstants: string[];
  entryLevelVariables: string[];
  repetitionRules: string[];
  creativeRule: string;
  toneMapping: Partial<Record<AnnotationMarkType, string>>;
  createdAt: string;
  updatedAt: string;
};

export type CoverAnnotationHistoryRecord = {
  recordId: string;
  chapterId: string;
  entryId: string;
  entryNumber: number;
  headline: string;
  annotationFamily: string;
  primaryMark: AnnotationMarkType;
  secondaryMark?: AnnotationMarkType;
  targetedWords: string[];
  founderJudgment: CoverHeaderAnnotationPlan['founderJudgment'];
  recordedAt: string;
};

export type CoverAnnotationSelectionResult = {
  plan: CoverHeaderAnnotationPlan;
  selectionReason: string;
  avoidedPatterns: string[];
};

export type CoverAnnotationVariationQACheck = {
  check: string;
  passed: boolean;
  severity: 'PASS' | 'WARN' | 'BLOCK';
  detail?: string;
};

export type CoverAnnotationVariationQAResult = {
  chapterId: string;
  entryId: string;
  passed: boolean;
  blocking: boolean;
  checks: CoverAnnotationVariationQACheck[];
  blockers: string[];
  warnings: string[];
};

export type Entry003AnnotationExampleDirection = {
  entryId: 'entry-003-example';
  headlineExample: string;
  suggestedBehaviors: AnnotationMarkType[][];
  result: string;
  note: 'DIRECTION_ONLY_NOT_CANON';
};

export type B32BootstrapResult = {
  sprint: 'B3.2_COVER_ANNOTATION_VARIATION';
  annotationSystem: ChapterCoverAnnotationVariationSystem;
  chapter01Plans: CoverHeaderAnnotationPlan[];
  annotationHistory: CoverAnnotationHistoryRecord[];
  entry003Example: Entry003AnnotationExampleDirection;
  variationQA: CoverAnnotationVariationQAResult[];
  chapter01RepetitionStatus: 'DISTINCT_ADJACENT_ENTRIES';
  assetsGeneratedThisSprint: 0;
};
