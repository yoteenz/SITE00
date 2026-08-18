import { isDependencySatisfied } from './dependencyEngine.js';
import type {
  DeliverableReadinessResult,
  EnvironmentReadinessResult,
  CtrlRoomSignal,
  ProjectReadinessGraph,
  RecipeServiceRequirement,
  ReadinessDimensionStatus,
  StructuredBlocker,
  OverallReadinessStatus,
} from './readinessTypes.js';
import {
  effectiveServiceState,
  isPhaseAtOrPast,
  isServiceBlockingWhenRequired,
  isServiceConnected,
  isServiceRequiredForCurrentPhase,
  normalizeProjectPhase,
  normalizeConnectionState,
  provisioningPriorityBucket,
  phaseIndex,
  PHASE_ORDER,
} from './serviceAccess.js';

export type DeliverableInput = {
  id: string;
  deliverable_key: string;
  title: string;
  status: string;
  blocked_by?: string[];
  required_assets?: string[];
  approval_required?: boolean;
};

export type RecipeDeliverableInput = {
  deliverable_key: string;
  depends_on: string[];
  required_services: RecipeServiceRequirement[];
  required_assets: string[];
  required_approvals: string[];
};

export type ServiceInput = {
  service_id: string;
  provider_key: string;
  display_name: string;
  required_phase: string;
  requirement_state: string;
  connection_state?: string | null;
  owner_type: string;
};

export type ProjectInput = {
  id: string;
  slug: string;
  name: string;
  current_phase: string;
  payment_state: string;
};

const TERMINAL_WORKFLOW = new Set(['APPROVED', 'CLIENT_APPROVED', 'DELIVERED']);

function dimFromBlocked(blocked: boolean, notApplicable: boolean): ReadinessDimensionStatus {
  if (notApplicable) return 'not_required';
  if (blocked) return 'blocked';
  return 'ready';
}

function isDeliverableActiveForCurrentPhase(
  recipe: RecipeDeliverableInput | null,
  currentPhase: string,
): boolean {
  if (!recipe) return true;
  const services = parseRecipeServices(recipe.required_services);
  if (services.length === 0) return true;
  const earliestServicePhase = services.reduce(
    (min, s) => (phaseIndex(s.phase) < phaseIndex(min) ? s.phase : min),
    services[0].phase,
  );
  return isPhaseAtOrPast(currentPhase, earliestServicePhase);
}

function computeOverall(dimensions: DeliverableReadinessResult['dimensions'], phaseActive: boolean): OverallReadinessStatus {
  if (!phaseActive) return 'not_ready';
  const values = Object.values(dimensions);
  if (values.includes('blocked')) return 'blocked';
  if (values.includes('not_ready')) return 'not_ready';
  return 'ready';
}

function parseRecipeServices(raw: unknown): RecipeServiceRequirement[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => {
      const r = row as Record<string, unknown>;
      return {
        service: String(r.service ?? ''),
        phase: String(r.phase ?? 'BUILD'),
        requirement: (r.requirement === 'optional' ? 'optional' : 'required') as 'required' | 'optional',
      };
    })
    .filter((r) => r.service);
}

export function buildServiceMap(services: ServiceInput[]): Map<string, ServiceInput & { effective_state: ReturnType<typeof effectiveServiceState> }> {
  const map = new Map<string, ServiceInput & { effective_state: ReturnType<typeof effectiveServiceState> }>();
  for (const svc of services) {
    map.set(svc.provider_key, {
      ...svc,
      effective_state: effectiveServiceState({
        requirementState: svc.requirement_state,
        connectionState: svc.connection_state,
        requiredPhase: svc.required_phase,
        currentPhase: svc.required_phase,
      }),
    });
  }
  return map;
}

