/**
 * SITE 00 EVOLVE — Operations Intelligence domain types.
 * Dependency-free; safe for client + server import.
 */

export type EvolveDeliveryMode = 'SELF_DIRECTED' | 'SITE00_DIRECTED';

export type EvolveServicePackageId =
  | 'EVOLVE_SOLO'
  | 'EVOLVE_STUDIO'
  | 'EVOLVE_PRO'
  | 'PROJECT_PASS'
  | 'AGENCY_ENTERPRISE'
  | 'DISCOVERY_SPRINT'
  | 'DIRECTED_BUILD'
  | 'GROWTH_PARTNER'
  | 'MARKETING_RETAINER'
  | 'CUSTOM_AGENCY';

export type EvolveSpendHealthState = 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'LIMIT_REACHED' | 'SPEND_BLOCKED';

export type EvolveOperationalHealth =
  | 'ON_TRACK'
  | 'WAITING_ON_CLIENT'
  | 'WAITING_ON_SITE00'
  | 'SYSTEM_BLOCKED'
  | 'AT_RISK'
  | 'STALLED'
  | 'COMPLETE';

export type EvolveFailureClass =
  | 'TECHNICAL_TRANSIENT'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_REJECTION'
  | 'MALFORMED_REQUEST'
  | 'BAD_CROP'
  | 'REFERENCE_MISMATCH'
  | 'ASSET_MISMATCH'
  | 'VISUAL_FIDELITY_FAILURE'
  | 'WRONG_BRAND_CONTEXT'
  | 'CREATIVE_SIMILARITY_FAILURE'
  | 'INSUFFICIENT_CREDITS'
  | 'MISSING_INPUT'
  | 'USER_ABANDONED_APPROVAL'
  | 'CHILD_WORKFLOW_INCOMPLETE'
  | 'AUTH_FAILURE'
  | 'STORAGE_FAILURE'
  | 'UNKNOWN_FAILURE';

export type EvolveEscalationLevel = 'LEVEL_0_SELF_HEAL' | 'LEVEL_1_USER_ACTION' | 'LEVEL_2_SUPPORT_QUEUE' | 'LEVEL_3_SPECIALIST' | 'LEVEL_4_FOUNDER';

export type EvolveQueueId =
  | 'NEEDS_YOU_NOW'
  | 'SYSTEM_CAN_HANDLE'
  | 'CLIENT_ACTION_REQUIRED'
  | 'SITE00_ACTION_REQUIRED'
  | 'AT_RISK'
  | 'BLOCKED'
  | 'SPEND_WATCH'
  | 'REPEATED_FAILURES'
  | 'HIGH_VALUE_CLIENTS';

export type EvolveAssignee =
  | 'SYSTEM'
  | 'CLIENT'
  | 'SITE00_SUPPORT'
  | 'CREATIVE_SPECIALIST'
  | 'TECHNICAL_SPECIALIST'
  | 'PROJECT_OWNER'
  | 'FOUNDER';

export type EvolveClientRiskLevel = 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';

export type EvolveMarginHealth = 'HEALTHY' | 'WATCH' | 'ERODING' | 'UNPROFITABLE';

export type EvolveIssueType =
  | 'BILLING_CREDITS'
  | 'PROVIDER_FAILURE'
  | 'CREATIVE_JUDGMENT'
  | 'CLIENT_APPROVAL_DELAY'
  | 'DEADLINE_RISK'
  | 'TECHNICAL_IMPLEMENTATION'
  | 'VIP_HIGH_RISK';

export type EvolveMeaningfulProgressKind =
  | 'APPROVAL_COMPLETED'
  | 'CAMPAIGN_TERRITORY_SELECTED'
  | 'BRIEF_COMPLETED'
  | 'TREATMENT_ADVANCED'
  | 'ASSET_APPROVED'
  | 'PRODUCTION_STAGE_COMPLETED'
  | 'LAUNCH_MILESTONE_COMPLETED'
  | 'CLIENT_RESPONSE_RECEIVED'
  | 'TECHNICAL_BLOCKER_RESOLVED';

export type EvolveOperationsEventType =
  | 'PROJECT_CREATED'
  | 'PROJECT_PROGRESS'
  | 'CLIENT_APPROVAL_REQUESTED'
  | 'CLIENT_APPROVAL_RECEIVED'
  | 'JOB_FAILED'
  | 'JOB_RETRIED'
  | 'JOB_BLOCKED'
  | 'CROP_APPROVED'
  | 'GENERATION_APPROVED'
  | 'GENERATION_COMPLETED'
  | 'CREDIT_WARNING'
  | 'CREDIT_EXHAUSTED'
  | 'MILESTONE_AT_RISK'
  | 'PROJECT_STALLED'
  | 'PROJECT_RECOVERED'
  | 'ESCALATION_CREATED'
  | 'ESCALATION_RESOLVED'
  | 'NUDGE_SENT'
  | 'PROVIDER_INCIDENT'
  | 'SPEND_ANOMALY'
  | 'MARGIN_ALERT'
  | 'MANUAL_OVERRIDE';

