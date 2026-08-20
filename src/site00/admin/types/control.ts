export type ControlPrioritySeverity = 'CRITICAL' | 'ACTION' | 'READY' | 'BLOCKED' | 'MILESTONE' | 'INFO';

export type ControlPriorityItem = {
  id: string;
  severity: ControlPrioritySeverity;
  projectId: string;
  projectName: string;
  projectSlug: string;
  title: string;
  detail: string;
  timestamp: string;
  clockTime: string;
  route: string;
};

export type ControlMetric = {
  id: string;
  label: string;
  sublabel: string;
  value: number;
  route: string;
};

export type ControlMatrixStage = {
  id: string;
  label: string;
};

export type ControlMatrixCellState =
  | 'COMPLETE'
  | 'IN_PROGRESS'
  | 'AWAITING_CLIENT'
  | 'BLOCKED'
  | 'UPCOMING'
  | 'REVIEW'
  | 'PAUSED';

export type ControlMatrixRow = {
  projectId: string;
  projectSlug: string;
  projectName: string;
  clientEmail: string | null;
  buildClass: string | null;
  cells: Record<string, ControlMatrixCellState>;
  route: string;
};

export type ControlActivityItem = {
  id: string;
  summary: string;
  eventType: string;
  projectName: string | null;
  timestamp: string;
  clockTime: string;
};

export type ControlReviewItem = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  category: string;
  status: string;
  route: string;
  dueLabel: string | null;
};

export type ControlLaunchItem = {
  projectId: string;
  projectName: string;
  domain: string | null;
  qaStatus: string;
  deploymentStatus: string;
  route: string;
};

export type ControlSystemHealth = {
  overall: 'OPERATIONAL' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';
  summary: string;
  systems: Array<{ id: string; label: string; state: string; detail: string }>;
};

export type ControlCommandPayload = {
  operator: { displayName: string; role: string };
  metrics: ControlMetric[];
  priorityQueue: ControlPriorityItem[];
  matrixStages: ControlMatrixStage[];
  productionMatrix: ControlMatrixRow[];
  activity: ControlActivityItem[];
  upcomingReviews: ControlReviewItem[];
  launchQueue: ControlLaunchItem[];
  systemHealth: ControlSystemHealth;
  alertCount: number;
  productionSpineSummary: ControlMatrixStage[];
  /** Live orchestration snapshot — canonical portfolio/command state (Sprint 03) */
  orchestration?: import('./orchestration').OrchestrationDashboardSnapshot | null;
};
