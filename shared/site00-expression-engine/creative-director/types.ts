/**
 * C1.1 — Autonomous Creative Director Runtime types.
 */

import type { NarrativeSynthesis } from '../narrative-synthesis/types.js';

export const MAX_CREATIVE_DIRECTOR_PASSES = 3 as const;
export const CREATIVE_DIRECTOR_VERSION = '1.1.0' as const;

export const FOUNDER_INTERVENTION_DEPENDENCY_LEVELS = ['LOW', 'MODERATE', 'HIGH'] as const;
export type FounderInterventionDependency = (typeof FOUNDER_INTERVENTION_DEPENDENCY_LEVELS)[number];

export const CREATIVE_DIRECTOR_STATUSES = [
  'DRAFT',
  'SELF_REVISION',
  'AWAITING_FOUNDER_REVIEW',
  'NEEDS_FOUNDER_DIRECTION',
  'APPROVED',
  'ARCHIVED',
] as const;
export type CreativeDirectorStatus = (typeof CREATIVE_DIRECTOR_STATUSES)[number];

export const CREATIVE_DIRECTOR_FOUNDER_JUDGMENTS = [
  'UNREVIEWED',
  'LOVE_IT',
  'PUSH_FURTHER',
  'TOO_SAFE',
  'TOO_CLOSE',
  'CHANGE_THE_WORLD',
  'CHANGE_THE_ROLE',
  'REVISE',
  'NOT_FOR_ME',
] as const;
export type CreativeDirectorFounderJudgment = (typeof CREATIVE_DIRECTOR_FOUNDER_JUDGMENTS)[number];

export const FOUNDER_FEEDBACK_TYPES = [
  'TASTE_FEEDBACK',
  'STRUCTURAL_REPAIR',
  'CANON_CORRECTION',
  'CONTINUITY_CORRECTION',
  'ORIGINALITY_PUSH',
] as const;
export type FounderFeedbackType = (typeof FOUNDER_FEEDBACK_TYPES)[number];

export type MinimalCreativeBrief = {
  brandId: string;
  entryId: string;
  chapterId: string;
  subject: string;
  topic: string;
  thesis: string;
  chapterArgumentGrammar: string[];
  brandTruth: string;
  brandPersonality: string;
  founderCreativeAppetite: 'CONSERVATIVE' | 'MODERATE' | 'BOLD';
  priorEntryLineage: PriorEntryLineageEntry[];
  sourceMaterial?: string | null;
  culturalReferences?: string[];
  formatTarget?: string;
};

export type PriorEntryLineageEntry = {
  entryId: string;
  title: string;
  subject: string;
  coreContradiction: string;
  world: string;
  artifact: string;
  interjectionDevice: string;
  surfaceMechanismsToAvoid: string[];
};

export type CulturalRead = {
  surfaceTopic: string;
  obviousTake: string;
  underlyingTension: string;
  culturalHypocrisy: string;
  emotionalTension: string;
  socialContradiction: string;
  uncomfortableTruth: string;
  historicalContext: string;
  whyItMattersNow: string;
};

export type ObviousVersion = {
  categories: string[];
  summary: string;
  whyWeAreNotMakingThat: string;
};

export type DeeperReframe = {
  surfaceTopic: string;
  deeperInterpretation: string;
  creativeReframe: string;
  metaphoricalOpportunity: string;
  narrativeOpportunity: string;
  emotionalOpportunity: string;
};

export type CreativeTerritoryCandidate = {
  territoryId: string;
  name: string;
  coreIdea: string;
  world: string;
  worldFunction: string;
  artifact: string;
  artifactFunction: string;
  ndxRoleCandidate: string;
  subjectRoleCandidate: string;
  narrativeMechanism: string;
  visualMechanism: string;
  emotionalTemperature: string;
  revealPotential: string;
  turnPotential: string;
  interjectionPotential: string;
  payoffPotential: string;
  formatStrength: string;
  whyItIsDistinct: string;
  similarityToEntry001: number;
  similarityToEntry002: number;
};

export type TerritoryEvaluation = {
  territoryId: string;
  causalStoryPotential: number;
  revealPotential: number;
  emotionalEscalation: number;
  turningPointPotential: number;
  artifactUsefulness: number;
  characterRoleOpportunity: number;
  worldFunction: number;
  interjectionPotential: number;
  payoffStrength: number;
  originality: number;
  brandTruthFit: number;
  priorEntryDifference: number;
  totalScore: number;
  qualitativeReasoning: string;
};

