/**
 * P0.5E — Generic marketing campaign production types (brand-agnostic).
 */

import type {
  ASSET_PRODUCTION_STATUSES,
  BOARD_VIEW_MODES,
  CAMPAIGN_FAILURE_STATES,
  CAMPAIGN_PERIOD_STATUSES,
  CLIENT_APPROVAL_STAGES,
  CLIENT_ASSET_JUDGMENTS,
  CLIENT_REVISION_REASONS,
  CONTINUITY_MODES,
  INTERNAL_CREATIVE_JUDGMENTS,
  PRODUCTION_ROUND_STATUSES,
  REOPEN_DOWNSTREAM_EFFECTS,
  SEQUENCE_POSITION_ROLES,
} from './constants.js';

export type AssetProductionStatus = (typeof ASSET_PRODUCTION_STATUSES)[number];
export type CampaignPeriodStatus = (typeof CAMPAIGN_PERIOD_STATUSES)[number];
export type ProductionRoundStatus = (typeof PRODUCTION_ROUND_STATUSES)[number];
export type SequencePositionRole = (typeof SEQUENCE_POSITION_ROLES)[number];
export type ClientApprovalStage = (typeof CLIENT_APPROVAL_STAGES)[number];
export type ClientAssetJudgment = (typeof CLIENT_ASSET_JUDGMENTS)[number];
export type ClientRevisionReason = (typeof CLIENT_REVISION_REASONS)[number];
export type InternalCreativeJudgment = (typeof INTERNAL_CREATIVE_JUDGMENTS)[number];
export type ReopenDownstreamEffect = (typeof REOPEN_DOWNSTREAM_EFFECTS)[number];
export type CampaignFailureState = (typeof CAMPAIGN_FAILURE_STATES)[number];
export type BoardViewMode = (typeof BOARD_VIEW_MODES)[number];
export type ContinuityMode = (typeof CONTINUITY_MODES)[number];

export type CampaignCoherenceModel = {
  verticalCoherence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  horizontalCoherence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  failureStates: CampaignFailureState[];
  evaluatedAt: string | null;
};