export type EvolveOperationalAlertType =
  | 'SPEND_WARNING'
  | 'PROJECT_AT_RISK'
  | 'ACTION_REQUIRED'
  | 'CLIENT_WAITING'
  | 'SYSTEM_BLOCKED'
  | 'REPEATED_FAILURE'
  | 'CREDIT_LIMIT'
  | 'MARGIN_WATCH'
  | 'VIP_GROWTH_PARTNER_RISK';

export type EvolveExplainReason = {
  code: string;
  label: string;
  detail?: string;
};

export type EvolveSpendSnapshot = {
  includedMonthlyCredits: number;
  purchasedCredits: number;
  remainingCredits: number;
  usedCredits: number;
  providerCostCents: number;
  productiveSpendCents: number;
  failedSpendCents: number;
  regenerationSpendCents: number;
  retrySpendCents: number;
  projectedBurnCredits: number;
  approvedPendingSpendCredits: number;
  blockedSpendCredits: number;
  hardLimitCredits: number;
  softLimitCredits: number;
  cycleDaysRemaining: number;
  cycleDaysTotal: number;
  hasTopUp: boolean;
};

export type EvolveSpendState = {
  health: EvolveSpendHealthState;
  usagePercent: number;
  reasons: EvolveExplainReason[];
  clientSafeSummary: string;
  internalSummary: string;
  blockGeneration: boolean;
};

export type EvolveFailureClassification = {
  failureClass: EvolveFailureClass;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: EvolveExplainReason[];
  retryAllowed: boolean;
  autoRetryAllowed: boolean;
  paidRegenerationAllowed: boolean;
  returnToStep: string | null;
  escalate: boolean;
};

export type EvolveRetryGuardResult = {
  allowed: boolean;
  action: 'AUTO_RETRY' | 'BLOCK' | 'RETURN_TO_INPUT' | 'ESCALATE' | 'OFFER_TOP_UP' | 'FREEZE_JOB';
  reasons: EvolveExplainReason[];
  automatedRetryCount: number;
  maxAutomatedRetries: number;
};

export type EvolveFailureBudget = {
  productiveSpendCents: number;
  failedSpendCents: number;
  retrySpendCents: number;
  regenerationSpendCents: number;
  productiveSpendPercent: number;
  failureSpendPercent: number;
  regenerationRate: number;
  anomalyDetected: boolean;
  anomalyReasons: EvolveExplainReason[];
};

export type EvolveProjectHealthResult = {
  health: EvolveOperationalHealth;
  reasons: EvolveExplainReason[];
  stallReason: string | null;
  daysSinceMeaningfulProgress: number | null;
  waitingParty: 'CLIENT' | 'SITE00' | 'SYSTEM' | null;
  nextRecommendedAction: string | null;
};

export type EvolveEscalation = {
  id: string;
  level: EvolveEscalationLevel;
  reasons: EvolveExplainReason[];
  assignee: EvolveAssignee;
  priorityScore: number;
  createdAt: string;
  resolvedAt: string | null;
};

export type EvolveOperationalPriority = {
  score: number;
  band: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  reasons: EvolveExplainReason[];
  founderInterventionRequired: boolean;
};

export type EvolveQueueAssignment = {
  queueId: EvolveQueueId;
  assignee: EvolveAssignee;
  issueType: EvolveIssueType;
  priority: EvolveOperationalPriority;
  route: string;
  title: string;
  summary: string;
};

export type EvolveOperationalAction = {
  id: string;
  projectId: string;
  accountId: string;
  queueId: EvolveQueueId;
  assignee: EvolveAssignee;
  title: string;
  summary: string;
  reasons: EvolveExplainReason[];
  priority: EvolveOperationalPriority;
  route: string;
  createdAt: string;
  snoozedUntil: string | null;
  resolvedAt: string | null;
};

export type EvolveProviderIncident = {
  id: string;
  providerId: string;
  providerName: string;
  affectedJobCount: number;
  failureClass: EvolveFailureClass;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED';
  unsafeRetriesPaused: boolean;
  groupedAlertSent: boolean;
  reasons: EvolveExplainReason[];
  createdAt: string;
  resolvedAt: string | null;
};

export type EvolveClientRisk = {
  level: EvolveClientRiskLevel;
  reasons: EvolveExplainReason[];
  churnRiskScore: number;
};

export type EvolveMarginSnapshot = {
  clientRevenueCents: number;
  providerCostCents: number;
  humanDeliveryCostCents: number;
  otherDeliveryCostCents: number;
  marginCents: number;
  marginPercent: number;
  health: EvolveMarginHealth;
  reasons: EvolveExplainReason[];
};

