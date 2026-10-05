/** Orchestration dashboard types — mirrors server dashboardAggregator output */

export type PortfolioEntry = {
  id: string;
  slug: string;
  name: string;
  classification: string;
  clientFacing: boolean;
  launchTarget: string | null;
  targetType: string | null;
  manifestStatus: string;
  isProvisional: boolean;
  readinessScore: number | null;
  readinessExplanation: string[];
  requiredComplete: string | null;
  projectHealth: string;
  blockerCount: number;
  pendingDecisionCount: number;
  currentWorkstream: string | null;
  nextAction: string | null;
  externalSystemHealth: string;
  lastSignal: string | null;
  deferredCount: number;
  route: string;
};

export type InfrastructureEntry = {
  id: string;
  slug: string;
  name: string;
  classification: string;
  health: string;
  connectionState: string;
  limitation: string | null;
  route: string;
};

export type NeedsYouItem = {
  id: string;
  organizationSlug: string;
  organizationName: string;
  title: string;
  reason: string;
  category: 'NEEDS_YOU';
  route: string;
  priority: number;
};

export type FocusNowItem = {
  rank: number;
  organizationSlug: string;
  organizationName: string;
  action: string;
  why: string;
  route: string;
  priority: number;
};

export type CommandQueueDisplayItem = {
  id: string;
  category: string;
  organizationSlug: string;
  organizationName: string;
  workstreamTitle: string | null;
  requirementTitle: string;
  actionLabel: string;
  priority: number;
  reason: string;
  requirementId: string | null;
  workstreamId: string | null;
  route: string;
  lastUpdate: string | null;
  evidenceState: string;
};

export type ConnectionHealthItem = {
  id: string;
  organizationSlug: string;
  organizationName: string;
  logicalName: string;
  state: string;
  externalIdentifier: string | null;
  lastSync: string | null;
  errorReason: string | null;
  affectedProjects: string[];
};

export type DriftAlert = {
  id: string;
  organizationSlug: string;
  label: string;
  detail: string;
  route: string;
};

export type ReconciliationInboxItem = {
  id: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  workstreamKey: string | null;
  requirementKey: string | null;
  declaredState: string;
  suggestedState: string;
  confidence: string;
  outcome: string;
  evidenceSummary: string;
  observedAt: string | null;
  adminDecision: string | null;
  route: string;
};

export type OrchestrationDashboardSnapshot = {
  persistenceMode: 'memory' | 'supabase';
  portfolio: PortfolioEntry[];
  infrastructure: InfrastructureEntry[];
  needsYou: NeedsYouItem[];
  focusNow: FocusNowItem[];
  commandQueue: CommandQueueDisplayItem[];
  connections: ConnectionHealthItem[];
  activity: Array<{
    id: string;
    summary: string;
    eventType: string;
    organizationName: string | null;
    timestamp: string;
    clockTime: string;
  }>;
  driftAlerts: DriftAlert[];
  reconciliationInbox: ReconciliationInboxItem[];
  organizations: Array<{ id: string; slug: string; name: string; clientFacing: boolean }>;
};

export type ManifestRequirementDisplay = {
  id: string;
  requirementKey: string;
  title: string;
  classification: string;
  executionStatus: string;
  whyRequired: string | null;
  blockingImpact: string | null;
  workstreamTitle: string | null;
  hasOverride: boolean;
  displayState: string;
};

export type ProjectControlSnapshot = {
  organization: {
    id: string;
    slug: string;
    name: string;
    classification: string;
    client_facing: boolean;
    reconciliation_state: string;
    project_health?: string | null;
  };
  launchTarget: {
    name: string;
    type: string;
    isProvisional: boolean;
    approvalState: string;
    masterRoadmapCount: number | null;
  } | null;
  readiness: {
    readinessScore: number;
    blockingRequirementsRemaining: number;
    requiredItems: number;
    completeItems: number;
    explanation: string[];
    contributingRequirements: Array<{ title: string; blockingReason: string | null; complete: boolean }>;
  } | null;
  currentPhase: string | null;
  workstreams: Array<{ key: string; title: string; status: string; stage: string }>;
  blockers: Array<{ title: string; reason: string; requirementId: string }>;
  needsYou: NeedsYouItem[];
  nextActions: Array<{ action: string; blocker: string | null; attentionState: string }>;
  recentSignals: Array<{ title: string; source: string; observedAt: string | null }>;
  evidence: Array<{ title: string; sourcePath: string | null; confidence: string | null; repository: string | null }>;
  reconciliations: ReconciliationInboxItem[];
  evolveItems: Array<{ title: string; status: string; category: string }>;
  connections: ConnectionHealthItem[];
  activity: Array<{ id: string; summary: string; eventType: string; organizationName: string | null; timestamp: string; clockTime: string }>;
  requirements: ManifestRequirementDisplay[];
  driftAlerts: DriftAlert[];
};
