/**
 * P0.5E.7 — Character-first content operations types.
 */

import type {
  BELIEF_REVISION_STATES,
  BOOK_TRACE_TYPES,
  CHARACTER_BEAT_CONTRACTS,
  CONTENT_SURFACE_TYPES,
  EXPERIENCE_MODES,
  FOUNDER_PREMISE_JUDGMENTS,
  HUMOR_OPPORTUNITY_LEVELS,
  NDX_CONTENT_SEED_SOURCE_TYPES,
  NDX_KNOWLEDGE_STATES,
  NDX_THOUGHT_ARC_BEATS,
  PAGE_NARRATIVE_ROLES,
  TOPIC_MIGRATION_STATUSES,
} from './constants.js';

export type NDXContentSeedSourceType = (typeof NDX_CONTENT_SEED_SOURCE_TYPES)[number];
export type NDXThoughtArcBeat = (typeof NDX_THOUGHT_ARC_BEATS)[number];
export type BeliefRevisionState = (typeof BELIEF_REVISION_STATES)[number];
export type NDXKnowledgeState = (typeof NDX_KNOWLEDGE_STATES)[number];
export type CharacterBeatContract = (typeof CHARACTER_BEAT_CONTRACTS)[number];
export type HumorOpportunityLevel = (typeof HUMOR_OPPORTUNITY_LEVELS)[number];
export type BookTraceType = (typeof BOOK_TRACE_TYPES)[number];
export type PageNarrativeRole = (typeof PAGE_NARRATIVE_ROLES)[number];
export type ContentSurfaceType = (typeof CONTENT_SURFACE_TYPES)[number];
export type TopicMigrationStatus = (typeof TOPIC_MIGRATION_STATUSES)[number];
export type FounderPremiseJudgment = (typeof FOUNDER_PREMISE_JUDGMENTS)[number];
export type ExperienceMode = (typeof EXPERIENCE_MODES)[number];

export type NDXThoughtArc = {
  arcId: string;
  beatsPresent: NDXThoughtArcBeat[];
  notice: string;
  firstReaction: string;
  initialBelief: string;
  question: string;
  investigationTrigger: string;
  evidenceNeeded: string[];
  evidenceFound: string[];
  contradictions: string[];
  beliefRevision: BeliefRevisionState;
  currentView: string;
  knowledgeState: NDXKnowledgeState;
};

export type NDXFirstPersonCreativePremise = {
  spokenPremise: string;
  internalTopic: string;
  topicMetadata: string[];
  categoryMetadata: string[];
  experienceMode: ExperienceMode;
};

export type NDXContentSeed = {
  seedId: string;
  projectId: string;
  createdAt: string;
  sourceType: NDXContentSeedSourceType;
  sourceIds: string[];
  topicMetadata: string[];
  categoryMetadata: string[];
  liveSignalIds: string[];
  personalExperience: string | null;
  audiencePrompt: string | null;
  historicalCallback: string | null;
  notice: string;
  firstReaction: string;
  initialBelief: string;
  friction: string;
  question: string;
  whySheCares: string;
  investigationTrigger: string;
  evidenceNeeded: string[];
  evidenceFound: string[];
  contradictions: string[];
  changedMind: boolean;
  strengthenedBelief: boolean;
  currentView: string;
  bookTrace: BookTraceType;
  contentOpportunity: string;
  candidateSurface: ContentSurfaceType;
  candidateFormat: string;
  characterBeat: CharacterBeatContract;
  humorPotential: HumorOpportunityLevel;
  culturalRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  temporalRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  saveability: 'HIGH' | 'MEDIUM' | 'LOW';
  conversationPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  founderNotes: string | null;
  thoughtArc: NDXThoughtArc;
  premise: NDXFirstPersonCreativePremise;
  migrationStatus: TopicMigrationStatus;
  legacyTopicSubject: string | null;
  isGoldenPilot: boolean;
};

export type CharacterTruthFormulationContext = {
  characterTruthSnapshotId: string | null;
  languageRegister: string;
  humorBehavior: string;
  bookBehavior: string;
  correctionBehavior: string;
  curiosityPatterns: string[];
  cameraBehavior: string;
};

export type NDXOpportunityFormulation = {
  spokenPremise: string;
  internalTopic: string;
  whyNow: string;
  firstReaction: string;
  investigationAngle: string;
  bookTrace: BookTraceType;
  surfaceRecommendation: ContentSurfaceType[];
  formatRecommendation: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  evidenceReadiness: 'READY' | 'PARTIAL' | 'NEEDS_RESEARCH';
  conversationPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  savePotential: 'HIGH' | 'MEDIUM' | 'LOW';
  thoughtArcSummary: string;
  characterBeat: CharacterBeatContract;
  knowledgeState: NDXKnowledgeState;
  pageRoles: PageNarrativeRole[];
  visualHandoff: BookNativeVisualHandoff;
  filmHandoff: ContentSeedFilmHandoff;
};

export type BookNativeVisualHandoff = {
  pageRoles: Array<{ slideNumber: number; role: PageNarrativeRole; thoughtBeat: string }>;
  evidenceRole: string;
  photoNeed: boolean;
  bookArtifactNeed: string;
  annotationOpportunity: string;
  sourceMaterial: string;
  constructionIntent: string;
  grammarAuthority: 'V2.3+P0.5C.7';
};

export type ContentSeedFilmHandoff = {
  contentSeedId: string;
  reelArc: string[];
  openingBeat: CharacterBeatContract;
  rabbitHoleTrigger: string;
  payoff: string;
};

export type ContentOpsWorkspaceZone = {
  zoneId: string;
  label: string;
  seedIds: string[];
};

export type TopicPipelineMigrationRecord = {
  legacySubject: string;
  legacySummary: string;
  seedId: string | null;
  status: TopicMigrationStatus;
  reformulatedPremise: string | null;
};

export type HumorOpportunityEvaluation = {
  level: HumorOpportunityLevel;
  sources: string[];
  mechanicalJokeAppended: false;
};

export type NDXFirstPersonCopyOutput = {
  hooks: string[];
  headlines: string[];
  annotations: string[];
  captionDraft: string;
  spokenLines: string[];
  uppercaseAuthored: true;
};

export type LiveIntelligenceNoticeOpportunity = {
  rawSignal: string;
  oldTopicLabel: string;
  ndxNoticePremise: string;
  temporalRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type ContentOpportunityCharacterFirst = {
  contentSeedId: string;
  spokenPremise: string;
  firstPersonPremise: NDXFirstPersonCreativePremise;
  thoughtArc: NDXThoughtArc;
  characterBeat: CharacterBeatContract;
  knowledgeState: NDXKnowledgeState;
  beliefRevision: BeliefRevisionState;
  formulation: NDXOpportunityFormulation;
  humorEvaluation: HumorOpportunityEvaluation;
  bookMemoryHits: import('./bookMemory.js').BookMemoryHit;
  characterTruthSnapshotId: string | null;
  topicIsPrimaryPremise: false;
};