export function evaluateDeliverableReadiness(input: {
  project: ProjectInput;
  deliverable: DeliverableInput;
  recipe: RecipeDeliverableInput | null;
  deliverablesByKey: Map<string, DeliverableInput>;
  services: ServiceInput[];
  existingAssets?: string[];
}): DeliverableReadinessResult {
  const { project, deliverable, recipe, deliverablesByKey, services } = input;
  const blockers: StructuredBlocker[] = [];
  const baseRoute = `/admin/site00/projects/${project.id}`;
  const recipeRow = recipe ?? {
    deliverable_key: deliverable.deliverable_key,
    depends_on: deliverable.blocked_by ?? [],
    required_services: [],
    required_assets: [],
    required_approvals: [],
  };

  const deps = recipeRow.depends_on ?? [];
  const unmetDeps = deps.filter((key) => {
    const upstream = deliverablesByKey.get(key);
    return !upstream || !isDependencySatisfied(String(upstream.status));
  });

  const creativeBlocked = unmetDeps.length > 0;
  if (creativeBlocked) {
    for (const key of unmetDeps) {
      blockers.push({
        project_id: project.id,
        deliverable_id: deliverable.id,
        type: 'dependency',
        dependency_id: key,
        reason: `WAITING ON PRIOR DELIVERABLE: ${key.replace(/_/g, ' ').toUpperCase()}.`,
        owner: 'admin',
        severity: 'high',
        action_type: 'REVIEW_DEPENDENCY',
        action_route: `${baseRoute}/deliverables`,
      });
    }
  }

  const requiredAssets = recipeRow.required_assets?.length
    ? recipeRow.required_assets
    : deliverable.required_assets ?? [];
  const assetsPresent = input.existingAssets ?? [];
  const missingAssets = requiredAssets.filter((a) => !assetsPresent.includes(a));
  const assetsBlocked = missingAssets.length > 0;
  if (assetsBlocked) {
    blockers.push({
      project_id: project.id,
      deliverable_id: deliverable.id,
      type: 'asset',
      reason: `MISSING ASSETS: ${missingAssets.join(', ').toUpperCase()}.`,
      owner: 'client',
      severity: 'medium',
      action_route: `${baseRoute}/files`,
    });
  }

  const paymentBlocked =
    project.payment_state !== 'CONFIRMED' &&
    ['BUILD', 'INTEGRATION', 'LAUNCH'].some((p) => isPhaseAtOrPast(project.current_phase, p));
  if (paymentBlocked) {
    blockers.push({
      project_id: project.id,
      deliverable_id: deliverable.id,
      type: 'payment',
      reason: 'PAYMENT MUST BE CONFIRMED BEFORE PRODUCTION BUILD WORK.',
      owner: 'client',
      severity: 'critical',
      action_route: `${baseRoute}/overview`,
    });
  }

  const approvalBlocked =
    deliverable.approval_required &&
    ['AI_DRAFT', 'ADMIN_REVIEW', 'REVISION'].includes(deliverable.status);
  if (approvalBlocked) {
    blockers.push({
      project_id: project.id,
      deliverable_id: deliverable.id,
      type: 'approval',
      reason: 'ADMIN APPROVAL REQUIRED BEFORE PROCEEDING.',
      owner: 'admin',
      severity: 'high',
      action_route: `${baseRoute}/approvals`,
    });
  }

  const requiredServices = parseRecipeServices(recipeRow.required_services);
  let accessBlocked = false;
  let accessNotRequired = requiredServices.length === 0;

  for (const req of requiredServices) {
    if (req.requirement === 'optional') continue;
    if (!isPhaseAtOrPast(project.current_phase, req.phase)) continue;

    const svc = services.find((s) => s.provider_key === req.service);
    if (!svc) continue;

    const effective = effectiveServiceState({
      requirementState: svc.requirement_state,
      connectionState: svc.connection_state,
      requiredPhase: svc.required_phase,
      currentPhase: project.current_phase,
    });

    if (!isServiceConnected(effective) && isServiceBlockingWhenRequired(effective)) {
      accessBlocked = true;
      blockers.push({
        project_id: project.id,
        deliverable_id: deliverable.id,
        type: 'access',
        service_id: svc.service_id,
        service_key: svc.provider_key,
        reason: `${svc.display_name.toUpperCase()} ACCESS REQUIRED FOR ${deliverable.title.toUpperCase()}.`,
        owner: svc.owner_type.toLowerCase() === 'client' ? 'client' : 'admin',
        severity: 'high',
        current_status: effective,
        required_phase: req.phase,
        action_type: 'REQUEST_ACCESS',
        action_route: `${baseRoute}/access`,
      });
    }
  }

  if (!accessBlocked && requiredServices.some((r) => !isPhaseAtOrPast(project.current_phase, r.phase))) {
    accessNotRequired = true;
  }

  const phaseActive = isDeliverableActiveForCurrentPhase(recipeRow, project.current_phase);

  const dimensions = {
    creative: dimFromBlocked(creativeBlocked, deps.length === 0 && !creativeBlocked),
    assets: dimFromBlocked(assetsBlocked, requiredAssets.length === 0),
    access: accessBlocked
      ? 'blocked'
      : accessNotRequired || requiredServices.every((r) => !isPhaseAtOrPast(project.current_phase, r.phase))
        ? 'not_required'
        : 'ready',
    dependencies: dimFromBlocked(creativeBlocked, deps.length === 0),
    approval: dimFromBlocked(approvalBlocked, !deliverable.approval_required),
    payment: dimFromBlocked(paymentBlocked, project.payment_state === 'CONFIRMED'),
  } as DeliverableReadinessResult['dimensions'];

  const overall = computeOverall(dimensions, phaseActive);
  const recommended_actions: DeliverableReadinessResult['recommended_actions'] = [];

  if (overall === 'ready' && phaseActive && !TERMINAL_WORKFLOW.has(deliverable.status)) {
    recommended_actions.push({
      action_type: 'GENERATE_BRIEF',
      title: `${deliverable.title.toUpperCase()} IS READY TO PRODUCE.`,
      destination: `${baseRoute}/studio`,
      priority: 'high',
    });
  }

  for (const b of blockers) {
    if (b.type === 'access' && b.action_route) {
      recommended_actions.push({
        action_type: b.action_type ?? 'REQUEST_ACCESS',
        title: b.reason,
        destination: b.action_route,
        priority: b.severity,
      });
    }
  }

  return {
    deliverable_id: deliverable.id,
    deliverable_key: deliverable.deliverable_key,
    title: deliverable.title,
    workflow_status: deliverable.status,
    dimensions,
    overall,
    blockers,
    recommended_actions,
  };
}

