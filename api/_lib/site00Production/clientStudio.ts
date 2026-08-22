import { getSupabaseAdmin } from '../supabase.js';
import { normalizeProjectPhase, PHASE_ORDER } from './serviceAccess.js';
import { refreshProjectDerivedState } from './seedDemo.js';
import type { StructuredBlocker } from './readinessTypes.js';

const MILESTONE_EVENT_TYPES = new Set([
  'PAYMENT_CONFIRMED',
  'PROJECT_CREATED',
  'BRIEF_APPROVED',
  'IDENTITY_FOUNDATION_LOCKED',
  'BLUEPRINT_APPROVED',
  'BLUEPRINT_DIRECTION_SELECTED',
  'ASSET_LIBRARY_APPROVED',
  'DEVELOPMENT_STARTED',
  'QA_STARTED',
  'LAUNCH_APPROVED',
  'PRODUCTION_LAUNCH',
  'DELIVERABLE_UNBLOCKED',
]);

const CLIENT_BLOCKER_TYPES = new Set(['access', 'asset', 'approval', 'client_action', 'creative_input']);

export type ClientStudioStageStatus =
  | 'locked'
  | 'upcoming'
  | 'available'
  | 'in_progress'
  | 'awaiting_client'
  | 'in_review'
  | 'approved'
  | 'complete'
  | 'blocked';

export type ClientStudioStage = {
  id: string;
  index: string;
  label: string;
  status: ClientStudioStageStatus;
};

export type ClientStudioInputTask = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  route: string;
  type: string;
};

export type ClientStudioOperation = {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  route: string;
};

export type ClientStudioSignalMetric = {
  id: string;
  label: string;
  pct: number | null;
  stateLabel: string;
};

export type ClientStudioReview = {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  status: string;
  route: string;
  variantCount: number | null;
};

export type ClientStudioMilestone = {
  id: string;
  title: string;
  statusLabel: string;
  timestamp: string;
  stage: string | null;
};

export type ClientStudioActivityEvent = {
  id: string;
  summary: string;
  eventType: string;
  timestamp: string;
  clockTime: string;
};

export type ClientStudioPayload = {
  project: {
    id: string;
    slug: string;
    name: string;
    projectNumber: string;
    buildClass: string | null;
    buildType: string | null;
    currentPhase: string;
    paymentState: string;
    provisioningState: string;
    status: string;
    productionReadinessPct: number;
    environmentReadinessPct: number;
  };
  studioStatus: string;
  studioStatusKey: string;
  stages: ClientStudioStage[];
  currentOperation: {
    title: string;
    description: string;
    resolved: number;
    total: number;
    route: string;
  } | null;
  clientInput: {
    requiredCount: number;
    route: string;
  };
  signalMetrics: ClientStudioSignalMetric[];
  clientOperations: ClientStudioOperation[];
  studioOperations: ClientStudioOperation[];
  latestMilestone: ClientStudioMilestone | null;
  activity: ClientStudioActivityEvent[];
  nextReview: ClientStudioReview | null;
  readiness: {
    blockedCount: number;
    readyCount: number;
    totalDeliverables: number;
  };
};

