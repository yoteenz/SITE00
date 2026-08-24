/**
 * P0.5D.1 — Live Cultural Intelligence types (brand-agnostic).
 */

import type {
  BRAND_RELEVANCE_DECISIONS,
  CONNECTOR_STATUSES,
  CULTURAL_MEMORY_MATCH_TYPES,
  CURRENT_CLAIM_CLASSES,
  CURRENT_VISUAL_EVIDENCE_CLASSES,
  EDITORIAL_WHITESPACE_OUTCOMES,
  EXPECTED_ATTENTION_LEVELS,
  FORECAST_CONFIDENCE_LEVELS,
  FORECAST_OUTCOME_RESULTS,
  FRESHNESS_STATES,
  INTELLIGENCE_FAILURE_STATES,
  LIVE_WATCH_QUEUE_STATES,
  NOTIFICATION_CANDIDATE_TYPES,
  OPPORTUNITY_ORIGINS,
  RAPID_RESPONSE_STATES,
  REFRESH_MODES,
  SIGNAL_DUPLICATE_CLASSES,
  SIGNAL_ORIGINS,
  SIGNAL_SOURCE_TYPES,
  SLATE_COMPOSITION_TYPES,
  TEMPORAL_CLASSES,
  TREND_LIFECYCLE_STATES,
  WHY_NOW_RESULTS,
} from './constants.js';

export type SignalOrigin = (typeof SIGNAL_ORIGINS)[number];
export type SignalSourceType = (typeof SIGNAL_SOURCE_TYPES)[number];
export type ConnectorStatus = (typeof CONNECTOR_STATUSES)[number];
export type TrendLifecycleState = (typeof TREND_LIFECYCLE_STATES)[number];
export type ForecastConfidenceLevel = (typeof FORECAST_CONFIDENCE_LEVELS)[number];
export type ExpectedAttentionLevel = (typeof EXPECTED_ATTENTION_LEVELS)[number];
export type TemporalClass = (typeof TEMPORAL_CLASSES)[number];
export type WhyNowResult = (typeof WHY_NOW_RESULTS)[number];
export type FreshnessState = (typeof FRESHNESS_STATES)[number];
export type CurrentClaimClass = (typeof CURRENT_CLAIM_CLASSES)[number];
export type BrandRelevanceDecision = (typeof BRAND_RELEVANCE_DECISIONS)[number];
export type EditorialWhitespaceOutcome = (typeof EDITORIAL_WHITESPACE_OUTCOMES)[number];
export type CulturalMemoryMatchType = (typeof CULTURAL_MEMORY_MATCH_TYPES)[number];
export type SignalDuplicateClass = (typeof SIGNAL_DUPLICATE_CLASSES)[number];
export type LiveWatchQueueState = (typeof LIVE_WATCH_QUEUE_STATES)[number];
export type RapidResponseState = (typeof RAPID_RESPONSE_STATES)[number];
export type OpportunityOrigin = (typeof OPPORTUNITY_ORIGINS)[number];
export type SlateCompositionType = (typeof SLATE_COMPOSITION_TYPES)[number];
export type ForecastOutcomeResult = (typeof FORECAST_OUTCOME_RESULTS)[number];
export type NotificationCandidateType = (typeof NOTIFICATION_CANDIDATE_TYPES)[number];
export type RefreshMode = (typeof REFRESH_MODES)[number];
export type CurrentVisualEvidenceClass = (typeof CURRENT_VISUAL_EVIDENCE_CLASSES)[number];
export type IntelligenceFailureState = (typeof INTELLIGENCE_FAILURE_STATES)[number];

export type SignalSourceReceipt = {
  provider: string;
  source: string;
  retrievedAt: string;
  query: string | null;
  resultCount: number;
  freshness: FreshnessState;
  status: ConnectorStatus;
  costUsd: number;
  limitations: string[];
};