export function evaluateEnvironmentReadiness(input: {
  project: ProjectInput;
  services: ServiceInput[];
}): EnvironmentReadinessResult {
  const currentNorm = normalizeProjectPhase(input.project.current_phase);
  const currentIdx = phaseIndex(input.project.current_phase);

  const buckets = {
    upcoming: [] as EnvironmentReadinessResult['upcoming'],
    pending: [] as EnvironmentReadinessResult['pending'],
    future: [] as EnvironmentReadinessResult['future'],
    complete: [] as EnvironmentReadinessResult['complete'],
  };

  let currentRequired = 0;
  let currentReady = 0;

  for (const svc of input.services) {
    const effective = effectiveServiceState({
      requirementState: svc.requirement_state,
      connectionState: svc.connection_state,
      requiredPhase: svc.required_phase,
      currentPhase: input.project.current_phase,
    });

    const row = {
      provider_key: svc.provider_key,
      display_name: svc.display_name,
      connection_state: effective,
    };

    const bucket = provisioningPriorityBucket(svc.required_phase, input.project.current_phase, effective);

    if (isServiceRequiredForCurrentPhase(svc.required_phase, input.project.current_phase, effective)) {
      currentRequired += 1;
      if (isServiceConnected(effective)) currentReady += 1;
    }

    if (bucket === 'COMPLETE') buckets.complete.push(row);
    else if (bucket === 'NEEDED_NOW') buckets.pending.push(row);
    else if (bucket === 'COMING_UP') buckets.upcoming.push(row);
    else buckets.future.push(row);
  }

  const current_phase_readiness_pct =
    currentRequired > 0 ? Math.round((currentReady / currentRequired) * 100) : 100;

  const allRequired = input.services.filter((s) => normalizeConnectionState(s.requirement_state) !== 'NOT_REQUIRED');
  const allReady = allRequired.filter((s) =>
    isServiceConnected(
      effectiveServiceState({
        requirementState: s.requirement_state,
        connectionState: s.connection_state,
        requiredPhase: s.required_phase,
        currentPhase: input.project.current_phase,
      }),
    ),
  );

  return {
    current_phase: input.project.current_phase,
    current_phase_label: currentNorm,
    current_phase_readiness_pct,
    current_phase_required_count: currentRequired,
    current_phase_ready_count: currentReady,
    upcoming: buckets.upcoming,
    pending: buckets.pending,
    future: buckets.future,
    complete: buckets.complete,
    all_phase_readiness_pct:
      allRequired.length > 0 ? Math.round((allReady.length / allRequired.length) * 100) : 100,
  };
}

