import { getSupabaseAdmin } from '../supabase.js';
import { ensureDemoProjectSeeded, refreshProjectDerivedState } from './seedDemo.js';
import { normalizeProjectPhase, PHASE_ORDER } from './serviceAccess.js';
import { enrichControlCommandWithOrchestration } from './orchestrationEnrichment.js';
import { resolvePreviewTunnelUrl } from './previewTunnel.js';
import type { StructuredBlocker } from './readinessTypes.js';

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
  sortWeight: number;
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

export type PreviewTunnelPayload = {
  url: string | null;
  hostname: string | null;
  source: 'env' | 'file' | 'unavailable';
  label: string;
};

export type ControlCommandPayload = {
  operator: { displayName: string; role: string };
  previewTunnel: PreviewTunnelPayload;
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
  orchestration?: import('../site00Orchestration/dashboardAggregator.js').OrchestrationDashboardSnapshot | null;
};

const MATRIX_STAGES: ControlMatrixStage[] = [
  { id: 'origin', label: 'ORIGIN' },
  { id: 'identity', label: 'IDENTITY' },
  { id: 'blueprint', label: 'BLUEPRINT' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'build', label: 'BUILD' },
  { id: 'qa', label: 'QA' },
  { id: 'launch', label: 'LAUNCH' },
];

const STAGE_PHASE_MAP: Record<string, string> = {
  origin: 'DISCOVERY',
  identity: 'DISCOVERY',
  blueprint: 'DESIGN',
  assets: 'DESIGN',
  build: 'BUILD',
  qa: 'INTEGRATION',
  launch: 'LAUNCH',
};

