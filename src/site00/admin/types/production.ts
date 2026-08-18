export type Site00ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  build_class: string | null;
  current_phase: string;
  project_health: string;
  production_readiness_pct: number;
  environment_readiness_pct?: number;
};

export type Site00NextAction = {
  id?: string;
  project_id?: string;
  title: string;
  reason: string;
  destination: string;
  priority?: string;
};

export type Site00StudioSummary = {
  complete: number;
  inProgress: number;
  queued: number;
  blocked: number;
  total: number;
};

export type Site00DeliverableRow = {
  id?: string;
  title: string;
  category: string;
  status: string;
  variants_requested?: number;
  deliverable_key?: string;
  readiness?: DeliverableReadiness | null;
};

export type ReadinessDimensions = {
  creative: string;
  assets: string;
  access: string;
  dependencies: string;
  approval: string;
  payment: string;
};

export type DeliverableReadiness = {
  deliverable_id?: string;
  deliverable_key?: string;
  title?: string;
  overall: string;
  workflow_status?: string;
  dimensions: ReadinessDimensions;
  blockers: Array<{
    type: string;
    reason: string;
    owner: string;
    action_route?: string;
    action_type?: string;
    service_key?: string;
  }>;
};

export type EnvironmentReadiness = {
  current_phase: string;
  current_phase_label: string;
  current_phase_readiness_pct: number;
  current_phase_required_count: number;
  current_phase_ready_count: number;
  all_phase_readiness_pct: number;
};

export type Site00AccessRow = {
  provider_key?: string;
  display_name?: string;
  required_phase: string;
  owner_type: string;
  effective_state?: string;
  currently_required?: boolean;
  blocks?: string[];
  blocks_label?: string;
  provisioning_bucket?: string;
  site00_service_catalog?: { display_name: string; provider_key: string; description?: string; category?: string };
};

export type Site00ProductionJob = {
  metadata?: { label?: string };
  variants_requested: number;
  progress_pct: number;
  status: string;
};

export type Site00DirectorInsight = {
  priority: string;
  what: string;
  why: string;
  action: string;
};

export type Site00ApprovalItem = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  site00_projects?: { name: string; slug: string; id?: string };
};

export type Site00AccessRequirement = Site00AccessRow;

export type Site00ActivityEvent = {
  summary: string;
  actor_type: string;
  created_at: string;
};

export type Site00DashboardPayload = {
  projects: Site00ProjectSummary[];
  nextActions: Site00NextAction[];
  approvalCount: number;
  accessAlerts: unknown[];
};

export type Site00StudioPayload = {
  project: Site00ProjectSummary | null;
  pipeline: Record<string, string> | null;
  intelligence: Record<string, unknown> | null;
  deliverables: Site00DeliverableRow[];
  deliverableMap: Record<string, { complete: number; total: number }>;
  jobs: Site00ProductionJob[];
  projects: Site00ProjectSummary[];
  insights: Site00DirectorInsight[];
  environmentReadiness?: EnvironmentReadiness | null;
};

export type Site00ApprovalsPayload = {
  items: Site00ApprovalItem[];
  total: number;
};

export type Site00ProjectsPayload = {
  projects: Site00ProjectSummary[];
};

export type Site00ProjectWorkspacePayload = {
  project: Site00ProjectSummary;
  intelligence: Record<string, unknown> | null;
  deliverables: Site00DeliverableRow[];
  approvals: Array<{ title: string; status: string; category: string }>;
  access: Site00AccessRow[];
  activity: Site00ActivityEvent[];
  nextActions: Site00NextAction[];
  studioSummary: Site00StudioSummary;
  environmentReadiness?: EnvironmentReadiness | null;
  blockers?: DeliverableReadiness['blockers'];
};