export type MarketingCampaignPeriod = {
  id: string;
  projectId: string;
  brandId: string;
  campaignId: string;
  name: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  channelIds: string[];
  contentPieceIds: string[];
  strategyFingerprint: string;
  characterSystemFingerprint: string;
  marketingExpressionFingerprint: string;
  editorialSystemFingerprint: string;
  status: CampaignPeriodStatus;
  planningState: string;
  productionState: string;
  approvalState: string;
  publishingState: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignContentSlateEntry = {
  contentPieceId: string;
  title: string;
  topic: string;
  thesisSummary: string;
  semanticRole: string | null;
  channel: string;
  format: string;
  sequenceLength: number;
  researchDepth: string | null;
  emotionalTemperature: string | null;
  productionStatus: AssetProductionStatus;
  approvalStatus: AssetProductionStatus;
  contentStatus: string;
};

export type CampaignContentSlate = {
  slateId: string;
  campaignId: string;
  entries: CampaignContentSlateEntry[];
  approvedAt: string | null;
  fingerprint: string;
};

export type CampaignProductionAsset = {
  assetId: string;
  campaignId: string;
  contentPieceId: string;
  sequencePosition: number;
  roundId: string | null;
  semanticRole: SequencePositionRole | string;
  status: AssetProductionStatus;
  parentAssetId: string | null;
  contractId: string | null;
  generatedAssetUrl: string | null;
  generatedAssetId: string | null;
  lockedAt: string | null;
  approvedAt: string | null;
  clientJudgment: ClientAssetJudgment | null;
  internalJudgment: InternalCreativeJudgment | null;
  revisionDeltaId: string | null;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignProductionRound = {
  id: string;
  campaignId: string;
  sequencePosition: number;
  label: string;
  eligibleContentPieceIds: string[];
  assetIds: string[];
  status: ProductionRoundStatus;
  startedAt: string | null;
  completedAt: string | null;
  lockedAt: string | null;
  coherenceEvaluation: CampaignCoherenceModel | null;
  reviewStatus: string | null;
};

export type CampaignProductionBoard = {
  boardId: string;
  campaignId: string;
  contentPieceIds: string[];
  maxSequenceDepth: number;
  sequenceDepthByPiece: Record<string, number>;
  assets: CampaignProductionAsset[];
  rounds: CampaignProductionRound[];
  currentRoundSequencePosition: number;
  fingerprint: string;
};

export type SequencePositionInformationBudget = {
  position: number;
  allowedDensity: 'SPARSE' | 'LIGHT' | 'MODERATE' | 'DENSE';
  guidance: string;
};

export type SequenceSlideArtDirectionContract = {
  id: string;
  campaignId: string;
  contentPieceId: string;
  sequencePosition: number;
  semanticRole: SequencePositionRole;
  previousSlideAssetId: string | null;
  nextPlannedRole: SequencePositionRole | null;
  viewerArrivesKnowing: string;
  viewerShouldLearn: string;
  viewerShouldFeel: string;
  viewerShouldNoticeFirst: string;
  viewerShouldWantNext: string;
  informationIntroduced: string[];
  informationDeferred: string[];
  visualSubjectMatterDecisionId: string | null;
  visualParticipationBalance: string | null;
  primaryVisualSubject: string | null;
  supportingVisualSubjects: string[];
  typographicRoles: string[];
  continuityRequirements: string[];
  variationRequirements: string[];
  mustPreserveFromPrevious: string[];
  mustChangeFromPrevious: string[];
  mustNotRepeat: string[];
  density: string;
  emotionalTemperature: string;
  referenceConditioningRole: typeof import('./constants.js').REFERENCE_CONDITIONING_ROLE | null;
  generationContractId: string | null;
  status: AssetProductionStatus;
  fingerprint: string;
};

export type ClientMarketingApproval = {
  approvalId: string;
  campaignId: string;
  stage: ClientApprovalStage;
  targetId: string;
  judgment: ClientAssetJudgment | 'APPROVE_ROUND' | 'APPROVE_CAMPAIGN' | 'REQUEST_ROUND_REVISION' | 'REQUEST_CAMPAIGN_REVISION';
  revisionReason: ClientRevisionReason | null;
  feedback: string | null;
  actor: string;
  createdAt: string;
};

export type MarketingAssetRevisionDelta = {
  deltaId: string;
  assetId: string;
  parentAssetId: string;
  preserve: string[];
  change: string[];
  remove: string[];
  introduce: string[];
  doNotBecome: string[];
  reason: string;
  reviewer: string;
  createdAt: string;
};

export type AssetReopenEvent = {
  eventId: string;
  assetId: string;
  roundId: string | null;
  reason: string;
  actor: string;
  downstreamEffect: ReopenDownstreamEffect;
  affectedDependencyIds: string[];
  preservedAssetId: string;
  childAssetId: string;
  createdAt: string;
};

export type CampaignApprovalSnapshot = {
  snapshotId: string;
  campaignId: string;
  strategyFingerprint: string;
  slateFingerprint: string;
  characterSystemFingerprint: string;
  marketingExpressionFingerprint: string;
  assetFingerprints: Record<string, string>;
  approvedAt: string;
  frozen: true;
};

export type CampaignRhythmEvaluation = {
  evaluationId: string;
  campaignId: string;
  contentRhythm: 'PASS' | 'FAIL';
  visualRhythm: 'PASS' | 'FAIL';
  densityRhythm: 'PASS' | 'FAIL';
  emotionalRhythm: 'PASS' | 'FAIL';
  culturalRhythm: 'PASS' | 'FAIL';
  humanPresenceRhythm: 'PASS' | 'FAIL';
  formatRhythm: 'PASS' | 'FAIL';
  artisticRhythm: 'PASS' | 'FAIL';
  characterRhythm: 'PASS' | 'FAIL';
  failureStates: CampaignFailureState[];
  evaluatedAt: string;
};

export type CompleteSocialContentPackage = {
  packageId: string;
  contentPieceId: string;
  campaignId: string;
  thesisSummary: string;
  editorialDecisionId: string | null;
  visualSequenceAssetIds: string[];
  caption: string | null;
  cta: string | null;
  altText: string | null;
  channel: string;
  format: string;
  approvalIds: string[];
  lineageFingerprint: string;
  publishingReadiness: 'NOT_READY' | 'READY_FOR_PUBLISHING_APPROVAL';
  createdAt: string;
};

export type MarketingCampaignProductionRun = {
  runId: string;
  projectId: string;
  campaign: MarketingCampaignPeriod | null;
  slate: CampaignContentSlate | null;
  board: CampaignProductionBoard | null;
  sequenceContracts: SequenceSlideArtDirectionContract[];
  approvals: ClientMarketingApproval[];
  revisionDeltas: MarketingAssetRevisionDelta[];
  reopenEvents: AssetReopenEvent[];
  snapshots: CampaignApprovalSnapshot[];
  completePackages: CompleteSocialContentPackage[];
  rhythmEvaluation: CampaignRhythmEvaluation | null;
  accounting: {
    anthropicRequests: number;
    anthropicEstimatedCostUsd: number;
    falRequests: number;
    falEstimatedCostUsd: number;
    falActualCostUsd: number;
    revisionCostUsd: number;
    campaignTotalUsd: number;
  };
  status: 'NOT_STARTED' | 'INITIALIZED' | 'IN_PRODUCTION' | 'ROUND_LOCKED' | 'APPROVED' | 'FAILED';
  error: string | null;
  updatedAt: string;
};
