/** SITE 00 Production Orchestration — canonical types */

export type OrganizationClassification =
  | 'INTERNAL_BRAND_PLATFORM'
  | 'INTERNAL_BRAND'
  | 'MANAGED_BRAND'
  | 'PRODUCTION_INFRASTRUCTURE';

export type OrganizationState = 'ACTIVE' | 'EXISTING_ACTIVE_PROJECT' | 'INACTIVE' | 'ARCHIVED';

export type ReconciliationState = 'UNRECONCILED' | 'RECONCILIATION_REQUIRED' | 'RECONCILED' | 'CONFLICT';

export type RequirementClassification =
  | 'REQUIRED_FOR_LAUNCH'
  | 'REQUIRED_FOR_MILESTONE'
  | 'OPTIONAL_POST_LAUNCH'
  | 'OUT_OF_SCOPE'
  | 'DEFERRED_BY_OWNER'
  | 'BLOCKED'
  | 'COMPLETE';

export type ExecutionStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'BLOCKED'
  | 'COMPLETE';

export type ManifestState = 'PROPOSED' | 'APPROVED' | 'ACTIVE' | 'SUPERSEDED' | 'ARCHIVED';

export type ManifestApprovalState = 'PENDING' | 'APPROVED' | 'REJECTED';

export type LaunchTargetType =
  | 'MVP_LAUNCH'
  | 'CORE_OPERATIONS'
  | 'PUBLIC_BETA'
  | 'SOFT_LAUNCH'
  | 'FULL_BRAND_LAUNCH'
  | 'CAMPAIGN_LAUNCH'
  | 'INTERNAL_RELEASE'
  | 'CLIENT_HANDOFF'
  | 'FULL_PLATFORM_LAUNCH'
  | 'FLAGSHIP_BRAND_LAUNCH'
  | 'CUSTOM';

export type ExternalSystemType =
  | 'GITHUB_REPOSITORY'
  | 'STUDIO_WORLD'
  | 'SUPABASE_PROJECT'
  | 'DEPLOYMENT_PROVIDER'
  | 'EMAIL_PROVIDER'
  | 'ANALYTICS_PROVIDER'
  | 'OTHER';

export type ConnectionState =
  | 'NOT_CONNECTED'
  | 'PENDING'
  | 'CONNECTED'
  | 'ERROR'
  | 'TO_BE_CONNECTED_IN_SPRINT_02';

export type ReconciliationOutcome =
  | 'CONFIRMED'
  | 'PROBABLE'
  | 'CONFLICT'
  | 'MISSING_EVIDENCE'
  | 'NEWLY_DISCOVERED'
  | 'REQUIRES_REVIEW';

export type CommandQueueCategory =
  | 'NEEDS_YOU'
  | 'BLOCKED'
  | 'RUNNING'
  | 'WAITING_ON_CLIENT'
  | 'WAITING_ON_EXTERNAL_SYSTEM'
  | 'UPCOMING'
  | 'POST_LAUNCH';

export type AttentionState = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type OrganizationRow = {
  id: string;
  slug: string;
  name: string;
  classification: OrganizationClassification;
  state: OrganizationState;
  repository_ownership: string | null;
  production_engine: string | null;
  external_repository: string | null;
  host: string | null;
  role: string | null;
  client_facing: boolean;
  reconciliation_state: ReconciliationState;
  project_health?: string;
  metadata: Record<string, unknown>;
};

export type LaunchManifestRow = {
  id: string;
  organization_id: string;
  project_id: string | null;
  target_name: string;
  target_type: LaunchTargetType;
  objective: string | null;
  target_date: string | null;
  manifest_state: ManifestState;
  approval_state: ManifestApprovalState;
  is_active: boolean;
  readiness_score: number | null;
  readiness_explanation: Record<string, unknown>;
  approved_by: string | null;
  approved_at: string | null;
  is_provisional?: boolean;
  master_roadmap_count?: number | null;
  metadata: Record<string, unknown>;
};

export type ManifestRequirementRow = {
  id: string;
  manifest_id: string;
  workstream_id: string | null;
  requirement_key: string;
  title: string;
  description: string | null;
  why_required: string | null;
  source_of_requirement: string | null;
  classification: RequirementClassification;
  execution_status: ExecutionStatus;
  priority: string;
  owner_email: string | null;
  can_defer: boolean;
  deferred_until: string | null;
  target_milestone: string | null;
  blocking_impact: string | null;
  admin_notes: string | null;
  external_source_ref: string | null;
  sort_order: number;
  metadata: Record<string, unknown>;
};

