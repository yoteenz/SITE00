/**
 * C1.0 — Narrative Synthesis Engine types (story authority layer).
 */

export const NARRATIVE_SYNTHESIS_VERSION = '1.0.0' as const;
export const MAX_SELF_REVISION_PASSES = 3 as const;

export const NARRATIVE_SPINE_BEAT_TYPES = [
  'SETUP',
  'QUESTION',
  'DISCOVERY',
  'ESCALATION',
  'TURN',
  'CONTRADICTION',
  'INTERJECTION',
  'PAYOFF',
  'AFTERSHOCK',
] as const;

export type NarrativeSpineBeatType = (typeof NARRATIVE_SPINE_BEAT_TYPES)[number];

export const NARRATIVE_SYNTHESIS_STATUSES = [
  'DRAFT',
  'SELF_REVISION',
  'AWAITING_FOUNDER_REVIEW',
  'NEEDS_FOUNDER_DIRECTION',
  'APPROVED',
  'SUPERSEDED',
  'ARCHIVED',
] as const;

export type NarrativeSynthesisStatus = (typeof NARRATIVE_SYNTHESIS_STATUSES)[number];

export const NARRATIVE_FAILURE_CLASSIFICATIONS = [
  'SCENE_COLLECTION_NOT_STORY',
  'WEAK_CAUSALITY',
  'LOW_ORDER_DEPENDENCY',
  'NO_LIVE_QUESTION',
  'OVEREXPLAINED_OPENING',
  'WEAK_ESCALATION',
  'UNEARNT_TURN',
  'UNEARNT_INTERJECTION',
  'UNSETUP_PAYOFF',
  'UNPAID_SETUP',
  'DECORATIVE_WORLD',
  'DECORATIVE_ARTIFACT',
  'ROLE_CONFUSION',
  'CONCEPT_STACKING',
  'REDUNDANT_BEATS',
  'EMOTIONALLY_FLAT',
  'ENDING_DOES_NOT_SHARPEN_ARGUMENT',
  'TOO_LITERAL',
  'TOO_SAFE',
  'TOO_CLOSE_TO_PRIOR_ENTRY',
] as const;

export type NarrativeFailureClassification = (typeof NARRATIVE_FAILURE_CLASSIFICATIONS)[number];

export const REVEAL_STRATEGY_MODES = [
  'IMMEDIATE',
  'PROGRESSIVE',
  'MISDIRECTED',
  'ARCHIVAL_DISCOVERY',
  'CONTRADICTION_REVEAL',
  'OBJECT_REVEAL',
  'IDENTITY_REVEAL',
  'CONTEXT_REVEAL',
  'CAUSE_REVEAL',
] as const;

export type RevealStrategyMode = (typeof REVEAL_STRATEGY_MODES)[number];

export const EMOTIONAL_ARC_STATES = [
  'CURIOSITY',
  'RECOGNITION',
  'UNEASE',
  'ANTICIPATION',
  'SURPRISE',
  'DISBELIEF',
  'REALIZATION',
  'SATISFACTION',
  'TENSION',
  'AFTERSHOCK',
] as const;

export type EmotionalArcState = (typeof EMOTIONAL_ARC_STATES)[number];

export const NDX_NARRATIVE_ROLES = [
  'OBSERVER',
  'INVESTIGATOR',
  'INTERJECTOR',
  'ARCHIVIST',
  'WITNESS',
  'PARTICIPANT',
  'DISRUPTOR',
  'NARRATOR',
  'ABSENT_PRESENCE',
] as const;

export type NdxNarrativeRole = (typeof NDX_NARRATIVE_ROLES)[number];

export const SUBJECT_NARRATIVE_ROLES = [
  'PROOF',
  'CASE_STUDY',
  'PROTAGONIST',
  'MEMORY',
  'ARCHIVAL_SUBJECT',
  'SYMBOL',
  'CONTRADICTION_OBJECT',
] as const;

export type SubjectNarrativeRole = (typeof SUBJECT_NARRATIVE_ROLES)[number];

export const WORLD_NARRATIVE_FUNCTIONS = [
  'REVEAL',
  'DISTORT',
  'ARCHIVE',
  'COMPARE',
  'AMPLIFY',
  'TRAP',
  'RECONSTRUCT',
  'PERFORM',
  'EDIT',
  'ERASE',
] as const;

export type WorldNarrativeFunction = (typeof WORLD_NARRATIVE_FUNCTIONS)[number];