export function computeDeliverablesBlockedByService(
  deliverables: DeliverableReadinessResult[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const d of deliverables) {
    for (const b of d.blockers) {
      if (b.type !== 'access' || !b.service_key) continue;
      const list = map.get(b.service_key) ?? [];
      if (!list.includes(d.title)) list.push(d.title);
      map.set(b.service_key, list);
    }
  }
  return map;
}

export function buildCtrlRoomSignals(input: {
  project: ProjectInput;
  blockers: StructuredBlocker[];
  blockerIds?: Map<string, string>;
}): CtrlRoomSignal[] {
  const signals: CtrlRoomSignal[] = [];
  const now = Date.now();

  for (const b of input.blockers) {
    if (b.type !== 'access' || b.owner !== 'client') continue;
    const created = b.created_at ? new Date(b.created_at).getTime() : now;
    const age_days = Math.max(0, Math.floor((now - created) / 86400000));
    signals.push({
      id: b.id ?? `${input.project.id}-${b.service_key}-${b.deliverable_id}`,
      project_id: input.project.id,
      project_name: input.project.name,
      project_slug: input.project.slug,
      signal_type: 'ACCESS_REQUIRED',
      title: 'ACCESS REQUIRED',
      reason: b.reason,
      owner: b.owner,
      age_days,
      action_route: b.action_route ?? `/admin/site00/projects/${input.project.id}/access`,
      action_label: 'VIEW ACCESS',
      blocker_id: b.id,
    });
  }

  return signals;
}

export function evaluateProjectReadinessGraph(input: {
  project: ProjectInput;
  deliverables: DeliverableInput[];
  recipeByKey: Map<string, RecipeDeliverableInput>;
  services: ServiceInput[];
  existingAssets?: string[];
}): ProjectReadinessGraph {
  const byKey = new Map(input.deliverables.map((d) => [d.deliverable_key, d]));
  const deliverableResults = input.deliverables.map((d) =>
    evaluateDeliverableReadiness({
      project: input.project,
      deliverable: d,
      recipe: input.recipeByKey.get(d.deliverable_key) ?? null,
      deliverablesByKey: byKey,
      services: input.services,
      existingAssets: input.existingAssets,
    }),
  );

  const allBlockers = deliverableResults.flatMap((d) => d.blockers);
  const environment = evaluateEnvironmentReadiness({ project: input.project, services: input.services });
  const ctrl_room_signals = buildCtrlRoomSignals({ project: input.project, blockers: allBlockers });

  return {
    project_id: input.project.id,
    current_phase: input.project.current_phase,
    deliverables: deliverableResults,
    jobs: [],
    environment,
    blockers: allBlockers,
    ctrl_room_signals,
  };
}

export function readinessSummaryForAi(graph: ProjectReadinessGraph) {
  const productionReadiness: Record<string, string> = {};
  for (const d of graph.deliverables) {
    productionReadiness[d.deliverable_key] = d.overall;
  }
  return {
    productionReadiness,
    blockers: graph.blockers
      .filter((b) => !b.resolved_at)
      .map((b) => ({
        type: b.type,
        service: b.service_key,
        owner: b.owner,
        reason: b.reason,
        deliverable_key: graph.deliverables.find((d) => d.deliverable_id === b.deliverable_id)?.deliverable_key,
      })),
    environment: {
      currentPhaseReadinessPct: graph.environment.current_phase_readiness_pct,
      currentPhase: graph.environment.current_phase_label,
    },
    readyDeliverables: graph.deliverables.filter((d) => d.overall === 'ready').map((d) => d.deliverable_key),
    blockedDeliverables: graph.deliverables.filter((d) => d.overall === 'blocked').map((d) => d.deliverable_key),
  };
}

export { PHASE_ORDER, normalizeProjectPhase };