export type RequirementDependencyRow = {
  id: string;
  manifest_id: string;
  source_requirement_id: string;
  target_requirement_id: string;
  dependency_type: string;
};

export type WorkstreamRow = {
  id: string;
  organization_id: string;
  project_id: string | null;
  stage_key: string | null;
  workstream_key: string;
  title: string;
  description: string | null;
  owner_email: string | null;
  attention_state: AttentionState;
  execution_status: ExecutionStatus;
  metadata: Record<string, unknown>;
};

export type ReadinessResult = {
  readinessScore: number;
  blockingRequirementsRemaining: number;
  requiredItems: number;
  completeItems: number;
  blockedItems: number;
  deferredItems: number;
  optionalItems: number;
  explanation: string[];
  contributingRequirements: Array<{
    id: string;
    requirement_key: string;
    title: string;
    classification: RequirementClassification;
    execution_status: ExecutionStatus;
    countsTowardReadiness: boolean;
    blockingReason: string | null;
  }>;
};

export type CommandQueueItem = {
  category: CommandQueueCategory;
  organizationSlug: string;
  organizationName: string;
  workstreamTitle: string | null;
  requirementTitle: string;
  actionLabel: string;
  priority: number;
  reason: string;
  requirementId: string | null;
  workstreamId: string | null;
};

export type NextActionItem = {
  organizationSlug: string;
  organizationName: string;
  status: ExecutionStatus | string;
  owner: string | null;
  nextAction: string;
  blocker: string | null;
  dueDate: string | null;
  attentionState: AttentionState;
  priority: number;
};

export type ManifestBuilderInput = {
  organizationSlug: string;
  companyType?: string;
  projectType?: string;
  selectedServices?: string[];
  businessObjective?: string;
  launchMode?: LaunchTargetType;
  launchDate?: string;
  requestedFeatures?: string[];
  excludedFeatures?: string[];
  deferredFeatures?: string[];
  technicalDependencies?: string[];
};

export type ProposedManifest = {
  targetName: string;
  targetType: LaunchTargetType;
  objective: string;
  requirements: Array<{
    requirement_key: string;
    title: string;
    description: string;
    why_required: string;
    classification: RequirementClassification;
    execution_status: ExecutionStatus;
    can_defer: boolean;
    source_of_requirement: string;
  }>;
};

export type DeferralImpact = {
  dependenciesAffected: string[];
  launchImpact: 'BLOCKING' | 'NON_BLOCKING';
  dependentRequirements: string[];
  operationalWarning: string | null;
  suggestedDestination: string;
};

export type IngestionInput = {
  projectName: string;
  organizationName?: string;
  projectClassification?: string;
  projectType?: string;
  projectSlug?: string;
  existingOrNew?: 'EXISTING' | 'NEW';
  currentState?: string;
  repositoryReference?: string;
  productionEngine?: string;
  knownDatabase?: string;
  knownDeployment?: string;
  currentObjective?: string;
  currentLaunchTarget?: string;
};

/** Classifications that participate in launch readiness blocking */
export const READINESS_BLOCKING_CLASSIFICATIONS: RequirementClassification[] = [
  'REQUIRED_FOR_LAUNCH',
  'REQUIRED_FOR_MILESTONE',
  'BLOCKED',
];

/** Classifications excluded from readiness penalty */
export const READINESS_EXCLUDED_CLASSIFICATIONS: RequirementClassification[] = [
  'DEFERRED_BY_OWNER',
  'OPTIONAL_POST_LAUNCH',
  'OUT_OF_SCOPE',
];

export const EXECUTION_COMPLETE_STATUSES: ExecutionStatus[] = ['COMPLETE'];

export function isCompleteRequirement(
  classification: RequirementClassification,
  executionStatus: ExecutionStatus,
  hasOverride: boolean,
): boolean {
  if (classification === 'COMPLETE') return true;
  if (hasOverride) return false;
  return EXECUTION_COMPLETE_STATUSES.includes(executionStatus);
}

export function countsTowardReadiness(classification: RequirementClassification): boolean {
  return (
    READINESS_BLOCKING_CLASSIFICATIONS.includes(classification) &&
    !READINESS_EXCLUDED_CLASSIFICATIONS.includes(classification)
  );
}

export function isBlockingIncomplete(
  classification: RequirementClassification,
  executionStatus: ExecutionStatus,
  hasOverride: boolean,
): boolean {
  if (!countsTowardReadiness(classification)) return false;
  if (hasOverride) return false;
  return !isCompleteRequirement(classification, executionStatus, false);
}