export const ARTIFACT_NARRATIVE_ROLES = [
  'EVIDENCE',
  'TRIGGER',
  'PORTAL',
  'WEAPON',
  'ARCHIVE',
  'MEASURING_DEVICE',
  'CONTRADICTION_SURFACE',
  'TRANSFORMATION_OBJECT',
  'INTERJECTION_SURFACE',
] as const;

export type ArtifactNarrativeRole = (typeof ARTIFACT_NARRATIVE_ROLES)[number];

export type NarrativeSynthesisFounderJudgment =
  | 'UNREVIEWED'
  | 'LOVE_IT'
  | 'PUSH_FURTHER'
  | 'TOO_SAFE'
  | 'TOO_CLOSE'
  | 'PROMISING_REFINE'
  | 'NOT_FOR_ME';

export type AudienceKnowledgeState = {
  beatId: string;
  knownFacts: string[];
  suspectedFacts: string[];
  openQuestions: string[];
  misdirection: string[];
  revealedContradictions: string[];
  unresolvedTensions: string[];
};

export type NarrativeQuestion = {
  questionId: string;
  introducedAtBeat: string;
  question: string;
  audienceExpectation: string;
  answeredAtBeat: string | null;
  answer: string | null;
  answerType: 'REVEAL' | 'CONTRADICTION' | 'TRANSFORM' | 'PARTIAL' | null;
  resolved: boolean;
  transformedIntoNewQuestion: string | null;
};

export type RevealStrategy = {
  primaryMode: RevealStrategyMode;
  secondaryModes: RevealStrategyMode[];
  withholdUntilBeat: string;
  rationale: string;
};

export type NarrativeBeat = {
  beatId: string;
  sequenceOrder: number;
  beatType: NarrativeSpineBeatType;
  storyFunction: string;
  whatHappens: string;
  whyItHappensNow: string;
  causedBy: string[];
  reveals: string[];
  audienceKnowsBefore: string[];
  audienceKnowsAfter: string[];
  emotionalStateBefore: EmotionalArcState;
  emotionalStateAfter: EmotionalArcState;
  visualMechanism: string | null;
  artifactInvolvement: string | null;
  worldInvolvement: string | null;
  ndxInvolvement: string | null;
  subjectInvolvement: string | null;
  transitionOut: string;
  requiredPayoffLink: string | null;
  removableWithoutDamage: boolean;
  causalFlags: {
    causesNextBeat: boolean;
    revealsForNextBeat: boolean;
    emotionallyEarnsNextBeat: boolean;
  };
  qaNotes: string[];
};

export type NarrativeCausalityEdge = {
  fromBeatId: string;
  toBeatId: string;
  edgeType: 'CAUSES' | 'REVEALS_FOR' | 'EMOTIONALLY_EARNS';
  rationale: string;
};

export type NarrativeCausalityGraph = {
  beats: NarrativeBeat[];
  edges: NarrativeCausalityEdge[];
  orderDependency: 'STRONG' | 'MODERATE' | 'WEAK';
  shuffleTestPassed: boolean;
  shuffleDamageSummary: string | null;
  setupDependencies: string[];
  revealDependencies: string[];
  emotionalDependencies: string[];
  payoffDependencies: string[];
};

export type NarrativePayoff = {
  setupBeatIds: string[];
  promiseCreated: string;
  payoffBeatId: string;
  payoffMechanism: string;
  intellectualPayoff: string;
  emotionalPayoff: string;
  visualPayoff: string;
};

export type RoleIntelligence = {
  ndxRole: NdxNarrativeRole;
  ndxRationale: string;
  subjectRole: SubjectNarrativeRole;
  subjectRationale: string;
  worldFunction: WorldNarrativeFunction;
  worldRationale: string;
  artifactRole: ArtifactNarrativeRole;
  artifactRationale: string;
  deviceRole: ArtifactNarrativeRole | null;
  deviceRationale: string | null;
};

export type CohesionQADomainResult = {
  domain: string;
  passed: boolean;
  score: number;
  diagnostics: string[];
};

export type NarrativeCohesionQA = {
  passed: boolean;
  overallScore: number;
  domains: CohesionQADomainResult[];
  failureClassifications: NarrativeFailureClassification[];
};

