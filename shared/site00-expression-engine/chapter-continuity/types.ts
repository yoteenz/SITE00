/**
 * C1.3 — Chapter narrative continuity + entry sequence intelligence.
 */

import type {
  CampaignMotifSystem,
  CampaignCreativeRhythm,
  CampaignEscalationPlan,
} from '../campaign-narrative/types.js';

export const CHAPTER_CONTINUITY_VERSION = '1.3.0' as const;

export const ENTRY_FUNCTION_TYPES = [
  'OPENING_PROVOCATION',
  'FIRST_RECEIPT',
  'ESCALATION',
  'REVERSAL',
  'DEEPENING',
  'COUNTEREXAMPLE',
  'MIRROR',
  'PAYOFF',
  'FALSE_RESOLUTION',
  'AFTERSHOCK',
  'BRIDGE',
  'CHAPTER_CLIMAX',
  'CHAPTER_EXIT',
] as const;
export type EntryFunctionType = (typeof ENTRY_FUNCTION_TYPES)[number];

export const HANDOFF_TYPES = [
  'OBJECT_CONTINUATION',
  'DEVICE_CONTINUATION',
  'MATCH_CUT',
  'SOUND_BRIDGE',
  'QUESTION_BRIDGE',
  'VISUAL_MOTIF',
  'TEXT_INTERRUPT',
  'NOTIFICATION',
  'TRANSMISSION',
  'ENVIRONMENTAL_CONTINUATION',
  'CHARACTER_CONTINUATION',
  'FALSE_ENDING',
  'HARD_CONTRAST',
] as const;
export type HandoffType = (typeof HANDOFF_TYPES)[number];

export type EntrySequenceRole = {
  entryId: string;
  sequenceNumber: number;
  chapterId: string;
  entryFunction: EntryFunctionType;
  whatItInherits: string;
  whatItEscalates: string;
  whatItContradicts: string;
  whatItIntroduces: string;
  whatItResolves: string;
  whatItLeavesOpen: string;
  handoffIn: string;
  handoffOut: string;
  teaserToNext: string;
  artifactCarryover: string;
  motifCarryover: string;
  questionCarryover: string;
  emotionalCarryover: string;
  visualContinuityRules: string[];
  differenceFromPrevious: string;
  differenceFromNextCandidate: string;
};

export type EntryHandoffPlan = {
  fromEntryId: string;
  toEntryId: string;
  handoffType: HandoffType;
  handoffObject: string;
  handoffImage: string;
  handoffSound: string;
  handoffQuestion: string;
  handoffAction: string;
  handoffLine: string;
  continuityStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  narrativeNecessity: 'OPTIONAL' | 'RECOMMENDED' | 'REQUIRED';
  reuseRisk: 'LOW' | 'MODERATE' | 'HIGH';
  whyItWorks: string;
  artifactBridgeNotReuse: boolean;
};

export type Entry004TeaseSeed = {
  seedType: 'QUESTION' | 'OBJECT' | 'INTERRUPTION' | 'IMAGE' | 'CONTRADICTION' | 'LINE';
  seedObject: string;
  seedQuestion: string;
  seedVisual: string;
  seedLine: string;
  whyItExtendsChapter: string;
  constraints: string[];
  nonCanon: true;
};

export type ChapterRhythmPlan = CampaignCreativeRhythm & {
  chapterId: string;
  interjectionPatternHistory: string[];
  interjectionVarietyRequired: boolean;
};

export type ChapterNarrativeContinuity = {
  chapterId: string;
  chapterTitle: string;
  chapterCoreQuestion: string;
  chapterArgumentGrammar: string[];
  chapterEmotionalArc: string;
  chapterEscalationModel: CampaignEscalationPlan;
  chapterRecurringQuestions: string[];
  chapterRecurringMotifs: CampaignMotifSystem;
  chapterArtifactLineage: string[];
  chapterDeviceLineage: string[];
  chapterTransitionLineage: string[];
  chapterInterjectionPattern: string[];
  chapterOpenThreads: string[];
  chapterResolvedThreads: string[];
  entrySequence: EntrySequenceRole[];
  nextEntryTeasePolicy: string;
  rhythmPlan: ChapterRhythmPlan;
  continuityStatus: 'BUILDING' | 'ESCALATING' | 'AWAITING_NEXT_ENTRY' | 'COMPLETE';
  founderJudgment: string | null;
  version: string;
};

export type ChapterStoryMapNode = {
  entryId: string;
  title: string;
  question: string;
  contradiction: string;
  world: string;
  artifact: string;
  ndxRole: string;
  ending: string;
  handoff: string;
  nonCanon?: boolean;
};

export type ChapterStoryMap = {
  chapterId: string;
  chapterTitle: string;
  nodes: ChapterStoryMapNode[];
  seriesContinuityStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  escalationSummary: string;
};

export type ChapterStateSnapshot = {
  afterEntryId: string;
  provenClaims: string[];
  openQuestions: string[];
  emotionalRegister: string;
  motifsActive: string[];
  artifactsInPlay: string[];
  escalationLevel: number;
};

export type Entry003NarrativeResponsibility = {
  entryId: string;
  chapterStateBefore: ChapterStateSnapshot;
  whatEntryMustAdd: string;
  whatEntryMustAvoid: string[];
  whyNotAnotherExample: string;
  escalationMove: string;
};

export type DirectorialConcept = {
  conceptName: string;
  oneSentenceFilmIdea: string;
  storyMechanism: string;
  world: string;
  worldFunction: string;
  artifact: string;
  artifactFunction: string;
  ndxRole: string;
  subjectRole: string;
  openingImage: string;
  centralReveal: string;
  turningPoint: string;
  interjectionTerritory: string;
  climaxImage: string;
  endingImage: string;
  handoffInFromEntry002: string;
  handoffOutToEntry004Candidate: string;
  whyItFeelsCinematic: string;
  whyItIsWitty: string;
  whyItIsNotJustAnAd: string;
  whyItIsNotShelfieMuseumAgain: string;
};

export type CreativeWitPass = {
  surprise: number;
  doubleMeaning: number;
  irony: number;
  visualPun: number;
  rhetoricalTwist: number;
  specificity: number;
  quotability: number;
  restraint: number;
  totalScore: number;
  diagnostic: string;
};

export type MasterFilmDirectorPass = {
  passId: string;
  founderChallenge: string;
  deeperContradiction: string;
  concepts: DirectorialConcept[];
  winningConceptId: string;
  whyWinningConceptWins: string;
  shelfieMuseumSuperseded: boolean;
  shelfieMuseumSupersessionReason: string;
  witPass: CreativeWitPass;
};

export type CinematicContinuityDirectorOutput = {
  directorId: string;
  layer: 'CINEMATIC_CONTINUITY_DIRECTOR';
  chapterContinuity: ChapterNarrativeContinuity;
  chapterStoryMap: ChapterStoryMap;
  entry003Responsibility: Entry003NarrativeResponsibility;
  selectedHandoff: EntryHandoffPlan;
  handoffOptions: EntryHandoffPlan[];
  artifactBridgeLogic: string;
  masterFilmDirectorPass: MasterFilmDirectorPass;
  chapterCohesionQA: import('../campaign-narrative/types.js').CampaignNarrativeCohesionQA;
  version: string;
};

export type InterjectionCandidateC13 = {
  line: string;
  rhetoricalBehavior: string;
  wit: number;
  cinematicFit: number;
  culturalSharpness: number;
  specificity: number;
  memorability: number;
  earnedness: number;
  totalScore: number;
};

export type TitleCandidateC13 = {
  title: string;
  score: number;
  whyItWorks: string;
};
