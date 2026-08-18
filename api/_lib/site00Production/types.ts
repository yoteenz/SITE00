export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type DeliverableStatus =
  | 'NOT_READY'
  | 'READY'
  | 'BRIEF_GENERATED'
  | 'QUEUED'
  | 'GENERATING'
  | 'AI_DRAFT'
  | 'ADMIN_REVIEW'
  | 'REVISION'
  | 'APPROVED'
  | 'CLIENT_REVIEW'
  | 'CLIENT_APPROVED'
  | 'DELIVERED'
  | 'BLOCKED';

export type PipelineStageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE';

export type Site00ProjectRow = {
  id: string;
  slug: string;
  name: string;
  client_user_id: string | null;
  client_email: string | null;
  build_class: string | null;
  build_type: string | null;
  identity_state: string | null;
  current_phase: string;
  project_health: string;
  payment_state: string;
  provisioning_state: string;
  production_readiness_pct: number;
  environment_readiness_pct: number;
  recipe_id: string | null;
  automation_level: number;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type NextActionRow = {
  id: string;
  project_id: string;
  action_type: string;
  priority: ActionPriority;
  title: string;
  reason: string;
  dependency: string | null;
  destination: string;
  metadata: Record<string, unknown>;
  created_at: string;
  resolved_at: string | null;
};

export type ProductionPlanResponse = {
  projectId: string;
  phase: string;
  deliverables: Array<{ key: string; title: string; category: string; status: string }>;
  dependencies: Array<{ source: string; target: string }>;
  blockers: string[];
  missingAssets: string[];
  missingAccess: string[];
  recommendations: string[];
  nextActions: Array<{ actionType: string; title: string; priority: ActionPriority; destination: string }>;
};