export type NarrativeSynthesisInput = {
  entryId: string;
  entryNumber: number;
  chapterId: string;
  brandId: string;
  subject: string;
  topic: string;
  thesis: string;
  lockedPremise: string | null;
  lockedContradiction?: string | null;
  chapterArgumentGrammar: string[];
  creativeTerritories: Array<{ territoryId: string; label: string; narrativePotential?: string }>;
  selectedTerritoryId: string | null;
  worldCandidates: Array<{ worldId: string; label: string; narrativeFunction?: WorldNarrativeFunction }>;
  artifactCandidates: Array<{ artifactId: string; label: string; narrativeRole?: ArtifactNarrativeRole }>;
  visualMechanisms: string[];
  interjectionCandidates: string[];
  brandLore: string[];
  brandPersonality: string[];
  founderCreativeAppetite: {
    risk: string | null;
    abstraction: string | null;
    wit: string | null;
    polarization: string | null;
    rawness: string | null;
    density: string | null;
    surprise: string | null;
    directorLatitude: string | null;
    boundaries: string | null;
  } | null;
  priorEntryLineage: Array<{
    entryId: string;
    worldId: string | null;
    artifactId: string | null;
    argumentShape: string[];
    interjectionDevice: string | null;
  }>;
  continuityConstraints: string[];
  formatContext: string[];
  platformContext: string[];
  creativeBoundaries: string[];
  /** Optional locked treatment core story for retrospective compile */
  treatmentCoreStory?: string | null;
  /** Optional panel beat seeds */
  panelBeatSeeds?: Array<{ beatId: string; storyFunction: string }>;
};

export type NarrativeSpine = {
  beatTypes: NarrativeSpineBeatType[];
  beats: NarrativeBeat[];
  compressionNotes: string[];
};

export type EmotionalArc = {
  progression: EmotionalArcState[];
  rationale: string;
};

export type NarrativeSynthesis = {
  synthesisId: string;
  entryId: string;
  version: string;
  status: NarrativeSynthesisStatus;
  sourceTerritoryIds: string[];
  selectedNarrativeDirection: string;
  centralQuestion: string;
  dramaticPremise: string;
  narrativeSpine: NarrativeSpine;
  audienceJourney: AudienceKnowledgeState[];
  emotionalArc: EmotionalArc;
  causalBeatGraph: NarrativeCausalityGraph;
  revealStrategy: RevealStrategy;
  liveQuestions: NarrativeQuestion[];
  turningPoint: { beatId: string; beforeMeaning: string; afterMeaning: string };
  contradiction: { statement: string; earnedAtBeat: string };
  interjection: { line: string; earnedAtBeat: string; criteriaMet: boolean };
  payoff: NarrativePayoff;
  aftershock: { statement: string; beatId: string; continuationHook: string | null };
  continuityRequirements: string[];
  roleIntelligence: RoleIntelligence;
  formatImplications: string[];
  directorialImplications: string[];
  whyNotTheObviousVersion: string;
  obviousVersionSummary: string;
  creativeDirectorSummary: string[];
  humanStorytellingAnswers: Record<string, string>;
  qaStatus: NarrativeCohesionQA;
  selfRevisionPasses: number;
  providerDispatchCount: 0;
  narrativeAuthority: boolean;
  founderJudgment: NarrativeSynthesisFounderJudgment;
  canon: boolean;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NarrativeCreativeCorrection = {
  correctionId: string;
  entryId: string;
  synthesisVersion: string;
  originalDecision: string;
  founderCorrection: string;
  failureClass: NarrativeFailureClassification | null;
  whyCorrectionImprovedStory: string;
  generalizableRule: string;
  scope: 'ENTRY_SPECIFIC' | 'CHAPTER' | 'NDXBOOK';
  createdAt: string;
};

export type GeneralizableNarrativeRule = {
  ruleId: string;
  rule: string;
  sourceEntryId: string;
  scope: 'CHAPTER' | 'NDXBOOK';
  surfaceDetailGuard: string;
  createdAt: string;
};

export type CreativeThinkingHandoff = {
  strongestTerritories: Array<{ territoryId: string; whyItMatters: string }>;
  metaphor: string | null;
  worldCandidates: string[];
  artifactCandidates: string[];
  creativeTension: string;
  riskProfile: string;
  visualOpportunity: string;
};

export type TreatmentHandoffContract = {
  narrativeAuthorityId: string;
  narrativeVersion: string;
  immutableStoryElements: string[];
  spineBeatOrder: string[];
  treatmentMustNotRewrite: string[];
};