export type WinningCreativeDirection = {
  territoryId: string;
  territoryName: string;
  whyItWins: string;
  whyOthersLost: string[];
  deeperMeaning: string;
  creativeRisk: string;
  brandTruthFit: string;
  priorEntryDifference: string;
  whyNotObviousVersion: string;
};

export type RoleSynthesis = {
  ndxRole: string;
  ndxRationale: string;
  subjectRole: string;
  subjectRationale: string;
  audienceRole: string;
  worldRole: string;
  artifactRole: string;
  deviceRole: string | null;
};

export type TurningPointRecord = {
  meaningBefore: string;
  turnEvent: string;
  meaningAfter: string;
};

export type InterjectionCandidate = {
  line: string;
  sharpness: number;
  specificity: number;
  wit: number;
  earnedness: number;
  quotability: number;
  brandVoice: number;
  totalScore: number;
};

export type PayoffAftershock = {
  visualPayoff: string;
  intellectualPayoff: string;
  emotionalPayoff: string;
  aftershock: string;
};

export type DirectorialConception = {
  cameraLanguage: string;
  pacing: string;
  visualEscalation: string;
  spatialLogic: string;
  lightingProgression: string;
  transitions: string;
  soundOpportunity: string;
  worldReveal: string;
  artifactBehavior: string;
  performanceBehavior: string;
};

export type VisualAuthorityRequirement = {
  authorityId: string;
  authorityName: string;
  whyRequired: string;
  whatItControls: string;
  laterStagesConsume: string[];
  continuityRiskIfMissing: string;
  priority: 'REQUIRED' | 'RECOMMENDED';
};

export type CreativeMaturityAssessment = {
  culturalInsight: { score: number; diagnostic: string };
  conceptOriginality: { score: number; diagnostic: string };
  narrativeCausality: { score: number; diagnostic: string };
  emotionalArc: { score: number; diagnostic: string };
  turnStrength: { score: number; diagnostic: string };
  interjectionStrength: { score: number; diagnostic: string };
  worldFunction: { score: number; diagnostic: string };
  artifactFunction: { score: number; diagnostic: string };
  roleClarity: { score: number; diagnostic: string };
  visualPotential: { score: number; diagnostic: string };
  brandSpecificity: { score: number; diagnostic: string };
  priorEntryDifferentiation: { score: number; diagnostic: string };
  founderInterventionDependency: FounderInterventionDependency;
  substantivePass: boolean;
};

export type CreativeDirectorSelfCritique = {
  questions: Record<string, boolean | string>;
  failureClasses: string[];
  requiresRevision: boolean;
  founderWouldConnectDots: boolean;
  internalDisagreements: Array<{ lens: string; position: string; resolution: string }>;
};

export type CreativeDirectorRevisionRecord = {
  pass: number;
  failureClasses: string[];
  whatChanged: string;
  whyItImproved: string;
};

export type CreativeDirectorRun = {
  runId: string;
  entryId: string;
  version: string;
  status: CreativeDirectorStatus;
  brief: MinimalCreativeBrief;
  culturalRead: CulturalRead;
  obviousVersion: ObviousVersion;
  deeperReframe: DeeperReframe;
  territories: CreativeTerritoryCandidate[];
  territoryEvaluations: TerritoryEvaluation[];
  winningDirection: WinningCreativeDirection;
  roleSynthesis: RoleSynthesis;
  turningPoint: TurningPointRecord;
  contradiction: { positionA: string; positionB: string; receiptCollision: string; whyBothCannotSurvive: string };
  interjectionCandidates: InterjectionCandidate[];
  selectedInterjection: string;
  payoffAftershock: PayoffAftershock;
  directorialConception: DirectorialConception;
  visualAuthorityPlan: VisualAuthorityRequirement[];
  selfCritique: CreativeDirectorSelfCritique;
  creativeMaturity: CreativeMaturityAssessment;
  founderInterventionDependency: FounderInterventionDependency;
  narrativeSynthesis: NarrativeSynthesis | null;
  revisionPasses: CreativeDirectorRevisionRecord[];
  llmProviderUsed: string;
  llmRequestCount: number;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  founderJudgment: CreativeDirectorFounderJudgment;
  founderFeedbackType: FounderFeedbackType | null;
  narrativeAuthority: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreativeDirectorBootstrapResult = {
  sprint: string;
  architectureLayer: string;
  providerDispatchCount: 0;
  imageProviderDispatchCount: 0;
  videoProviderDispatchCount: 0;
  creativeDirectorRun: CreativeDirectorRun;
  blindTestBrief: MinimalCreativeBrief;
  nextAction: string;
};