export type ClientProjectSummary = {
  id: string;
  slug: string;
  name: string;
  buildClass: string | null;
  buildType: string | null;
  currentPhase: string;
  paymentState: string;
  status: string;
  productionReadinessPct: number;
  studioRoute: string;
  updatedAt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function clientOwnsProject(project: { client_email?: string | null; client_user_id?: string | null }, email: string, userId?: string): boolean {
  const normalized = normalizeEmail(email);
  if (project.client_email && normalizeEmail(project.client_email) === normalized) return true;
  if (userId && project.client_user_id && project.client_user_id === userId) return true;
  return false;
}

export async function loadProjectForClient(projectSlug: string, clientEmail: string, userId?: string) {
  const supabase = getSupabaseAdmin();
  const { data: project, error } = await supabase.from('site00_projects').select('*').eq('slug', projectSlug).single();
  if (error || !project) throw new Error('PROJECT NOT FOUND');
  if (!clientOwnsProject(project, clientEmail, userId)) throw new Error('FORBIDDEN');
  return project;
}

export async function loadProjectByIdForClient(projectId: string, clientEmail: string, userId?: string) {
  const supabase = getSupabaseAdmin();
  const { data: project, error } = await supabase.from('site00_projects').select('*').eq('id', projectId).single();
  if (error || !project) throw new Error('PROJECT NOT FOUND');
  if (!clientOwnsProject(project, clientEmail, userId)) throw new Error('FORBIDDEN');
  return project;
}

function formatProjectNumber(project: { id: string; metadata?: Record<string, unknown> | null; created_at?: string }): string {
  const meta = project.metadata ?? {};
  if (typeof meta.project_number === 'string' && meta.project_number.trim()) {
    return meta.project_number.trim().toUpperCase();
  }
  const short = project.id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `00-${short.slice(0, 3)}`;
}

function formatClockTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

function mapInputStatus(blocker: StructuredBlocker): { status: string; statusLabel: string } {
  if (blocker.type === 'access') return { status: 'required', statusLabel: 'AWAITING CONNECTION' };
  if (blocker.type === 'asset') return { status: 'required', statusLabel: 'AWAITING UPLOAD' };
  if (blocker.type === 'approval') return { status: 'required', statusLabel: 'REVIEW REQUIRED' };
  if (blocker.type === 'creative_input') return { status: 'required', statusLabel: 'INPUT REQUIRED' };
  return { status: 'required', statusLabel: 'ACTION REQUIRED' };
}

function studioRoute(slug: string, section?: string): string {
  const base = `/studio/${slug}`;
  return section ? `${base}/${section}` : base;
}

function deriveStudioStatus(input: {
  status: string;
  paymentState: string;
  currentPhase: string;
  clientInputCount: number;
  pendingReview: boolean;
  blockedCount: number;
}): { key: string; label: string } {
  if (input.status === 'COMPLETE' || input.status === 'ARCHIVED') {
    return { key: 'complete', label: 'COMPLETE' };
  }
  if (input.paymentState !== 'CONFIRMED' && input.paymentState !== 'AUTHORIZED') {
    return { key: 'awaiting_payment', label: 'AWAITING AUTHORIZATION' };
  }
  if (input.pendingReview) return { key: 'in_review', label: 'IN REVIEW' };
  if (input.clientInputCount > 0) return { key: 'awaiting_input', label: 'AWAITING INPUT' };
  const phase = normalizeProjectPhase(input.currentPhase);
  if (phase === 'LAUNCH') return { key: 'launch_ready', label: 'LAUNCH READY' };
  if (phase === 'INTEGRATION' && input.blockedCount === 0) return { key: 'qa', label: 'QA' };
  if (input.status === 'PAUSED') return { key: 'paused', label: 'PAUSED' };
  return { key: 'active', label: 'STUDIO ACTIVE' };
}

function buildStages(buildClass: string | null, currentPhase: string, deliverables: Array<{ category: string; status: string }>, blockers: StructuredBlocker[]): ClientStudioStage[] {
  const classKey = (buildClass ?? 'SITE').toUpperCase();
  const templates: Record<string, Array<{ id: string; index: string; label: string; phaseKeys: string[]; categories: string[] }>> = {
    SITE: [
      { id: 'origin', index: '00', label: 'ORIGIN', phaseKeys: ['DISCOVERY'], categories: ['STRATEGY'] },
      { id: 'identity', index: '01', label: 'IDENTITY', phaseKeys: ['DISCOVERY'], categories: ['STRATEGY'] },
      { id: 'blueprint', index: '02', label: 'BLUEPRINT', phaseKeys: ['DESIGN'], categories: ['STRATEGY', 'WEBSITE'] },
      { id: 'assets', index: '03', label: 'ASSETS', phaseKeys: ['DESIGN'], categories: ['PRODUCTION'] },
      { id: 'build', index: '04', label: 'BUILD', phaseKeys: ['BUILD'], categories: ['PRODUCTION', 'WEBSITE'] },
      { id: 'qa', index: '05', label: 'QA', phaseKeys: ['INTEGRATION'], categories: [] },
      { id: 'launch', index: '06', label: 'LAUNCH', phaseKeys: ['LAUNCH'], categories: [] },
    ],
    IDENTITY: [
      { id: 'origin', index: '00', label: 'ORIGIN', phaseKeys: ['DISCOVERY'], categories: ['STRATEGY'] },
      { id: 'discovery', index: '01', label: 'DISCOVERY', phaseKeys: ['DISCOVERY'], categories: ['STRATEGY'] },
      { id: 'strategy', index: '02', label: 'STRATEGY', phaseKeys: ['DESIGN'], categories: ['STRATEGY'] },
      { id: 'identity', index: '03', label: 'IDENTITY', phaseKeys: ['DESIGN'], categories: ['PRODUCTION'] },
      { id: 'review', index: '04', label: 'REVIEW', phaseKeys: ['INTEGRATION'], categories: [] },
      { id: 'delivery', index: '05', label: 'DELIVERY', phaseKeys: ['LAUNCH'], categories: [] },
    ],
    EVOLVE: [
      { id: 'property', index: '00', label: 'PROPERTY', phaseKeys: ['DISCOVERY'], categories: [] },
      { id: 'diagnose', index: '01', label: 'DIAGNOSE', phaseKeys: ['DISCOVERY'], categories: ['STRATEGY'] },
      { id: 'systems', index: '02', label: 'SYSTEMS', phaseKeys: ['DESIGN'], categories: ['STRATEGY'] },
      { id: 'scope', index: '03', label: 'SCOPE', phaseKeys: ['DESIGN'], categories: ['WEBSITE'] },
      { id: 'production', index: '04', label: 'PRODUCTION', phaseKeys: ['BUILD'], categories: ['PRODUCTION'] },
      { id: 'qa', index: '05', label: 'QA', phaseKeys: ['INTEGRATION'], categories: [] },
      { id: 'launch', index: '06', label: 'LAUNCH', phaseKeys: ['LAUNCH'], categories: [] },
    ],
  };

  const stages = templates[classKey] ?? templates.SITE;
  const currentNorm = normalizeProjectPhase(currentPhase);
  const currentIdx = PHASE_ORDER.indexOf(currentNorm);

  return stages.map((stage, i) => {
    const stagePhaseIdx = Math.max(...stage.phaseKeys.map((p) => PHASE_ORDER.indexOf(p as (typeof PHASE_ORDER)[number])));
    const stageDeliverables = deliverables.filter((d) => stage.categories.length === 0 || stage.categories.includes(d.category));
    const approved = stageDeliverables.filter((d) => ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(d.status)).length;
    const total = stageDeliverables.length;
    const stageBlockers = blockers.filter((b) => !b.resolved_at);

    let status: ClientStudioStageStatus = 'upcoming';
    if (currentIdx > stagePhaseIdx || (total > 0 && approved === total)) {
      status = 'complete';
    } else if (currentIdx === stagePhaseIdx) {
      if (stageBlockers.some((b) => b.owner === 'client')) status = 'awaiting_client';
      else if (stageDeliverables.some((d) => ['ADMIN_REVIEW', 'AI_DRAFT', 'GENERATING'].includes(d.status))) status = 'in_review';
      else if (stageBlockers.length > 0) status = 'blocked';
      else status = 'in_progress';
    } else if (currentIdx + 1 === stagePhaseIdx) {
      status = 'available';
    } else if (i === 0) {
      status = 'complete';
    }

    return { id: stage.id, index: stage.index, label: stage.label, status };
  });
}

function computeSignalMetrics(deliverables: Array<{ category: string; status: string }>): ClientStudioSignalMetric[] {
  const groups: Array<{ id: string; label: string; categories: string[] }> = [
    { id: 'identity', label: 'IDENTITY', categories: ['STRATEGY'] },
    { id: 'assets', label: 'ASSETS', categories: ['PRODUCTION'] },
    { id: 'screens', label: 'SCREENS', categories: ['WEBSITE'] },
    { id: 'build', label: 'BUILD', categories: ['PRODUCTION', 'WEBSITE'] },
    { id: 'qa', label: 'QA', categories: [] },
  ];

  return groups.map((g) => {
    const rows = deliverables.filter((d) => g.categories.length === 0 ? false : g.categories.includes(d.category));
    if (!rows.length) {
      return { id: g.id, label: g.label, pct: null, stateLabel: 'PENDING' };
    }
    const approved = rows.filter((d) => ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(d.status)).length;
    const inProduction = rows.filter((d) => ['GENERATING', 'IN_PROGRESS', 'QUEUED', 'AI_DRAFT', 'ADMIN_REVIEW', 'BRIEF_GENERATED'].includes(d.status)).length;
    const pct = Math.round((approved / rows.length) * 100);
    let stateLabel = 'PENDING';
    if (pct === 100) stateLabel = 'COMPLETE';
    else if (inProduction > 0) stateLabel = 'IN PRODUCTION';
    else if (approved > 0) stateLabel = 'IN PROGRESS';
    return { id: g.id, label: g.label, pct: rows.length ? pct : null, stateLabel };
  });
}

function deriveCurrentOperation(
  slug: string,
  currentPhase: string,
  deliverables: Array<{ id: string; title: string; status: string; deliverable_key: string }>,
  readinessDeliverables: Array<{ deliverable_key: string; overall: string; title: string }>,
): ClientStudioPayload['currentOperation'] {
  const phase = normalizeProjectPhase(currentPhase);
  const active =
    deliverables.find((d) => ['GENERATING', 'IN_PROGRESS', 'AI_DRAFT', 'ADMIN_REVIEW', 'BRIEF_GENERATED'].includes(d.status)) ??
    readinessDeliverables.find((d) => d.overall === 'ready');

  const phaseLabels: Record<string, { title: string; description: string; route: string }> = {
    DISCOVERY: { title: 'ORIGIN', description: 'PROJECT FOUNDATION IS BEING ESTABLISHED.', route: studioRoute(slug) },
    DESIGN: { title: 'BLUEPRINT', description: 'STRUCTURE IS BEING DEFINED.', route: studioRoute(slug, 'blueprint') },
    BUILD: { title: 'BUILD', description: 'IMPLEMENTATION IS IN PROGRESS.', route: studioRoute(slug, 'operations') },
    INTEGRATION: { title: 'INTEGRATION', description: 'SYSTEMS ARE BEING CONNECTED AND VERIFIED.', route: studioRoute(slug, 'operations') },
    LAUNCH: { title: 'LAUNCH PREPARATION', description: 'FINAL READINESS IS BEING CONFIRMED.', route: studioRoute(slug) },
  };

  const phaseInfo = phaseLabels[phase] ?? phaseLabels.DESIGN;
  const related = deliverables.filter((d) => !['APPROVED', 'CLIENT_APPROVED', 'DELIVERED', 'NOT_READY'].includes(d.status));
  const resolved = deliverables.filter((d) => ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(d.status)).length;
  const total = deliverables.length || 1;

  if (active && 'title' in active) {
    return {
      title: String(active.title).toUpperCase(),
      description: phaseInfo.description,
      resolved,
      total,
      route: phaseInfo.route,
    };
  }

  return {
    title: phaseInfo.title,
    description: phaseInfo.description,
    resolved,
    total,
    route: phaseInfo.route,
  };
}

export async function getClientProjectsPayload(clientEmail: string, userId?: string): Promise<{ projects: ClientProjectSummary[] }> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(clientEmail);

  let query = supabase
    .from('site00_projects')
    .select('id, slug, name, build_class, build_type, current_phase, payment_state, status, production_readiness_pct, updated_at, client_email, client_user_id')
    .neq('status', 'DELETED')
    .order('updated_at', { ascending: false });

  if (userId) {
    query = query.or(`client_email.eq.${email},client_user_id.eq.${userId}`);
  } else {
    query = query.eq('client_email', email);
  }

  const { data: projects } = await query;

  return {
    projects: (projects ?? [])
      .filter((p) => clientOwnsProject(p, email, userId))
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        buildClass: p.build_class,
        buildType: p.build_type,
        currentPhase: p.current_phase,
        paymentState: p.payment_state,
        status: p.status,
        productionReadinessPct: p.production_readiness_pct ?? 0,
        studioRoute: studioRoute(p.slug),
        updatedAt: p.updated_at,
      })),
  };
}