export type EvolveOperationsEvent = {
  id: string;
  eventType: EvolveOperationsEventType;
  projectId: string | null;
  accountId: string | null;
  jobId: string | null;
  classification: EvolveFailureClass | null;
  policyApplied: string | null;
  automaticAction: string | null;
  initiatedBy: 'SYSTEM' | 'CLIENT' | 'FOUNDER' | 'STAFF';
  spendImpactCents: number;
  reasons: EvolveExplainReason[];
  timestamp: string;
  resolution: string | null;
  metadata?: Record<string, unknown>;
};

export type EvolveOperationsPolicy = {
  id: string;
  planId: EvolveServicePackageId | '*';
  deliveryMode: EvolveDeliveryMode | '*';
  spendWarningPercent: number;
  spendCriticalPercent: number;
  hardBlockAtPercent: number;
  allowTopUp: boolean;
  maxAutomatedRetries: number;
  maxPaidRegenerationWithoutApproval: number;
  stallThresholdDays: number;
  clientApprovalNudgeCooldownHours: number;
  escalationCeiling: EvolveEscalationLevel;
  serviceTierPriorityBoost: number;
  internalBudgetSoftLimitCents: number | null;
  internalBudgetHardLimitCents: number | null;
  marginWatchThresholdPercent: number;
  providerIncidentMinJobs: number;
};

export type EvolveExecutiveBrief = {
  generatedAt: string;
  title: string;
  sections: Array<{
    id: string;
    label: string;
    items: Array<{ label: string; value: string | number; detail?: string }>;
  }>;
  founderDecisionsRequired: EvolveOperationalAction[];
  whatChanged: string[];
  whatSystemHandled: string[];
};

export type EvolveProjectOpsInput = {
  projectId: string;
  accountId: string;
  projectName: string;
  organizationSlug: string;
  deliveryMode: EvolveDeliveryMode;
  servicePackage: EvolveServicePackageId;
  revenueTierCents: number;
  launchUrgencyDays: number | null;
  slaHours: number | null;
  spend: EvolveSpendSnapshot;
  failedJobCount: number;
  repeatedFailureCount: number;
  lastFailureClass: EvolveFailureClass | null;
  lastMeaningfulProgressAt: string | null;
  approvalPendingSince: string | null;
  approvalWaitingOn: 'CLIENT' | 'SITE00' | null;
  openReviewCount: number;
  unresolvedBlockerCount: number;
  clientResponseLagHours: number | null;
  productionCompletionPercent: number | null;
  paymentState: 'CURRENT' | 'PAST_DUE' | 'UNKNOWN';
  projectStage: string;
  providerId: string | null;
  margin?: EvolveMarginSnapshot;
  recentEvents?: EvolveOperationsEvent[];
};

export type EvolvePortfolioSummary = {
  activeProjects: number;
  needsAttention: number;
  blocked: number;
  clientWaiting: number;
  systemWaiting: number;
  systemFailures: number;
  spendWatch: number;
  marginWatch: number;
  highValueAtRisk: number;
  portfolioHealth: 'HEALTHY' | 'WATCH' | 'AT_RISK';
  healthReasons: EvolveExplainReason[];
};

export type EvolvePortfolioPage = {
  summary: EvolvePortfolioSummary;
  topSignals: Array<{ id: string; label: string; value: number; state: 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'BLOCKED' }>;
  queues: Record<EvolveQueueId, { total: number; items: EvolveOperationalAction[] }>;
  providerIncidents: EvolveProviderIncident[];
  executiveBrief: EvolveExecutiveBrief;
  changedSinceLastCheck: string[];
};

export type EvolveClientSafeOpsView = {
  projectHealth: EvolveOperationalHealth;
  healthLabel: string;
  creditsUsed: number;
  creditsRemaining: number;
  creditsTotal: number;
  usagePercent: number;
  needsAttention: boolean;
  nextAction: string | null;
  pendingReviews: number;
  blockers: string[];
  alerts: Array<{ type: EvolveOperationalAlertType; title: string; message: string; route: string | null }>;
};

export type EvolveProjectOpsView = {
  health: EvolveProjectHealthResult;
  spend: EvolveSpendState;
  failureBudget: EvolveFailureBudget;
  escalation: EvolveEscalation | null;
  clientRisk: EvolveClientRisk;
  queueAssignments: EvolveQueueAssignment[];
  internalMargin: EvolveMarginSnapshot | null;
  pendingActions: EvolveOperationalAction[];
  clientSafe: EvolveClientSafeOpsView;
};

export type EvolveSystemInspectorEntry = {
  domain: string;
  inputSummary: Record<string, unknown>;
  outputSummary: Record<string, unknown>;
  policyId: string | null;
  reasons: EvolveExplainReason[];
};