export type SignalSourceAdapter = {
  adapterId: string;
  provider: string;
  sourceFamily: string;
  status: ConnectorStatus;
  lastCheckedAt: string | null;
  nextRecommendedCheck: string | null;
  refreshMode: RefreshMode;
  receipt: SignalSourceReceipt | null;
};

export type LiveWorldSignal = {
  id: string;
  projectId: string;
  brandId: string;
  capturedAt: string;
  observedAt: string;
  sourceIds: string[];
  sourceType: SignalSourceType;
  signalType: string;
  title: string;
  summary: string;
  rawContext: string;
  entities: string[];
  keywords: string[];
  domains: string[];
  communities: string[];
  geography: string[];
  platforms: string[];
  eventDate: string | null;
  eventStart: string | null;
  eventEnd: string | null;
  signalOrigin: SignalOrigin;
  velocity: number;
  momentum: number;
  novelty: number;
  saturation: number;
  sourceDiversity: number;
  sourceConfidence: number;
  culturalReach: number;
  audienceRelevance: number;
  historicalContextIds: string[];
  relatedSignalIds: string[];
  verificationState: 'UNVERIFIED' | 'PARTIAL' | 'CORROBORATED';
  freshnessState: FreshnessState;
  lifecycleState: TrendLifecycleState;
  clusterId: string | null;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type TrendLifecycleTransition = {
  from: TrendLifecycleState | null;
  to: TrendLifecycleState;
  observedAt: string;
  reason: string;
};

export type TrendLifecycleEvaluation = {
  signalId: string;
  currentState: TrendLifecycleState;
  history: TrendLifecycleTransition[];
  velocity: number;
  acceleration: number;
  sourceDiversity: number;
  saturation: number;
  editorialWhitespace: EditorialWhitespaceOutcome;
  evaluatedAt: string;
};

export type ForecastConfidence = {
  level: ForecastConfidenceLevel;
  evidence: string[];
  reasoningSummary: string;
  uncertainties: string[];
  whatWouldChangeForecast: string[];
};

export type UpcomingCulturalMoment = {
  id: string;
  projectId: string;
  name: string;
  category: SignalSourceType;
  startAt: string;
  endAt: string;
  certainty: ForecastConfidenceLevel;
  expectedAttention: ExpectedAttentionLevel;
  expectedAudienceOverlap: number;
  expectedConversationWindow: string;
  preEventOpportunity: boolean;
  liveEventOpportunity: boolean;
  postEventOpportunity: boolean;
  callbackOpportunity: boolean;
  preResearchDeadline: string | null;
  recommendedPreparationWindow: string | null;
  liveMonitoringRecommended: boolean;
  rapidResponseEligible: boolean;
  knownContext: string[];
  historicalContext: string[];
  possibleBrandRelevance: string[];
  fingerprint: string;
};

export type TemporalRelevanceEvaluation = {
  id: string;
  signalId: string;
  whyNow: string;
  relevanceStart: string;
  idealPublishStart: string;
  idealPublishEnd: string;
  relevanceDecay: string;
  expirationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  latePublishingPenalty: string | null;
  evergreenAfterWindow: boolean;
  reactivationConditions: string[];
  temporalClass: TemporalClass;
  evaluatedAt: string;
};

export type WhyNowEvaluation = {
  id: string;
  signalId: string;
  whatChanged: string;
  whyRelevantNow: string;
  attentionDriver: string;
  usefulPublishingWindow: string;
  ifWeWait: string;
  interestingAfterTrend: boolean;
  result: WhyNowResult;
  evaluatedAt: string;
};

export type CurrentVisualEvidenceCandidate = {
  candidateId: string;
  evidenceClass: CurrentVisualEvidenceClass;
  description: string;
  sourceReference: string;
  usageStatus: 'LICENSED' | 'PUBLIC_DOMAIN' | 'FAIR_USE_CANDIDATE' | 'RESTRICTED' | 'GENERATED_INTERPRETATION';
  provenanceRequired: true;
};

export type CurrentClaimEvaluation = {
  claim: string;
  classification: CurrentClaimClass;
  sourceIds: string[];
  reasoning: string;
};

export type CurrentIntelligencePackage = {
  id: string;
  projectId: string;
  signalIds: string[];
  clusterId: string | null;
  primarySources: string[];
  secondarySources: string[];
  sourceDates: string[];
  retrievedAt: string;
  verifiedFacts: string[];
  unverifiedClaims: string[];
  disputedClaims: string[];
  unknowns: string[];
  currentDataPoints: string[];
  historicalDataPoints: string[];
  historicalComparisons: string[];
  relevantPeople: string[];
  relevantOrganizations: string[];
  relevantEvents: string[];
  relevantCulturalReferences: string[];
  whatChanged: string;
  whyNow: string;
  conversationContext: string;
  dominantNarratives: string[];
  minorityOrContrarianNarratives: string[];
  commonMisunderstandings: string[];
  possibleConnections: string[];
  visualEvidenceCandidates: CurrentVisualEvidenceCandidate[];
  archivalEvidenceCandidates: string[];
  dataVisualizationCandidates: string[];
  claimEvaluations: CurrentClaimEvaluation[];
  freshnessEvaluation: FreshnessState;
  confidenceEvaluation: ForecastConfidence;
  riskFlags: IntelligenceFailureState[];
  fingerprint: string;
};

export type BrandSignalInterpretation = {
  id: string;
  brandId: string;
  signalId: string;
  intelligencePackageId: string;
  naturalInterest: number;
  audienceInterest: number;
  characterFit: number;
  editorialFit: number;
  knowledgeFit: number;
  culturalFit: number;
  hasDistinctiveObservation: boolean;
  hasDistinctiveJudgment: boolean;
  hasUsefulConnection: boolean;
  hasHistoricalCallback: boolean;
  hasContradiction: boolean;
  hasReceipts: boolean;
  hasData: boolean;
  hasVisualPotential: boolean;
  hasHumorPotential: boolean;
  hasTeachingPotential: boolean;
  hasConversationPotential: boolean;
  wouldBrandCareWithoutTrend: boolean;
  trendDependencyRisk: number;
  forcedParticipationRisk: number;
  recommendedBehavior: string | null;
  reasoning: string;
  rejectionReason: string | null;
  decision: BrandRelevanceDecision;
  evaluatedAt: string;
};

export type CulturalMemoryMatch = {
  id: string;
  signalId: string;
  matchType: CulturalMemoryMatchType;
  evidenceReference: string;
  priorContentId: string | null;
  priorSignalId: string | null;
  description: string;
  confidence: number;
  evaluatedAt: string;
};

export type EditorialWhitespaceEvaluation = {
  signalId: string;
  outcome: EditorialWhitespaceOutcome;
  dominantNarrativeCount: number;
  distinctiveAngleExists: boolean;
  newEvidenceExists: boolean;
  reasoning: string;
  evaluatedAt: string;
};

export type CulturalWeatherPattern = {
  id: string;
  projectId: string;
  pattern: string;
  supportingSignalIds: string[];
  firstObserved: string;
  confidence: ForecastConfidenceLevel;
  crossDomainStrength: number;
  possibleInterpretations: string[];
  brandRelevance: string[];
  counterEvidence: string[];
  fingerprint: string;
};

export type SignalCluster = {
  id: string;
  projectId: string;
  primarySignalId: string;
  signalIds: string[];
  sourceIds: string[];
  entities: string[];
  topic: string;
  firstObserved: string;
  lastUpdated: string;
  currentLifecycle: TrendLifecycleState;
  majorDevelopments: string[];
  contradictions: string[];
  openQuestions: string[];
  fingerprint: string;
};

export type SignalDuplicateEvaluation = {
  signalAId: string;
  signalBId: string;
  classification: SignalDuplicateClass;
  syndicated: boolean;
  reasoning: string;
};

export type LiveWatchQueueEntry = {
  entryId: string;
  signalId: string;
  clusterId: string | null;
  subject: string;
  watchState: LiveWatchQueueState;
  triggerNotes: string;
  conditionalReassessment: string[];
  stateHistory: Array<{ state: LiveWatchQueueState; at: string; note: string }>;
  contentOpportunityId: string | null;
  updatedAt: string;
};

export type LiveWatchQueue = {
  queueId: string;
  projectId: string;
  entries: LiveWatchQueueEntry[];
  updatedAt: string;
};

export type EditorialFlexCapacity = {
  plannedCapacity: number;
  reservedCapacity: number;
  rapidResponseCapacity: number;
  unallocatedCapacity: number;
  replacementRules: string[];
};

export type WeeklyCulturalForecast = {
  forecastId: string;
  projectId: string;
  weekStart: string;
  weekEnd: string;
  knownMoments: UpcomingCulturalMoment[];
  acceleratingConversations: LiveWorldSignal[];
  culturalWeather: CulturalWeatherPattern[];
  newDataResearch: LiveWorldSignal[];
  callbackWindows: CulturalMemoryMatch[];
  watchlist: LiveWatchQueueEntry[];
  brandOpportunities: BrandSignalInterpretation[];
  saturatedSkip: BrandSignalInterpretation[];
  expiringWindows: TemporalRelevanceEvaluation[];
  openCapacity: EditorialFlexCapacity;
  notificationCandidates: NotificationCandidateType[];
  fingerprint: string;
  generatedAt: string;
};

export type ForecastOutcome = {
  forecastId: string;
  momentId: string | null;
  signalId: string | null;
  forecastedLifecycle: TrendLifecycleState;
  actualLifecycle: TrendLifecycleState | null;
  forecastedPeak: string | null;
  observedPeak: string | null;
  forecastedBrandRelevance: BrandRelevanceDecision;
  actualEditorialUsefulness: 'USEFUL' | 'NOT_USEFUL' | 'UNKNOWN';
  result: ForecastOutcomeResult;
  evaluatedAt: string;
};

export type LiveCulturalIntelligenceRun = {
  runId: string;
  projectId: string;
  organizationId: string;
  status: 'NOT_STARTED' | 'CONFIGURED' | 'SIGNALS_LOADED' | 'FORECAST_READY' | 'OPPORTUNITIES_PROMOTED';
  sourceAdapters: SignalSourceAdapter[];
  signals: LiveWorldSignal[];
  clusters: SignalCluster[];
  lifecycleEvaluations: TrendLifecycleEvaluation[];
  upcomingMoments: UpcomingCulturalMoment[];
  weeklyForecast: WeeklyCulturalForecast | null;
  intelligencePackages: CurrentIntelligencePackage[];
  brandInterpretations: BrandSignalInterpretation[];
  culturalMemoryMatches: CulturalMemoryMatch[];
  watchQueue: LiveWatchQueue | null;
  flexCapacity: EditorialFlexCapacity | null;
  forecastOutcomes: ForecastOutcome[];
  notificationCandidates: Array<{ type: NotificationCandidateType; signalId: string; at: string }>;
  refreshMode: RefreshMode;
  lastCheckedAt: string | null;
  nextRecommendedCheck: string | null;
  accounting: {
    anthropicRequests: number;
    searchSourceRequests: number;
    falRequests: number;
    estimatedCostUsd: number;
  };
  error: string | null;
  updatedAt: string;
};

export type ClientIntelligenceConfiguration = {
  configId: string;
  projectId: string;
  signalDomains: SignalSourceType[];
  geographicRelevance: string[];
  culturalContext: string[];
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  responseSpeed: 'STANDARD' | 'RAPID_WHERE_SUPPORTED';
  forecastHorizonDays: number;
  excludedDomains: SignalSourceType[];
  approvalRequired: true;
};