export async function getClientStudioPayload(projectSlug: string, clientEmail: string, userId?: string): Promise<ClientStudioPayload> {
  const project = await loadProjectForClient(projectSlug, clientEmail, userId);
  const readiness = await refreshProjectDerivedState(project.id);
  const supabase = getSupabaseAdmin();

  const { data: deliverables } = await supabase
    .from('site00_project_deliverables')
    .select('id, deliverable_key, category, title, status')
    .eq('project_id', project.id)
    .order('created_at');

  const { data: jobs } = await supabase
    .from('site00_production_jobs')
    .select('id, status, metadata, deliverable_id')
    .eq('project_id', project.id)
    .in('status', ['QUEUED', 'PROCESSING', 'GENERATING']);

  const { data: activityRows } = await supabase
    .from('site00_project_activity')
    .select('id, event_type, summary, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(12);

  const { data: clientReviews } = await supabase
    .from('site00_approval_requests')
    .select('id, title, category, status, metadata')
    .eq('project_id', project.id)
    .in('status', ['CLIENT_REVIEW', 'READY_FOR_CLIENT'])
    .order('submitted_at', { ascending: false })
    .limit(1);

  const slug = project.slug;
  const deliverableRows = deliverables ?? [];
  const blockers = (readiness?.blockers ?? []).filter((b) => !b.resolved_at);
  const clientBlockers = blockers.filter((b) => b.owner === 'client' && CLIENT_BLOCKER_TYPES.has(b.type));

  const clientOperations: ClientStudioInputTask[] = clientBlockers.slice(0, 6).map((b) => {
    const { status, statusLabel } = mapInputStatus(b);
    const route =
      b.type === 'access'
        ? `/project/${slug}/provisioning`
        : b.action_route?.startsWith('/')
          ? b.action_route.replace(/^\/admin\/site00\/projects\/[^/]+/, studioRoute(slug)).replace(/\/access$/, '/input')
          : studioRoute(slug, 'input');
    return {
      id: b.id ?? `${b.type}-${b.service_key ?? b.deliverable_id}`,
      title: b.reason.split('.')[0]?.toUpperCase() ?? 'CLIENT ACTION',
      status,
      statusLabel,
      route,
      type: b.type,
    };
  });

  const studioOperations: ClientStudioOperation[] = (jobs ?? []).slice(0, 6).map((j) => ({
    id: j.id,
    title: String((j.metadata as Record<string, unknown>)?.label ?? 'PRODUCTION OPERATION').toUpperCase(),
    status: j.status,
    statusLabel: j.status === 'QUEUED' ? 'QUEUED' : 'IN PRODUCTION',
    route: studioRoute(slug, 'operations'),
  }));

  if (!studioOperations.length) {
    for (const d of deliverableRows.filter((row) => ['GENERATING', 'IN_PROGRESS', 'QUEUED', 'AI_DRAFT'].includes(row.status)).slice(0, 4)) {
      studioOperations.push({
        id: d.id,
        title: d.title.toUpperCase(),
        status: d.status,
        statusLabel: 'IN PRODUCTION',
        route: studioRoute(slug, 'operations'),
      });
    }
  }

  const pendingReview = (clientReviews ?? []).length > 0;
  const studioStatus = deriveStudioStatus({
    status: project.status,
    paymentState: project.payment_state,
    currentPhase: project.current_phase,
    clientInputCount: clientOperations.length,
    pendingReview,
    blockedCount: blockers.length,
  });

  const milestoneEvents = (activityRows ?? []).filter((a) => MILESTONE_EVENT_TYPES.has(a.event_type));
  const latestMilestone: ClientStudioMilestone | null = milestoneEvents[0]
    ? {
        id: milestoneEvents[0].id,
        title: milestoneEvents[0].summary.replace(/\.$/, '').toUpperCase(),
        statusLabel: 'LOCKED',
        timestamp: milestoneEvents[0].created_at,
        stage: normalizeProjectPhase(project.current_phase),
      }
    : null;

  const nextReviewRow = clientReviews?.[0];
  let nextReview: ClientStudioReview | null = null;
  if (nextReviewRow) {
    const meta = (nextReviewRow.metadata ?? {}) as Record<string, unknown>;
    nextReview = {
      id: nextReviewRow.id,
      title: nextReviewRow.title.toUpperCase(),
      category: nextReviewRow.category,
      subtitle: String(meta.subtitle ?? nextReviewRow.category).toUpperCase(),
      status: 'READY',
      route: studioRoute(slug, `reviews/${nextReviewRow.id}`),
      variantCount: typeof meta.variant_count === 'number' ? meta.variant_count : null,
    };
  }

  return {
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      projectNumber: formatProjectNumber(project),
      buildClass: project.build_class,
      buildType: project.build_type,
      currentPhase: project.current_phase,
      paymentState: project.payment_state,
      provisioningState: project.provisioning_state,
      status: project.status,
      productionReadinessPct: project.production_readiness_pct ?? 0,
      environmentReadinessPct: project.environment_readiness_pct ?? 0,
    },
    studioStatus: studioStatus.label,
    studioStatusKey: studioStatus.key,
    stages: buildStages(project.build_class, project.current_phase, deliverableRows, blockers),
    currentOperation: deriveCurrentOperation(
      slug,
      project.current_phase,
      deliverableRows,
      readiness?.deliverables ?? [],
    ),
    clientInput: {
      requiredCount: clientOperations.length,
      route: studioRoute(slug, 'input'),
    },
    signalMetrics: computeSignalMetrics(deliverableRows),
    clientOperations,
    studioOperations,
    latestMilestone,
    activity: (activityRows ?? []).map((a) => ({
      id: a.id,
      summary: a.summary.toUpperCase(),
      eventType: a.event_type,
      timestamp: a.created_at,
      clockTime: formatClockTime(a.created_at),
    })),
    nextReview,
    readiness: {
      blockedCount: blockers.length,
      readyCount: readiness?.deliverables.filter((d) => d.overall === 'ready').length ?? 0,
      totalDeliverables: deliverableRows.length,
    },
  };
}

