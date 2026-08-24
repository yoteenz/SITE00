/**
 * P0.5E.1 — Daily publishing cadence + cross-platform derivation types (brand-agnostic).
 */

import type {
  CADENCE_FAILURE_STATES,
  CADENCE_FULFILLMENT_STATES,
  CADENCE_SEMANTIC_LEVELS,
  CONTENT_FATIGUE_LEVELS,
  CONTENT_INTELLIGENCE_STATUSES,
  CONTENT_PRIORITY_TIERS,
  EXTENDED_CAMPAIGN_ROUND_TYPES,
  PLATFORM_ANGLE_DERIVATIONS,
  PLATFORM_EXPRESSION_STATUSES,
  PLATFORM_NATIVE_FIT_DIMENSIONS,
  PRIMARY_EVENT_LIFECYCLE_STATES,
  PRIMARY_EVENT_PLANNING_ROLES,
  PRIMARY_EVENT_STATUSES,
  PUBLISHING_PLATFORMS,
  PUBLISHING_SURFACES,
  REEL_PRODUCTION_COMPLEXITY,
  REEL_TYPE_BEHAVIORS,
  SECOND_REEL_DECISIONS,
  SECOND_REEL_ELIGIBILITY,
  SECOND_REEL_OPPORTUNITY_REASONS,
  STORY_ORIGIN_TYPES,
  STORY_UNIT_PURPOSES,
  WATCH_QUEUE_STATES,
  WEEKLY_APPROVAL_STAGES,
  WEEKLY_BOARD_VIEW_MODES,
} from './constants.js';

export type PublishingPlatform = (typeof PUBLISHING_PLATFORMS)[number];
export type PublishingSurface = (typeof PUBLISHING_SURFACES)[number];
export type CadenceFulfillmentState = (typeof CADENCE_FULFILLMENT_STATES)[number];
export type CadenceSemanticLevel = (typeof CADENCE_SEMANTIC_LEVELS)[number];
export type PrimaryEventLifecycleState = (typeof PRIMARY_EVENT_LIFECYCLE_STATES)[number];
export type SecondReelDecision = (typeof SECOND_REEL_DECISIONS)[number];
export type SecondReelOpportunityReason = (typeof SECOND_REEL_OPPORTUNITY_REASONS)[number];
export type PrimaryEventPlanningRole = (typeof PRIMARY_EVENT_PLANNING_ROLES)[number];
export type PrimaryEventStatus = (typeof PRIMARY_EVENT_STATUSES)[number];
export type ContentIntelligenceStatus = (typeof CONTENT_INTELLIGENCE_STATUSES)[number];
export type PlatformExpressionStatus = (typeof PLATFORM_EXPRESSION_STATUSES)[number];
export type SecondReelEligibility = (typeof SECOND_REEL_ELIGIBILITY)[number];
export type ReelProductionComplexity = (typeof REEL_PRODUCTION_COMPLEXITY)[number];
export type ReelTypeBehavior = (typeof REEL_TYPE_BEHAVIORS)[number];
export type PlatformAngleDerivation = (typeof PLATFORM_ANGLE_DERIVATIONS)[number];
export type ContentPriorityTier = (typeof CONTENT_PRIORITY_TIERS)[number];
export type WatchQueueState = (typeof WATCH_QUEUE_STATES)[number];
export type ContentFatigueLevel = (typeof CONTENT_FATIGUE_LEVELS)[number];
export type StoryUnitPurpose = (typeof STORY_UNIT_PURPOSES)[number];
export type StoryOriginType = (typeof STORY_ORIGIN_TYPES)[number];
export type WeeklyBoardViewMode = (typeof WEEKLY_BOARD_VIEW_MODES)[number];
export type ExtendedCampaignRoundType = (typeof EXTENDED_CAMPAIGN_ROUND_TYPES)[number];
export type WeeklyApprovalStage = (typeof WEEKLY_APPROVAL_STAGES)[number];
export type CadenceFailureState = (typeof CADENCE_FAILURE_STATES)[number];
export type PlatformNativeFitDimension = (typeof PLATFORM_NATIVE_FIT_DIMENSIONS)[number];

