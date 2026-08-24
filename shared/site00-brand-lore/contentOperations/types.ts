/**
 * P0.5D — Content Operations types
 */

import type {
  AUDIENCE_RESPONSE_TYPES,
  CALENDAR_STATUSES,
  CAPTION_STYLES,
  CLAIM_CONFIDENCE,
  CLAIM_STATUSES,
  CONNECTOR_CAPABILITY,
  CONTENT_CHANNELS,
  CONTENT_FORMATS,
  CONTENT_SELECTION_STATUSES,
  CTA_OPTIONS,
  DEFAULT_OPERATING_MODE,
  EVIDENCE_CLASSES,
  EVIDENCE_LINEAGE,
  LEARNING_CONFIDENCE,
  OPERATING_MODES,
  OPPORTUNITY_FIT_RESULTS,
  OPPORTUNITY_SOURCE_TYPES,
  PERFORMANCE_EVIDENCE_CLASSES,
  PUBLISH_HANDOFF_STATUSES,
  RESEARCH_DEPTHS,
  RISK_LEVELS,
  SIMILARITY_RESULTS,
} from './constants.js';
import type { MarketingCharacterEvent, MarketingContentThesis } from '../brandMarketingExpression/types.js';

export type OperatingMode = (typeof OPERATING_MODES)[number];
export type OpportunitySourceType = (typeof OPPORTUNITY_SOURCE_TYPES)[number];
export type OpportunityFitResult = (typeof OPPORTUNITY_FIT_RESULTS)[number];
export type ContentSelectionStatus = (typeof CONTENT_SELECTION_STATUSES)[number];
export type SimilarityResult = (typeof SIMILARITY_RESULTS)[number];
export type ResearchDepth = (typeof RESEARCH_DEPTHS)[number];
export type ClaimConfidence = (typeof CLAIM_CONFIDENCE)[number];
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];
export type EvidenceLineage = (typeof EVIDENCE_LINEAGE)[number];
export type ContentChannel = (typeof CONTENT_CHANNELS)[number];
export type ContentFormat = (typeof CONTENT_FORMATS)[number];
export type CalendarStatus = (typeof CALENDAR_STATUSES)[number];
export type PublishHandoffStatus = (typeof PUBLISH_HANDOFF_STATUSES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type LearningConfidenceLevel = (typeof LEARNING_CONFIDENCE)[number];
export type PerformanceEvidenceClass = (typeof PERFORMANCE_EVIDENCE_CLASSES)[number];
export type ConnectorCapability = (typeof CONNECTOR_CAPABILITY)[number];
export type CtaOption = (typeof CTA_OPTIONS)[number];
export type CaptionStyle = (typeof CAPTION_STYLES)[number];
export type AudienceResponseType = (typeof AUDIENCE_RESPONSE_TYPES)[number];

export type ContentOperationsSystem = {
  id: string;
  projectId: string;
  brandId: string;
  brandCharacterSystemId: string;
  marketingExpressionSystemId: string;
  version: number;
  status: 'DRAFT' | 'COMPILED' | 'FOUNDER_REVIEWED' | 'APPROVED';
  operatingMode: typeof DEFAULT_OPERATING_MODE | OperatingMode;
  editorialStrategyId: string;
  opportunityPolicyId: string;
  approvalPolicyId: string;
  channelPolicyId: string;
  performanceLearningPolicyId: string;
  activeChannels: ContentChannel[];
  contentCadenceRules: string[];
  editorialBalanceRules: string[];
  riskRules: string[];
  costRules: string[];
  productionState: Record<string, unknown>;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type ContentOpportunity = {
  id: string;
  projectId: string;
  sourceType: OpportunitySourceType;
  sourceReference: string | null;
  subject: string;
  summary: string;
  whyPotentiallyInteresting: string;
  observedAt: string;
  freshness: 'HIGH' | 'MEDIUM' | 'LOW';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  domains: string[];
  entities: string[];
  themes: string[];
  evidenceAvailable: string[];
  evidenceNeeded: string[];
  characterFit: OpportunityFitResult | null;
  brandRelevance: number;
  audienceRelevance: number;
  novelty: number;
  timeliness: number;
  depthPotential: number;
  humorPotential: number;
  culturalPotential: number;
  investigationPotential: number;
  risk: RiskLevel;
  duplicateSimilarity: SimilarityResult | null;
  priorCoverageIds: string[];
  rank: ContentOpportunityRank | null;
  selectionStatus: ContentSelectionStatus | null;
  status: 'DISCOVERED' | 'EVALUATED' | 'SELECTED' | 'REJECTED' | 'ARCHIVED';
  fingerprint: string;
};

export type ContentOpportunityRank = {
  opportunityId: string;
  dimensions: Record<string, number>;
  compositeScore: number;
  whyHighPriority: string[];
  explainability: string;
  rankedAt: string;
};

export type NDXEditorialStrategy = {
  id: string;
  projectId: string;
  desiredRange: string[];
  balanceGuidance: string[];
  avoidOverindexing: string[];
  fingerprint: string;
};

export type ContentMemoryIndex = {
  indexId: string;
  projectId: string;
  coveredTopics: string[];
  priorClaims: string[];
  questionedTopics: string[];
  investigatedTopics: string[];
  jokesUsed: string[];
  revisedClaims: string[];
  promisedRevisits: string[];
  unresolvedThreads: string[];
  savedForLater: string[];
  publishedIds: string[];
  retiredIds: string[];
  updatedAt: string;
};

export type EditorialSlate = {
  slateId: string;
  projectId: string;
  windowType: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  dateRange: { start: string; end: string };
  status: 'DRAFT' | 'PROPOSED' | 'FOUNDER_REVIEW' | 'APPROVED' | 'IN_PRODUCTION' | 'COMPLETE';
  contentCandidates: SlateCandidate[];
  channelDistribution: Record<string, number>;
  behavioralBalance: Record<string, number>;
  topicBalance: Record<string, number>;
  temperatureBalance: Record<string, number>;
  formatBalance: Record<string, number>;
  productionCostEstimate: number;
  riskSummary: string;
  founderJudgment: string | null;
  fingerprint: string;
};

export type SlateCandidate = {
  opportunityId: string;
  characterEventId: string | null;
  contentThesisId: string | null;
  channel: ContentChannel;
  format: ContentFormat;
  behavioralModeId: string | null;
  researchDepth: ResearchDepth;
  estimatedCost: number;
};

export type ContentChannelDecision = {
  opportunityId: string;
  channel: ContentChannel;
  reasoning: string[];
  alternativesConsidered: ContentChannel[];
};

export type ContentFormatDecision = {
  opportunityId: string;
  format: ContentFormat;
  reasoning: string[];
  resolutionStateInfluence: string;
};

export type ContentEvidenceRequirement = {
  thesisId: string;
  requiredEvidence: EvidenceClass[];
  supportingEvidence: EvidenceClass[];
  optionalEvidence: EvidenceClass[];
  unverifiedClaims: string[];
  evidenceLineage: EvidenceLineage[];
};

export type ContentClaimRecord = {
  claimId: string;
  text: string;
  claimStatus: ClaimStatus;
  confidence: ClaimConfidence;
  evidenceIds: string[];
};

export type NDXReelExpressionContract = {
  packageId: string;
  structure: string[];
  beats: string[];
  mustNotBeCarouselAnimation: true;
  supportedMedia: string[];
};

export type NDXStoryExpressionContract = {
  packageId: string;
  mode: string;
  resolutionExpectation: string;
  mustNotBeCompressedFeed: true;
};

export type NDXCaptionContract = {
  packageId: string;
  style: CaptionStyle;
  text: string;
  derivedFrom: string[];
};

export type ContentCTAPolicy = {
  packageId: string;
  cta: CtaOption;
  reasoning: string;
};

export type ContentApprovalPolicy = {
  id: string;
  projectId: string;
  requiresFounderApproval: true;
  opportunityApproval: 'OPTIONAL';
  slateApproval: 'REQUIRED';
  finalContentApproval: 'REQUIRED';
  publishApproval: 'REQUIRED';
  autonomousPublishingEnabled: false;
};

export type ContentRiskEvaluation = {
  evaluationId: string;
  contentId: string;
  factualRisk: RiskLevel;
  legalRisk: RiskLevel;
  reputationalRisk: RiskLevel;
  culturalSensitivity: RiskLevel;
  namedPersonRisk: RiskLevel;
  financialAdviceRisk: RiskLevel;
  copyrightRisk: RiskLevel;
  overallRisk: RiskLevel;
  notes: string[];
  evaluatedAt: string;
};

export type SocialContentPackage = {
  id: string;
  projectId: string;
  opportunityId: string;
  characterEventId: string;
  contentThesisId: string;
  channel: ContentChannel;
  format: ContentFormat;
  coverArtifactId: string | null;
  sequencePlan: CarouselSequencePlan | null;
  caption: NDXCaptionContract | null;
  storyCopy: string[];
  reelContract: NDXReelExpressionContract | null;
  storyContract: NDXStoryExpressionContract | null;
  onScreenCopy: string[];
  voiceoverScript: string | null;
  cta: ContentCTAPolicy | null;
  altText: string | null;
  metadata: Record<string, unknown>;
  sourceLinks: string[];
  evidenceManifest: ContentEvidenceRequirement | null;
  claimClassifications: ContentClaimRecord[];
  factCheckStatus: 'PASS' | 'REVIEW' | 'BLOCKED';
  riskStatus: ContentRiskEvaluation | null;
  assets: string[];
  generationReceipts: string[];
  calendarStatus: CalendarStatus;
  status: 'DRAFT' | 'FORMULATED' | 'GENERATING' | 'FOUNDER_REVIEW' | 'APPROVED' | 'SCHEDULED' | 'PUBLISHED';
  founderJudgment: string | null;
  fingerprint: string;
  editorialDecisionId?: string | null;
  firstSlideContractId?: string | null;
  carouselArchitectureId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CarouselSequencePlan = {
  packageId: string;
  usesSequenceCreativeSystem: true;
  firstSlideRole: 'HOOK_CHARACTER_EVENT';
  middleRoles: string[];
  endRole: string;
  frameCount: number;
  sequenceCreativeSystemId: string | null;
  sequenceThesis?: string;
  sequenceArc?: string;
  slideRoles?: string[];
  informationDisclosureMap?: import('../editorialInformationArchitecture/types.js').InformationDisclosureEntry[];
  slideContracts?: import('../editorialInformationArchitecture/types.js').CarouselSlideContract[];
  editorialDecisionId?: string;
  firstSlideContractId?: string;
};

export type PublishingHandoffPackage = {
  handoffId: string;
  contentPackageId: string;
  channel: ContentChannel;
  account: string;
  scheduledTime: string | null;
  assets: string[];
  caption: string;
  metadata: Record<string, unknown>;
  approvalRecord: string;
  status: PublishHandoffStatus;
  connectorCapability: ConnectorCapability;
};

export type ContentCalendarEntry = {
  entryId: string;
  projectId: string;
  contentPackageId: string;
  scheduledDate: string | null;
  status: CalendarStatus;
  channel: ContentChannel;
  format: ContentFormat;
  subject: string;
};

export type ContentPerformanceRecord = {
  recordId: string;
  contentPackageId: string;
  platform: string;
  publishedAt: string;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  profileVisits: number | null;
  follows: number | null;
  linkClicks: number | null;
  watchTime: number | null;
  completionRate: number | null;
  swipeRate: number | null;
  storyReplies: number | null;
  metricAvailability: Record<string, boolean>;
  rawPlatformPayload: Record<string, unknown> | null;
  collectedAt: string;
};

export type AudienceResponseEvidence = {
  evidenceId: string;
  contentPackageId: string;
  source: 'COMMENT' | 'DM' | 'REPLY' | 'QUOTE' | 'SHARE_CONTEXT' | 'FOUNDER_OBSERVATION' | 'COMMUNITY_REACTION';
  text: string;
  classifications: AudienceResponseType[];
  observedAt: string;
};

export type ContentPerformanceLearning = {
  learningId: string;
  projectId: string;
  sourceContentIds: string[];
  evidenceWindow: { start: string; end: string };
  observedPatterns: string[];
  confidence: LearningConfidenceLevel;
  sampleSize: number;
  limitations: string[];
  behavioralModeSignals: string[];
  topicSignals: string[];
  formatSignals: string[];
  channelSignals: string[];
  visualSignals: string[];
  timingSignals: string[];
  audienceSignals: string[];
  recommendedProductionAdjustments: string[];
  doNotInfer: string[];
  founderAccepted: boolean;
  status: 'DRAFT' | 'PROPOSED' | 'FOUNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
  evaluatedAt: string;
};

export type ContentExperiment = {
  experimentId: string;
  projectId: string;
  hypothesis: string;
  dimension: string;
  control: string;
  variant: string;
  metrics: string[];
  timeWindow: { start: string; end: string };
  result: string | null;
  confidence: LearningConfidenceLevel;
  protectedDimensions: string[];
};

export type EditorialHealthEvaluation = {
  evaluationId: string;
  projectId: string;
  windowStart: string;
  windowEnd: string;
  topicDiversity: 'PASS' | 'FAIL';
  behavioralRange: 'PASS' | 'FAIL';
  temperatureRange: 'PASS' | 'FAIL';
  formatRange: 'PASS' | 'FAIL';
  visualRange: 'PASS' | 'FAIL';
  flags: string[];
  evaluatedAt: string;
};

export type ContentProductionBudget = {
  budgetId: string;
  projectId: string;
  period: { start: string; end: string };
  projectLimitUsd: number;
  slateLimitUsd: number;
  packageLimitUsd: number;
  anthropicSpentUsd: number;
  falSpentUsd: number;
  otherSpentUsd: number;
  remainingUsd: number;
};

export type SocialConnectorCapability = {
  platform: string;
  publish: ConnectorCapability;
  schedule: ConnectorCapability;
  fetchMetrics: ConnectorCapability;
  fetchComments: ConnectorCapability;
};

export type NdxbookMarketTest01 = {
  testId: string;
  projectId: string;
  status: 'NOT_STARTED' | 'CONFIGURED' | 'SLATE_APPROVED' | 'IN_PRODUCTION' | 'PUBLISHING' | 'LEARNING' | 'COMPLETE';
  startDate: string | null;
  durationDays: number;
  channels: ContentChannel[];
  feedArtifactTarget: number;
  storyUnitTarget: number;
  reelConceptTarget: number;
  testObjective: string;
  slateId: string | null;
  error: string | null;
};

export type ContentOperationsForensicAudit = {
  auditId: string;
  projectId: string;
  classifications: Record<string, 'AUTHORITATIVE' | 'INTEGRATED' | 'PARTIAL' | 'SCAFFOLDED' | 'LEGACY' | 'DEPRECATED' | 'OVERLAPPING' | 'MISSING'>;
  experimentFRelationship: string;
  sequenceCreativeRelationship: string;
  liveSignalIngestion: 'NOT_CONNECTED';
  duplicatesDetected: string[];
  historicalRecordsMutated: false;
  auditedAt: string;
};

export type ContentOperationsRun = {
  runId: string;
  projectId: string;
  organizationId: string;
  status:
    | 'NOT_STARTED'
    | 'AUDITED'
    | 'COMPILED'
    | 'OPPORTUNITIES_READY'
    | 'SLATE_PROPOSED'
    | 'IN_PRODUCTION'
    | 'MARKET_TEST_ACTIVE'
    | 'LEARNING'
    | 'FAILED';
  brandCharacterSystemId: string | null;
  marketingExpressionSystemId: string | null;
  preconditionsMet: boolean;
  forensicAudit: ContentOperationsForensicAudit | null;
  operationsSystem: ContentOperationsSystem | null;
  editorialStrategy: NDXEditorialStrategy | null;
  editorialMemory: ContentMemoryIndex | null;
  approvalPolicy: ContentApprovalPolicy | null;
  opportunities: ContentOpportunity[];
  activeSlate: EditorialSlate | null;
  contentPackages: SocialContentPackage[];
  calendar: ContentCalendarEntry[];
  publishingHandoffs: PublishingHandoffPackage[];
  performanceRecords: ContentPerformanceRecord[];
  audienceResponses: AudienceResponseEvidence[];
  performanceLearning: ContentPerformanceLearning[];
  contentExperiments: ContentExperiment[];
  editorialHealth: EditorialHealthEvaluation | null;
  productionBudget: ContentProductionBudget | null;
  marketTest01: NdxbookMarketTest01 | null;
  connectorCapabilities: SocialConnectorCapability[];
  error: string | null;
  accounting: {
    anthropicRequests: number;
    anthropicEstimatedCostUsd: number;
    falRequests: number;
    falEstimatedCostUsd: number;
    falActualCostUsd: number;
  };
  updatedAt: string;
};

export type CharacterEventFromOpportunity = MarketingCharacterEvent & {
  opportunityId: string;
  whatNdxSaw: string;
  whatNdxMightBeWrongAbout: string | null;
  whatNdxDoesNext: string;
};

export type ContentThesisFromOpportunity = MarketingContentThesis & {
  opportunityId: string;
  researchDepth: ResearchDepth;
  claimRecords: ContentClaimRecord[];
};