/** Idempotent post-payment project activation — safe for retries and refresh. */
export async function activateClientProject(input: {
  clientEmail: string;
  userId?: string;
  slug: string;
  name: string;
  buildClass?: string;
  buildType?: string;
  recipeKey?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ projectId: string; slug: string; created: boolean; studioRoute: string }> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.clientEmail);

  const { data: existing } = await supabase.from('site00_projects').select('id, slug, client_email, client_user_id').eq('slug', input.slug).maybeSingle();
  if (existing) {
    if (!clientOwnsProject(existing, email, input.userId)) throw new Error('FORBIDDEN');
    if (existing.client_email !== email || (input.userId && !existing.client_user_id)) {
      await supabase
        .from('site00_projects')
        .update({
          client_email: email,
          client_user_id: input.userId ?? null,
          payment_state: 'CONFIRMED',
          provisioning_state: 'IN_PROGRESS',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    }
    await refreshProjectDerivedState(existing.id);
    return { projectId: existing.id, slug: existing.slug, created: false, studioRoute: studioRoute(existing.slug) };
  }

  let recipeId: string | null = null;
  if (input.recipeKey) {
    const { data: recipe } = await supabase.from('site00_production_recipes').select('id').eq('recipe_key', input.recipeKey).maybeSingle();
    recipeId = recipe?.id ?? null;
  }
  if (!recipeId) {
    const { data: defaultRecipe } = await supabase.from('site00_production_recipes').select('id').eq('recipe_key', 'site_ecommerce').maybeSingle();
    recipeId = defaultRecipe?.id ?? null;
  }

  const { data: project, error } = await supabase
    .from('site00_projects')
    .insert({
      slug: input.slug,
      name: input.name,
      client_email: email,
      client_user_id: input.userId ?? null,
      build_class: input.buildClass ?? 'SITE',
      build_type: input.buildType ?? null,
      current_phase: 'DISCOVERY',
      payment_state: 'CONFIRMED',
      provisioning_state: 'IN_PROGRESS',
      status: 'ACTIVE',
      recipe_id: recipeId,
      metadata: input.metadata ?? {},
    })
    .select('id, slug')
    .single();

  if (error || !project) throw error ?? new Error('FAILED TO CREATE PROJECT');

  await supabase.from('site00_studio_pipeline_state').insert({
    project_id: project.id,
    interpret_status: 'PENDING',
    direct_status: 'PENDING',
    produce_status: 'PENDING',
    approve_status: 'PENDING',
  });

  await supabase.from('site00_provisioning_sessions').insert({
    project_id: project.id,
    status: 'OPEN',
    current_step: 'PROJECT_OFFICIAL',
    readiness_pct: 0,
  });

  await supabase.from('site00_project_activity').insert({
    project_id: project.id,
    event_type: 'PROJECT_CREATED',
    actor_type: 'CLIENT',
    summary: `PROJECT ${input.name.toUpperCase()} ACTIVATED IN STUDIO.`,
    metadata: { slug: input.slug },
  });

  await supabase.from('site00_project_activity').insert({
    project_id: project.id,
    event_type: 'PAYMENT_CONFIRMED',
    actor_type: 'SYSTEM',
    summary: 'PAYMENT AUTHORIZED. PRODUCTION ENVIRONMENT INITIALIZED.',
  });

  if (recipeId) {
    const { data: recipeDeliverables } = await supabase.from('site00_recipe_deliverables').select('*').eq('recipe_id', recipeId).order('sort_order');
    for (const rd of recipeDeliverables ?? []) {
      await supabase.from('site00_project_deliverables').insert({
        project_id: project.id,
        recipe_deliverable_id: rd.id,
        deliverable_key: rd.deliverable_key,
        category: rd.category,
        title: rd.title,
        description: rd.description,
        status: 'NOT_READY',
        recipe_id: recipeId,
        variants_requested: rd.default_variants,
      });
    }
  }

  await refreshProjectDerivedState(project.id);

  return { projectId: project.id, slug: project.slug, created: true, studioRoute: studioRoute(project.slug) };
}