export type ChannelCadenceTarget = {
  platform: PublishingPlatform;
  surface: PublishingSurface;
  targetPerDay: number;
  maxNormalPerDay: number | null;
  optionalSlotPolicy: string | null;
  /** Semantic level for this channel target — TARGET vs OPTIONAL_CAPACITY. */
  semanticLevel?: CadenceSemanticLevel;
};

export type PublishingCadencePolicy = {
  policyId: string;
  projectId: string;
  brandId: string;
  name: string;
  primaryPlatforms: PublishingPlatform[];
  secondaryPlatforms: PublishingPlatform[];
  channelTargets: ChannelCadenceTarget[];
  primaryEventsPerDay: number;
  derivationPolicyId: string;
  approvalPolicyId: string;
  budgetPolicyId: string;
  configurableBy: string[];
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyPrimaryContentEvent = {
  id: string;
  projectId: string;
  date: string;
  planningRole: PrimaryEventPlanningRole | null;
  contentOpportunityId: string | null;
  characterEventId: string | null;
  contentThesisId: string | null;
  priority: ContentPriorityTier;
  timeliness: 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionState: string;
  researchDepth: string;
  primarySubject: string;
  secondarySubjects: string[];
  behavioralMode: string;
  characterTemperature: string;
  availableEvidence: string[];
  requiredEvidence: string[];
  recommendedChannelExpressions: string[];
  status: PrimaryEventStatus;
  /** Editorial lifecycle — callbacks and reactivation without reposting identical material. */
  lifecycleState: PrimaryEventLifecycleState;
  priorEventId: string | null;
  fingerprint: string;
};

export type CrossPlatformContentIntelligence = {
  id: string;
  projectId: string;
  primaryContentEventId: string;
  contentThesisId: string | null;
  coreObservation: string;
  coreQuestion: string | null;
  coreClaim: string | null;
  coreContradiction: string | null;
  whatNDXNoticed: string;
  whyNDXCares: string;
  whatNDXInvestigated: string | null;
  whatNDXFound: string | null;
  whatNDXConnected: string | null;
  whatNDXRemembers: string | null;
  whatNDXChangedItsMindAbout: string | null;
  evidenceManifest: string[];
  claimClassifications: string[];
  resolutionState: string;
  riskState: string;
  audienceValue: string;
  culturalContext: string | null;
  humorPotential: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  seriousnessRequirement: 'HIGH' | 'MEDIUM' | 'LOW';
  platformExpressionEligibility: Array<{ platform: PublishingPlatform; surface: PublishingSurface; recommended: boolean }>;
  status: ContentIntelligenceStatus;
  fingerprint: string;
};

export type CrossPlatformDerivationPolicy = {
  policyId: string;
  projectId: string;
  coreRule: 'REUSE_THINKING_NOT_POSTS';
  requireIndependentHook: true;
  requireIndependentPacing: true;
  requireIndependentVisualStrategy: true;
  forbidCrosspostCopy: true;
  forbidAssetDump: true;
  allowExplicitAssetReuse: boolean;
  fingerprint: string;
};

export type PlatformContentExpression = {
  id: string;
  contentIntelligenceId: string;
  primaryContentEventId: string;
  platform: PublishingPlatform;
  surface: PublishingSurface;
  format: string;
  platformRole: string;
  audienceBehavior: string;
  hook: string;
  openingBeat: string;
  informationSequence: string[];
  visualStrategy: string;
  audioStrategy: string | null;
  textStrategy: string | null;
  characterTemperature: string;
  behavioralMode: string;
  runtimeSeconds: number | null;
  slideCount: number | null;
  storyUnitCount: number | null;
  cta: string | null;
  interactionMechanism: string | null;
  adaptationReasoning: string;
  platformAngle: PlatformAngleDerivation;
  sharedIntelligenceFingerprint: string;
  expressionFingerprint: string;
  reelProductionComplexity: ReelProductionComplexity | null;
  reelTypeBehavior: ReelTypeBehavior | null;
  status: PlatformExpressionStatus;
};

export type DailyCrossPlatformMatrixCell = {
  primaryContentEventId: string;
  platform: PublishingPlatform;
  surface: PublishingSurface;
  planned: boolean;
  optional: boolean;
  expressionId: string | null;
};

export type DailyCrossPlatformContentMatrix = {
  matrixId: string;
  projectId: string;
  date: string;
  primaryEventIds: string[];
  cells: DailyCrossPlatformMatrixCell[];
  reuseIntelligenceCount: number;
  uniqueExpressionCount: number;
  fingerprint: string;
};

export type StoryUnit = {
  unitId: string;
  purpose: StoryUnitPurpose;
  originType: StoryOriginType;
  primaryContentEventId: string | null;
  hook: string;
  interactionMechanism: string | null;
  status: PlatformExpressionStatus;
};

export type DailyStoryCluster = {
  clusterId: string;
  projectId: string;
  date: string;
  storyUnits: StoryUnit[];
  linkedPrimaryContentEvents: string[];
  independentStoryUnits: string[];
  narrativeFlow: string;
  interactionMix: string[];
  resolutionMix: string[];
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'LOCKED';
  approvalState: string | null;
};

export type SecondReelEligibilityEvaluation = {
  date: string;
  eligibility: SecondReelEligibility;
  reason: string;
  primaryContentEventId: string | null;
  decision: SecondReelDecision;
  opportunityReason: SecondReelOpportunityReason | null;
  holdSlotEmpty: boolean;
};

export type CadenceFulfillmentEvaluation = {
  date: string;
  state: CadenceFulfillmentState;
  healthy: boolean;
  baselineMet: boolean;
  optionalCapacityUsed: boolean;
  fillerPressureDetected: boolean;
  cadenceIsNotQuota: true;
};

export type SharedResearchPackage = {
  packageId: string;
  contentIntelligenceId: string;
  verifiedFacts: string[];
  citations: string[];
  evidence: string[];
  chronology: string[];
  sourceLineage: string[];
  claimClassifications: string[];
  frozenAt: string | null;
  fingerprint: string;
};

export type EvergreenContentReserveEntry = {
  entryId: string;
  contentOpportunityId: string;
  subject: string;
  tier: ContentPriorityTier;
  researchDepth: string;
  readyForBackfill: boolean;
};

export type EvergreenContentReserve = {
  reserveId: string;
  projectId: string;
  entries: EvergreenContentReserveEntry[];
  updatedAt: string;
};

export type ContentWatchQueueEntry = {
  entryId: string;
  contentOpportunityId: string;
  subject: string;
  watchState: WatchQueueState;
  triggerNotes: string;
};

export type ContentWatchQueue = {
  queueId: string;
  projectId: string;
  entries: ContentWatchQueueEntry[];
  updatedAt: string;
};

export type RapidResponseContentPolicy = {
  policyId: string;
  projectId: string;
  enabled: boolean;
  pipelineStages: string[];
  bypassFactualChecks: false;
  bypassRiskChecks: false;
  founderApprovalRequired: true;
};

export type PlatformNativeFitEvaluation = {
  evaluationId: string;
  expressionId: string;
  dimensions: Record<PlatformNativeFitDimension, 'PASS' | 'FAIL' | 'NOT_EVALUATED'>;
  failureStates: CadenceFailureState[];
  evaluatedAt: string;
};

export type CrossPlatformCharacterFidelityEvaluation = {
  evaluationId: string;
  contentIntelligenceId: string;
  expressionIds: string[];
  characterPreserved: 'PASS' | 'FAIL';
  observationPreserved: 'PASS' | 'FAIL';
  judgmentPreserved: 'PASS' | 'FAIL';
  notes: string[];
  evaluatedAt: string;
};

export type CrossPlatformCopySimilarityEvaluation = {
  evaluationId: string;
  expressionIds: string[];
  similarityScore: number;
  identicalHook: boolean;
  identicalOpening: boolean;
  identicalCaption: boolean;
  failureStates: CadenceFailureState[];
  evaluatedAt: string;
};

export type CrossPlatformVisualSimilarityEvaluation = {
  evaluationId: string;
  expressionIds: string[];
  similarityScore: number;
  unjustifiedCrop: boolean;
  failureStates: CadenceFailureState[];
  evaluatedAt: string;
};

export type DailyEditorialHealthEvaluation = {
  evaluationId: string;
  projectId: string;
  date: string;
  topicRepetition: 'PASS' | 'FAIL';
  behaviorRepetition: 'PASS' | 'FAIL';
  temperatureRepetition: 'PASS' | 'FAIL';
  formatRepetition: 'PASS' | 'FAIL';
  visualRepetition: 'PASS' | 'FAIL';
  failureStates: CadenceFailureState[];
  evaluatedAt: string;
};

export type WeeklyEditorialHealthEvaluation = {
  evaluationId: string;
  projectId: string;
  weekStart: string;
  weekEnd: string;
  topicDiversity: 'PASS' | 'FAIL';
  behavioralRange: 'PASS' | 'FAIL';
  characterRange: 'PASS' | 'FAIL';
  emotionalRange: 'PASS' | 'FAIL';
  channelRange: 'PASS' | 'FAIL';
  platformNativeRange: 'PASS' | 'FAIL';
  cadenceFatigue: ContentFatigueLevel;
  failureStates: CadenceFailureState[];
  evaluatedAt: string;
};

export type ContentFatigueEvaluation = {
  evaluationId: string;
  projectId: string;
  windowStart: string;
  windowEnd: string;
  level: ContentFatigueLevel;
  signals: string[];
  evaluatedAt: string;
};

export type VideoHookRound = {
  roundId: string;
  projectId: string;
  weekStart: string;
  reelExpressionIds: string[];
  hookReviewNotes: string[];
  redundancyFlags: string[];
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'LOCKED';
};

export type WeeklyMarketingProductionBoard = {
  boardId: string;
  projectId: string;
  weekStart: string;
  weekEnd: string;
  viewMode: WeeklyBoardViewMode;
  primaryEventIds: string[];
  dailyMatrixIds: string[];
  storyClusterIds: string[];
  videoHookRoundId: string | null;
  approvalStage: WeeklyApprovalStage | null;
  extendedRoundTypes: ExtendedCampaignRoundType[];
  fingerprint: string;
};

export type ChannelExpressionLearning = {
  learningId: string;
  projectId: string;
  platform: PublishingPlatform;
  surface: PublishingSurface;
  finding: string;
  affectsCharacter: false;
  affectsBrandCanon: false;
  acceptedByFounder: boolean;
  recordedAt: string;
};

export type ContentCostBreakdown = {
  sharedIntelligenceUsd: number;
  feedUsd: number;
  storyUsd: number;
  reelUsd: number;
  tiktokUsd: number;
  shortsUsd: number;
  textUsd: number;
  weeklyEstimateUsd: number;
  /** Baseline rhythm cost — assumes target Reels/week, not max-normal capacity. */
  baselineWeeklyEstimateUsd: number;
  /** Maximum-normal capacity projection — labeled separately, not expected spend. */
  maxNormalWeeklyEstimateUsd: number;
  /** Actual planned cost — optional Reel cost only when approved. */
  actualPlannedWeeklyEstimateUsd: number;
  baselineReelsPerWeek: number;
  maxNormalReelsPerWeek: number;
  approvedSecondReelsPerWeek: number;
  costSemanticLevel: CadenceSemanticLevel;
  multiplicationGuardPass: boolean;
};

export type DailyPublishingCadenceRun = {
  runId: string;
  projectId: string;
  organizationId: string;
  status: 'NOT_STARTED' | 'CONFIGURED' | 'WEEK_PLANNED' | 'IN_PRODUCTION' | 'APPROVED' | 'READY_FOR_HANDOFF';
  publishingCadencePolicy: PublishingCadencePolicy | null;
  derivationPolicy: CrossPlatformDerivationPolicy | null;
  weeklyBoard: WeeklyMarketingProductionBoard | null;
  primaryEvents: DailyPrimaryContentEvent[];
  intelligenceObjects: CrossPlatformContentIntelligence[];
  platformExpressions: PlatformContentExpression[];
  dailyMatrices: DailyCrossPlatformContentMatrix[];
  storyClusters: DailyStoryCluster[];
  videoHookRounds: VideoHookRound[];
  sharedResearchPackages: SharedResearchPackage[];
  evergreenReserve: EvergreenContentReserve | null;
  watchQueue: ContentWatchQueue | null;
  rapidResponsePolicy: RapidResponseContentPolicy | null;
  channelExpressionLearning: ChannelExpressionLearning[];
  costBreakdown: ContentCostBreakdown | null;
  cadenceFulfillmentByDate: Record<string, CadenceFulfillmentState>;
  cadenceFulfillmentEvaluationsByDate: Record<string, CadenceFulfillmentEvaluation>;
  secondReelEligibilityByDate: Record<string, SecondReelEligibilityEvaluation>;
  error: string | null;
  updatedAt: string;
};
