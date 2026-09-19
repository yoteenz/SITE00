/**
 * P0.5E.7 — Character-first content operations types.
 */

import type {
  BELIEF_REVISION_STATES,
  BOOK_TRACE_TYPES,
  CHARACTER_AUTHORITY_MIGRATION_STATUSES,
  CHARACTER_BEAT_CONTRACTS,
  CHARACTER_FIRST_REGENERATION_FAILURES,
  CHARACTER_VISUAL_PARTICIPATION_LEVELS,
  CONTENT_SURFACE_TYPES,
  EXPERIENCE_MODES,
  FOUNDER_CAUSALITY_JUDGMENTS,
  FOUNDER_PREMISE_JUDGMENTS,
  HERO_SLIDE_ROLE_TYPES,
  HUMOR_OPPORTUNITY_LEVELS,
  NDX_CONTENT_SEED_SOURCE_TYPES,
  NDX_KNOWLEDGE_STATES,
  NDX_PAGE_ROLE_MAP_ROLES,
  NDX_THOUGHT_ARC_BEATS,
  PAGE_NARRATIVE_ROLES,
  PROHIBITED_HERO_SLIDE_ROLES,
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
  pageRoles: Array<{ slideNumber: number; role: PageNarrativeRole | NdxPageRoleMapRole; thoughtBeat: string }>;
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

export type HeroSlideRoleType = (typeof HERO_SLIDE_ROLE_TYPES)[number];
export type ProhibitedHeroSlideRole = (typeof PROHIBITED_HERO_SLIDE_ROLES)[number];
export type NdxPageRoleMapRole = (typeof NDX_PAGE_ROLE_MAP_ROLES)[number];
export type CharacterAuthorityMigrationStatus = (typeof CHARACTER_AUTHORITY_MIGRATION_STATUSES)[number];
export type CharacterFirstRegenerationFailure = (typeof CHARACTER_FIRST_REGENERATION_FAILURES)[number];
export type CharacterVisualParticipationLevel = (typeof CHARACTER_VISUAL_PARTICIPATION_LEVELS)[number];
export type FounderCausalityJudgment = (typeof FOUNDER_CAUSALITY_JUDGMENTS)[number];

export type FounderHeroLockState = {
  lockHeroPremise: boolean;
  lockHeroCopy: boolean;
  lockHeroPhoto: boolean;
  lockHeroCompositionIntent: boolean;
};

export type CharacterPremiseAuthority = {
  premiseId: string;
  contentSeedId: string;
  spokenPremise: string;
  firstPersonPremise: string;
  incitingIncident: string;
  firstReaction: string;
  initialBelief: string;
  investigationQuestion: string;
  knowledgeStateAtStart: NDXKnowledgeState;
  beliefRevisionState: BeliefRevisionState;
  currentView: string;
  behaviorChange: string;
  bookTrace: BookTraceType;
  characterBeat: CharacterBeatContract;
  founderApprovalState: FounderPremiseJudgment | FounderCausalityJudgment | null;
  authorityVersion: string;
  topicMetadata: string[];
  experienceMode: ExperienceMode;
};

export type NDXThoughtArcSnapshot = {
  snapshotId: string;
  contentSeedId: string;
  beats: NDXThoughtArcBeat[];
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
  knowledgeStateProgression: Array<{ slideNumber: number; state: NDXKnowledgeState }>;
  version: string;
};

export type PageRoleSemanticContract = {
  role: NdxPageRoleMapRole;
  narrativePurpose: string;
  knowledgeState: NDXKnowledgeState;
  characterState: string;
  copyIntent: string;
  evidenceIntent: string;
  photoIntent: string;
  bookArtifactIntent: string;
  annotationIntent: string;
  allowedDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  prohibitedBehavior: string[];
  requiredBehavior: string[];
};

export type NDXPageRoleMapEntry = {
  slideNumber: number;
  role: NdxPageRoleMapRole;
  spokenCopyHint: string;
  knowledgeState: NDXKnowledgeState;
  characterBeat?: CharacterBeatContract;
};

export type NDXPageRoleMap = {
  mapId: string;
  contentSeedId: string;
  entries: NDXPageRoleMapEntry[];
  version: string;
};

export type HeroSlideAuthority = {
  slideNumber: 1;
  role: HeroSlideRoleType;
  spokenPremise: string;
  emotionalFunction: string;
  incitingIncident: string;
  characterBeat: CharacterBeatContract;
  visualAuthority: 'P0.5C.7';
  mustPreserve: string[];
  approvedReferenceAssetId: string | null;
  approvedReferencePrompt: string | null;
  founderLocked: FounderHeroLockState;
  prohibitedRoles: ProhibitedHeroSlideRole[];
};

export type CharacterFirstContentSnapshot = {
  snapshotId: string;
  premiseVersion: string;
  thoughtArcVersion: string;
  pageRoleMapVersion: string;
  characterBeatVersion: string;
  knowledgeStateVersion: string;
  evidenceVersion: string;
  visualGrammarVersion: string;
  compiledAt: string;
};

export type CharacterFirstRegenerationBundle = {
  premiseAuthority: CharacterPremiseAuthority;
  thoughtArcSnapshot: NDXThoughtArcSnapshot;
  pageRoleMap: NDXPageRoleMap;
  heroSlideAuthority: HeroSlideAuthority;
  contentSnapshot: CharacterFirstContentSnapshot;
  founderHeroLock: FounderHeroLockState;
};

export type CharacterVisualParticipationRecommendation = {
  slideNumber: number;
  level: CharacterVisualParticipationLevel;
  reason: string;
};

export type CharacterFirstEvaluationResult = {
  passed: boolean;
  failures: CharacterFirstRegenerationFailure[];
  warnings: string[];
};

export type CharacterAuthorityMigrationRecord = {
  legacySubject: string;
  topicIndex: number | null;
  seedId: string | null;
  status: CharacterAuthorityMigrationStatus;
  blockReason: string | null;
};

export type RegenerationAuthorityDiff = {
  premise: string;
  heroRole: HeroSlideRoleType;
  characterBeat: CharacterBeatContract;
  beliefRevision: BeliefRevisionState;
  slideRoles: string[];
  topicMetadata: string[];
  topicMoreProminentThanPremise: boolean;
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
