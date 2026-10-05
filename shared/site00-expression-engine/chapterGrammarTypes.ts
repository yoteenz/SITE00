/**
 * Chapter Argument Grammar — shared types (Sprint B2).
 * Methodology layer above Entry in Expression Engine V0.
 */

import type { EntryFormat } from './types.js';

export const CHAPTER_GRAMMAR_STATUSES = [
  'DRAFT',
  'AWAITING_FOUNDER_JUDGMENT',
  'LOCKED',
  'SUPERSEDED',
  'ARCHIVED',
] as const;

export const CHAPTER_CANON_STATES = [
  'DRAFT',
  'PRODUCTION',
  'CANON_CANDIDATE',
  'CANON',
] as const;

export const CHAPTER_ARGUMENT_BEATS = [
  'CLAIM',
  'RECEIPT',
  'CONTRADICTION',
  'LENS',
  'INTERJECTION',
  'SYNTHESIS',
] as const;

export type ChapterGrammarStatus = (typeof CHAPTER_GRAMMAR_STATUSES)[number];
export type ChapterCanonState = (typeof CHAPTER_CANON_STATES)[number];
export type ChapterArgumentBeat = (typeof CHAPTER_ARGUMENT_BEATS)[number];

export type ArgumentSequenceDefinition = {
  beat: ChapterArgumentBeat;
  definition: string;
  examples?: string[];
};

export type ChapterArgumentGrammar = {
  grammarId: string;
  chapterId: string;
  brandId: string;
  projectId: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterSubtitle?: string;
  status: ChapterGrammarStatus;
  coreQuestion: string;
  argumentSequence: ChapterArgumentBeat[];
  sequenceDefinitions: ArgumentSequenceDefinition[];
  recurringEditorialBehavior: string;
  interjectionBehavior: string;
  receiptBehavior: string;
  synthesisBehavior: string;
  allowedVariations: string[];
  prohibitedRepetition: string[];
  artifactRules: string[];
  worldRules: string[];
  formatTranslationRules: string[];
  entryRequirements: string[];
  canonState: ChapterCanonState;
  founderJudgment: 'UNREVIEWED' | 'LOVE_IT' | 'PROMISING_REFINE' | 'NOT_FOR_ME' | null;
  createdAt: string;
  updatedAt: string;
};

export type CreativeChapter = {
  chapterId: string;
  brandId: string;
  projectId: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterSubtitle?: string;
  grammarId: string;
  entryIds: string[];
  status: ChapterGrammarStatus;
  canonState: ChapterCanonState;
  founderJudgment: ChapterArgumentGrammar['founderJudgment'];
  createdAt: string;
  updatedAt: string;
};

export type EntryArgumentBeat = {
  beatId: string;
  label: string;
  copy: string;
  order: number;
};

export type EntryChapterArgumentMapping = {
  entryId: string;
  entryNumber: number;
  chapterId: string;
  subject: string;
  premise?: string;
  claim: string;
  receipt: string;
  contradiction: string;
  lens: string;
  interjection: string;
  secondaryInterjection?: string;
  synthesis: string;
  world: string;
  worldId: string;
  artifact: string;
  artifactId: string;
  interjectionDevice: string;
  evidenceMotifs?: string[];
  argumentBeats: EntryArgumentBeat[];
  expressionMechanisms: {
    contradictionMechanism: string;
    worldMechanism: string;
    artifactClass: string;
    interjectionDevice: string;
    compositionGrammar: string;
    motionGrammar: string;
  };
};

export type ChapterGrammarValidationCheck = {
  check: string;
  passed: boolean;
  detail?: string;
};

export type ChapterGrammarValidationResult = {
  entryId: string;
  chapterId: string;
  valid: boolean;
  checks: ChapterGrammarValidationCheck[];
  blockers: string[];
};

export type RepetitionMechanismMatch = {
  mechanism: string;
  entryIds: string[];
  severity: 'WARN' | 'BLOCK';
  requiresFounderApproval: boolean;
};

export type ChapterRepetitionQAResult = {
  chapterId: string;
  passed: boolean;
  blocking: boolean;
  matches: RepetitionMechanismMatch[];
  comparisons: Array<{ entryA: string; entryB: string; sharedMechanisms: string[] }>;
  notes: string[];
};

export type FormatArgumentTranslation = {
  format: EntryFormat;
  beatFlow: string[];
  behavior: string;
  nativeStructure: string;
};

export type ChapterFormatTranslationMap = {
  chapterId: string;
  grammarSequence: ChapterArgumentBeat[];
  translations: FormatArgumentTranslation[];
  sameGrammarNotSameStructure: true;
};
