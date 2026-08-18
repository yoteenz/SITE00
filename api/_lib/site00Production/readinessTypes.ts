export type ReadinessDimensionStatus = 'ready' | 'blocked' | 'not_required' | 'required_later' | 'not_ready';

export type OverallReadinessStatus = 'ready' | 'blocked' | 'not_ready';

export type BlockerType =
  | 'access'
  | 'asset'
  | 'approval'
  | 'dependency'
  | 'payment'
  | 'client_action'
  | 'creative_input';

export type BlockerOwner = 'client' | 'admin' | 'team' | 'system';

export type BlockerSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ServiceConnectionState =
  | 'NOT_REQUIRED'
  | 'REQUIRED_LATER'
  | 'REQUIRED_NOW'
  | 'CLIENT_ACTION_REQUIRED'
  | 'INVITE_PENDING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'ACCESS_LIMITED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'ERROR';

export type RecipeServiceRequirement = {
  service: string;
  phase: string;
  requirement: 'required' | 'optional';
};

export type ReadinessDimensions = {
  creative: ReadinessDimensionStatus;
  assets: ReadinessDimensionStatus;
  access: ReadinessDimensionStatus;
  dependencies: ReadinessDimensionStatus;
  approval: ReadinessDimensionStatus;
  payment: ReadinessDimensionStatus;
};

export type StructuredBlocker = {
  id?: string;
  project_id: string;
  deliverable_id?: string;
  production_job_id?: string;
  type: BlockerType;
  service_id?: string;
  service_key?: string;
  dependency_id?: string;
  reason: string;
  owner: BlockerOwner;
  severity: BlockerSeverity;
  current_status?: string;
  required_phase?: string;
  action_type?: string;
  action_route?: string;
  created_at?: string;
  resolved_at?: string | null;
};

export type DeliverableReadinessResult = {
  deliverable_id: string;
  deliverable_key: string;
  title: string;
  workflow_status: string;
  dimensions: ReadinessDimensions;
  overall: OverallReadinessStatus;
  blockers: StructuredBlocker[];
  recommended_actions: Array<{
    action_type: string;
    title: string;
    destination: string;
    priority: BlockerSeverity;
  }>;
};

export type EnvironmentReadinessResult = {
  current_phase: string;
  current_phase_label: string;
  current_phase_readiness_pct: number;
  current_phase_required_count: number;
  current_phase_ready_count: number;
  upcoming: Array<{ provider_key: string; display_name: string; connection_state: ServiceConnectionState }>;
  pending: Array<{ provider_key: string; display_name: string; connection_state: ServiceConnectionState }>;
  future: Array<{ provider_key: string; display_name: string; connection_state: ServiceConnectionState }>;
  complete: Array<{ provider_key: string; display_name: string; connection_state: ServiceConnectionState }>;
  all_phase_readiness_pct: number;
};

export type CtrlRoomSignal = {
  id: string;
  project_id: string;
  project_name: string;
  project_slug: string;
  signal_type: 'ACCESS_REQUIRED' | 'APPROVAL_REQUIRED' | 'FEEDBACK_RECEIVED' | 'BLOCKED';
  title: string;
  reason: string;
  owner: BlockerOwner;
  age_days: number;
  action_route: string;
  action_label: string;
  blocker_id?: string;
};

export type ProjectReadinessGraph = {
  project_id: string;
  current_phase: string;
  deliverables: DeliverableReadinessResult[];
  jobs: Array<DeliverableReadinessResult & { production_job_id: string }>;
  environment: EnvironmentReadinessResult;
  blockers: StructuredBlocker[];
  ctrl_room_signals: CtrlRoomSignal[];
};