function formatClock(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function severityWeight(s: ControlPrioritySeverity): number {
  switch (s) {
    case 'CRITICAL':
      return 0;
    case 'BLOCKED':
      return 1;
    case 'ACTION':
      return 2;
    case 'READY':
      return 3;
    case 'MILESTONE':
      return 4;
    default:
      return 5;
  }
}

function matrixCellForStage(
  stageId: string,
  currentPhase: string,
  blockers: StructuredBlocker[],
  deliverableStatuses: string[],
): ControlMatrixCellState {
  const stagePhase = STAGE_PHASE_MAP[stageId] ?? 'DISCOVERY';
  const currentNorm = normalizeProjectPhase(currentPhase);
  const currentIdx = PHASE_ORDER.indexOf(currentNorm);
  const stageIdx = PHASE_ORDER.indexOf(normalizeProjectPhase(stagePhase));

  const hasClientBlocker = blockers.some((b) => b.owner === 'client' && !b.resolved_at);
  const hasBlocker = blockers.some((b) => !b.resolved_at);
  const inReview = deliverableStatuses.some((s) => ['ADMIN_REVIEW', 'AI_DRAFT', 'CLIENT_REVIEW'].includes(s));

  if (currentIdx > stageIdx) return 'COMPLETE';
  if (currentIdx < stageIdx) return 'UPCOMING';
  if (hasClientBlocker && ['blueprint', 'assets', 'build'].includes(stageId)) return 'AWAITING_CLIENT';
  if (hasBlocker) return 'BLOCKED';
  if (inReview && ['blueprint', 'assets'].includes(stageId)) return 'REVIEW';
  return 'IN_PROGRESS';
}

export async function getControlCommandPayload(operatorEmail?: string): Promise<ControlCommandPayload> {
  await ensureDemoProjectSeeded();
  const supabase = getSupabaseAdmin();

  const { data: projects } = await supabase
    .from('site00_projects')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('updated_at', { ascending: false });

  const projectRows = projects ?? [];
  const priorityQueue: ControlPriorityItem[] = [];
  let needInputCount = 0;
  let inProductionCount = 0;
  let reviewsReadyCount = 0;
  let launchQueueCount = 0;

  const productionMatrix: ControlMatrixRow[] = [];

  for (const project of projectRows) {
    const readiness = await refreshProjectDerivedState(project.id);
    const blockers = (readiness?.blockers ?? []).filter((b) => !b.resolved_at);

    const { data: deliverables } = await supabase
      .from('site00_project_deliverables')
      .select('status')
      .eq('project_id', project.id);

    const delStatuses = (deliverables ?? []).map((d) => String(d.status));
    const inProd = delStatuses.some((s) => ['GENERATING', 'IN_PROGRESS', 'QUEUED', 'AI_DRAFT', 'PROCESSING'].includes(s));
    if (inProd) inProductionCount += 1;

    const clientBlockers = blockers.filter((b) => b.owner === 'client');
    if (clientBlockers.length) needInputCount += 1;

    for (const b of blockers) {
      const severity: ControlPrioritySeverity =
        b.severity === 'critical' ? 'CRITICAL' : b.type === 'access' ? 'CRITICAL' : b.owner === 'client' ? 'BLOCKED' : 'ACTION';
      priorityQueue.push({
        id: b.id ?? `${project.id}-${b.type}`,
        severity,
        projectId: project.id,
        projectName: project.name,
        projectSlug: project.slug,
        title: b.reason.split('.')[0]?.toUpperCase() ?? 'BLOCKER',
        detail: b.reason.toUpperCase(),
        timestamp: b.created_at ?? new Date().toISOString(),
        clockTime: formatClock(b.created_at ?? new Date().toISOString()),
        route: `/admin/site00/projects/${project.id}`,
        sortWeight: severityWeight(severity),
      });
    }

    const cells: Record<string, ControlMatrixCellState> = {};
    for (const stage of MATRIX_STAGES) {
      cells[stage.id] = matrixCellForStage(stage.id, project.current_phase, blockers, delStatuses);
    }

    productionMatrix.push({
      projectId: project.id,
      projectSlug: project.slug,
      projectName: project.name,
      clientEmail: project.client_email,
      buildClass: project.build_class,
      cells,
      route: `/admin/site00/projects/${project.id}`,
    });

    if (normalizeProjectPhase(project.current_phase) === 'LAUNCH') {
      launchQueueCount += 1;
    }
  }

  const { data: pendingApprovals } = await supabase
    .from('site00_approval_requests')
    .select('*, site00_projects(name, slug, id)')
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW'])
    .order('submitted_at', { ascending: false })
    .limit(20);

  for (const approval of pendingApprovals ?? []) {
    const proj = approval.site00_projects as { name?: string; slug?: string; id?: string } | null;
    priorityQueue.push({
      id: approval.id,
      severity: 'ACTION',
      projectId: approval.project_id,
      projectName: proj?.name ?? 'PROJECT',
      projectSlug: proj?.slug ?? '',
      title: approval.title.toUpperCase(),
      detail: `${approval.category} — INTERNAL REVIEW`,
      timestamp: approval.submitted_at,
      clockTime: formatClock(approval.submitted_at),
      route: `/admin/site00/projects/${approval.project_id}/approvals`,
      sortWeight: severityWeight('ACTION'),
    });
  }

  const { data: clientReviews } = await supabase
    .from('site00_approval_requests')
    .select('*, site00_projects(name, slug, id)')
    .in('status', ['CLIENT_REVIEW', 'READY_FOR_CLIENT'])
    .order('submitted_at', { ascending: false })
    .limit(10);

  reviewsReadyCount = (clientReviews ?? []).length;

  for (const review of clientReviews ?? []) {
    const proj = review.site00_projects as { name?: string; id?: string } | null;
    priorityQueue.push({
      id: `client-${review.id}`,
      severity: 'READY',
      projectId: review.project_id,
      projectName: proj?.name ?? 'PROJECT',
      projectSlug: '',
      title: review.title.toUpperCase(),
      detail: 'READY FOR CLIENT REVIEW',
      timestamp: review.submitted_at,
      clockTime: formatClock(review.submitted_at),
      route: `/admin/site00/projects/${review.project_id}/approvals`,
      sortWeight: severityWeight('READY'),
    });
  }

  const { data: activityRows } = await supabase
    .from('site00_project_activity')
    .select('id, event_type, summary, created_at, project_id, site00_projects(name)')
    .order('created_at', { ascending: false })
    .limit(15);

  for (const ev of activityRows ?? []) {
    if (['PAYMENT_CONFIRMED', 'BRIEF_APPROVED', 'DELIVERABLE_UNBLOCKED'].includes(ev.event_type)) {
      const proj = ev.site00_projects as { name?: string } | null;
      priorityQueue.push({
        id: `ms-${ev.id}`,
        severity: 'MILESTONE',
        projectId: ev.project_id,
        projectName: proj?.name ?? 'PROJECT',
        projectSlug: '',
        title: ev.summary.replace(/\.$/, '').toUpperCase(),
        detail: ev.event_type.replace(/_/g, ' '),
        timestamp: ev.created_at,
        clockTime: formatClock(ev.created_at),
        route: `/admin/site00/projects/${ev.project_id}/activity`,
        sortWeight: severityWeight('MILESTONE'),
      });
    }
  }

  priorityQueue.sort((a, b) => {
    if (a.sortWeight !== b.sortWeight) return a.sortWeight - b.sortWeight;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const { data: adminActivity } = await supabase
    .from('site00_admin_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  const activity: ControlActivityItem[] = [
    ...(activityRows ?? []).slice(0, 8).map((ev) => ({
      id: ev.id,
      summary: ev.summary.toUpperCase(),
      eventType: ev.event_type,
      projectName: (ev.site00_projects as { name?: string } | null)?.name ?? null,
      timestamp: ev.created_at,
      clockTime: formatClock(ev.created_at),
    })),
    ...(adminActivity ?? []).slice(0, 4).map((ev) => ({
      id: ev.id,
      summary: ev.summary.toUpperCase(),
      eventType: ev.event_type,
      projectName: ev.entity_label ?? null,
      timestamp: ev.created_at,
      clockTime: formatClock(ev.created_at),
    })),
  ].slice(0, 12);

  const upcomingReviews: ControlReviewItem[] = (clientReviews ?? []).slice(0, 6).map((r) => {
    const proj = r.site00_projects as { name?: string; id?: string } | null;
    return {
      id: r.id,
      projectId: r.project_id,
      projectName: proj?.name ?? 'PROJECT',
      title: r.title.toUpperCase(),
      category: r.category,
      status: r.status,
      route: `/admin/site00/projects/${r.project_id}/approvals`,
      dueLabel: null,
    };
  });

  const { data: launchSites } = await supabase
    .from('site00_sites')
    .select('domain, status, project_id, name, site00_projects(name, current_phase)')
    .in('status', ['BUILD', 'PRELAUNCH', 'QA']);

  const launchQueue: ControlLaunchItem[] = (launchSites ?? [])
    .filter((s) => {
      const proj = s.site00_projects as { current_phase?: string } | null;
      return normalizeProjectPhase(proj?.current_phase ?? '') === 'LAUNCH' || s.status === 'QA';
    })
    .slice(0, 6)
    .map((s) => ({
      projectId: s.project_id,
      projectName: (s.site00_projects as { name?: string } | null)?.name ?? s.name,
      domain: s.domain,
      qaStatus: s.status === 'QA' ? 'IN QA' : 'PENDING',
      deploymentStatus: s.status,
      route: `/admin/site00/projects/${s.project_id}`,
    }));

  const { count: failedJobs } = await supabase
    .from('site00_production_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'FAILED');

  const systems = [
    { id: 'auth', label: 'AUTH', state: 'HEALTHY', detail: 'SESSION ACTIVE' },
    { id: 'database', label: 'DATABASE', state: 'HEALTHY', detail: 'SUPABASE CONNECTED' },
    { id: 'automation', label: 'AUTOMATION', state: (failedJobs ?? 0) > 0 ? 'DEGRADED' : 'HEALTHY', detail: `${failedJobs ?? 0} FAILED JOBS` },
    { id: 'payments', label: 'PAYMENTS', state: 'UNKNOWN', detail: 'NO LIVE WEBHOOK METRICS' },
    { id: 'deployments', label: 'DEPLOYMENTS', state: 'UNKNOWN', detail: 'NO DEPLOY RUNNER CONNECTED' },
  ];

  const degraded = systems.filter((s) => s.state === 'DEGRADED').length;
  const systemHealth: ControlSystemHealth = {
    overall: degraded > 0 ? 'DEGRADED' : systems.every((s) => s.state === 'HEALTHY') ? 'OPERATIONAL' : 'UNKNOWN',
    summary: degraded > 0 ? `${degraded} SYSTEMS DEGRADED` : 'ALL SYSTEMS OPERATIONAL',
    systems,
  };

  const operatorLocal = operatorEmail?.split('@')[0]?.replace(/\./g, ' ').toUpperCase() ?? 'OPERATOR';

  const basePayload: ControlCommandPayload = {
    operator: { displayName: operatorLocal, role: 'OWNER / ADMIN' },
    previewTunnel: resolvePreviewTunnelUrl(),
    metrics: [
      { id: 'active', label: 'ACTIVE PROJECTS', sublabel: 'ACTIVE', value: projectRows.length, route: '/admin/site00/projects' },
      { id: 'input', label: 'NEED INPUT', sublabel: 'CLIENT', value: needInputCount, route: '/admin/site00/projects' },
      { id: 'production', label: 'IN PRODUCTION', sublabel: 'LIVE', value: inProductionCount, route: '/admin/site00/studio' },
      { id: 'reviews', label: 'REVIEWS READY', sublabel: 'CLIENT', value: reviewsReadyCount, route: '/admin/site00/approvals' },
      { id: 'launch', label: 'LAUNCH QUEUE', sublabel: 'QUEUE', value: launchQueue.length || launchQueueCount, route: '/admin/site00/projects' },
    ],
    priorityQueue: priorityQueue.slice(0, 20),
    matrixStages: MATRIX_STAGES,
    productionMatrix,
    activity,
    upcomingReviews,
    launchQueue,
    systemHealth,
    alertCount: priorityQueue.filter((p) => p.severity === 'CRITICAL' || p.severity === 'BLOCKED').length,
    productionSpineSummary: MATRIX_STAGES,
  };

  return enrichControlCommandWithOrchestration(basePayload, operatorEmail);
}
