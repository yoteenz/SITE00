import type { ProjectStageCode } from '../types.js';

export type ExecutionMode = 'AUTOMATED' | 'ASSISTED' | 'CLIENT_ACTION' | 'EXTERNAL_MANUAL' | 'VERIFICATION';

export type VisibilityClass = 'INTERNAL_ONLY' | 'CLIENT_SAFE' | 'CLIENT_ACTIONABLE';

export type RunbookStatus =
  | 'DRAFT'
  | 'READY'
  | 'ACTIVE'
  | 'BLOCKED'
  | 'WAITING_CLIENT'
  | 'WAITING_PROVIDER'
  | 'VERIFYING'
  | 'COMPLETE'
  | 'SUPERSEDED';

export type ExecutionTaskStatus =
  | 'NOT_READY'
  | 'READY'
  | 'IN_PROGRESS'
  | 'WAITING_CLIENT'
  | 'WAITING_PROVIDER'
  | 'BLOCKED'
  | 'READY_TO_VERIFY'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FAILED'
  | 'COMPLETE'
  | 'SKIPPED'
  | 'SUPERSEDED';

export type BlockerCategory =
  | 'CLIENT_INFO_MISSING'
  | 'CLIENT_AUTH_REQUIRED'
  | 'PROVIDER_PENDING'
  | 'PROVIDER_ERROR'
  | 'DNS_PROPAGATION'
  | 'PAYMENT_REQUIRED'
  | 'SCOPE_REVIEW'
  | 'TECHNICAL_CONFLICT'
  | 'MANUAL_REVIEW'
  | 'UNKNOWN';

export type ProviderCategory =
  | 'DOMAIN_REGISTRAR'
  | 'DNS_PROVIDER'
  | 'EMAIL_PROVIDER'
  | 'MIGRATION_PROVIDER'
  | 'PAYMENT_PROVIDER'
  | 'OTHER';

export type ProviderCapability = 'SEARCH' | 'READ' | 'CREATE' | 'UPDATE' | 'VERIFY' | 'HANDOFF_ONLY';

export type VerificationCheckKind =
  | 'DOMAIN_RESOLVES'
  | 'MX_MATCHES_EXPECTED'
  | 'SPF_PRESENT'
  | 'SPF_MATCHES_EXPECTED'
  | 'DKIM_PRESENT'
  | 'DKIM_MATCHES_EXPECTED'
  | 'DMARC_PRESENT'
  | 'MAILBOX_ACTIVE'
  | 'SEND_TEST_PASS'
  | 'RECEIVE_TEST_PASS'
  | 'DOMAIN_OWNERSHIP_CONFIRMED'
  | 'REGISTRAR_ACCESS_CONFIRMED';

export type VerificationStatus = 'NOT_RUN' | 'RUNNING' | 'PASS' | 'FAIL' | 'PARTIAL' | 'MANUAL_CONFIRMATION_REQUIRED';

export type MigrationPhase =
  | 'ASSESS'
  | 'SOURCE_READY'
  | 'TARGET_READY'
  | 'MIGRATION_READY'
  | 'MIGRATING'
  | 'VERIFYING'
  | 'COMPLETE'
  | 'FAILED'
  | 'MANUAL_REVIEW';

export type DigitalFoundationRunbook = {
  runbook_id: string;
  artifact_id: string;
  project_id: string | null;
  quote_id: string;
  quote_version: number;
  runbook_version: number;
  status: RunbookStatus;
  generated_from_scope_hash: string;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
};

export type DigitalFoundationExecutionTask = {
  task_id: string;
  runbook_id: string;
  artifact_id: string;
  project_stage: ProjectStageCode;
  task_type: string;
  title: string;
  description: string;
  execution_mode: ExecutionMode;
  provider_category: ProviderCategory;
  provider_id: string | null;
  dependency_task_ids: string[];
  client_action_request_id: string | null;
  approval_id: string | null;
  verification_rule_id: string | null;
  status: ExecutionTaskStatus;
  blocker_category: BlockerCategory | null;
  blocked_reason: string | null;
  attempt_count: number;
  started_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  assigned_actor: string | null;
  visibility: VisibilityClass;
  internal_notes: string | null;
  result_metadata: Record<string, unknown>;
};

export type DigitalFoundationVerificationRule = {
  rule_id: string;
  task_id: string;
  artifact_id: string;
  check_kind: VerificationCheckKind;
  expected_value: string | null;
  current_value: string | null;
  match_state: 'UNKNOWN' | 'MATCH' | 'MISMATCH' | 'MISSING';
  required: boolean;
};

export type DigitalFoundationVerificationResult = {
  result_id: string;
  rule_id: string;
  artifact_id: string;
  status: VerificationStatus;
  detail: string | null;
  manual_override: boolean;
  manual_override_reason: string | null;
  actor: string | null;
  ran_at: string;
};

export type ProjectForecast = {
  artifact_id: string;
  original_min_days: number;
  original_max_days: number;
  current_min_days: number;
  current_max_days: number;
  forecast_reason: string | null;
  updated_at: string;
};

export type ManualVerificationOverride = {
  artifact_id: string;
  rule_id: string;
  reason: string;
  actor: string;
  created_at: string;
};

export type ProjectOperationsConfig = {
  artifact_id: string;
  email_provider_id: string | null;
  dns_provider_id: string | null;
  domain_registrar_id: string | null;
};

export type OperationsArtifactEventType =
  | 'RUNBOOK_GENERATED'
  | 'RUNBOOK_ACTIVATED'
  | 'TASK_READY'
  | 'TASK_STARTED'
  | 'TASK_WAITING_CLIENT'
  | 'TASK_WAITING_PROVIDER'
  | 'TASK_BLOCKED'
  | 'TASK_EXECUTED'
  | 'TASK_VERIFICATION_STARTED'
  | 'TASK_VERIFIED'
  | 'TASK_VERIFICATION_FAILED'
  | 'TASK_COMPLETED'
  | 'TASK_SUPERSEDED'
  | 'PROVIDER_HANDOFF_OPENED'
  | 'CLIENT_ACTION_CREATED'
  | 'FORECAST_CHANGED'
  | 'FINAL_VERIFICATION_STARTED'
  | 'FOUNDATION_VERIFIED';
