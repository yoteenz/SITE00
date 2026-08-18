import { getSupabaseAdmin } from '../supabase.js';
import { aiProductionDirector } from './aiDirector.js';
import { ensureDemoProjectSeeded, refreshProjectDerivedState, updateServiceConnectionState } from './seedDemo.js';
import { readinessSummaryForAi } from './readinessEvaluator.js';
import { effectiveServiceState, isServiceRequiredForCurrentPhase, provisioningPriorityBucket } from './serviceAccess.js';
import type { ServiceInput } from './readinessEvaluator.js';

export async function getDashboardPayload() {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();

  const { data: projects } = await supabase.from('site00_projects').select('*').eq('status', 'ACTIVE').order('updated_at', { ascending: false });

  const { data: nextActions } = await supabase
    .from('site00_next_actions')
    .select('*, site00_projects(name, slug)')
    .is('resolved_at', null)
    .order('created_at', { ascending: false })
    .limit(20);

  const { count: approvalCount } = await supabase
    .from('site00_approval_requests')
    .select('*', { count: 'exact', head: true })
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW']);

  const { data: accessAlerts } = await supabase
    .from('site00_production_blockers')
    .select('*, site00_projects(name, slug)')
    .eq('blocker_type', 'access')
    .is('resolved_at', null);

  return {
    projects: projects ?? [],
    nextActions: nextActions ?? [],
    approvalCount: approvalCount ?? 0,
    accessAlerts: accessAlerts ?? [],
  };
}

export async function getStudioPayload(projectId?: string) {
  const supabase = getSupabaseAdmin();
  const { projectId: demoId } = await ensureDemoProjectSeeded();
  const pid = projectId ?? demoId;

  const readiness = await refreshProjectDerivedState(pid);

  const { data: project } = await supabase.from('site00_projects').select('*').eq('id', pid).single();
  const { data: pipeline } = await supabase.from('site00_studio_pipeline_state').select('*').eq('project_id', pid).maybeSingle();
  const { data: intelligence } = await supabase.from('site00_project_intelligence').select('*').eq('project_id', pid).maybeSingle();
  const { data: deliverables } = await supabase.from('site00_project_deliverables').select('*').eq('project_id', pid).order('category');
  const { data: jobs } = await supabase.from('site00_production_jobs').select('*').eq('project_id', pid).order('created_at', { ascending: false });
  const { data: projects } = await supabase.from('site00_projects').select('id, name, slug, current_phase, project_health, production_readiness_pct, environment_readiness_pct').eq('status', 'ACTIVE');

  const readinessByDeliverableId = new Map(
    readiness?.deliverables.map((d) => [d.deliverable_id, d]) ?? [],
  );

  const deliverablesWithReadiness = (deliverables ?? []).map((d) => ({
    ...d,
    readiness: readinessByDeliverableId.get(d.id) ?? null,
  }));

  const aiContext = readiness ? readinessSummaryForAi(readiness) : null;
  const insights = await aiProductionDirector.recommendInsights({
    name: project?.name ?? '',
    readiness: aiContext,
  });

  const deliverableMap = groupDeliverables(deliverables ?? []);

  return {
    project,
    pipeline,
    intelligence,
    deliverables: deliverablesWithReadiness,
    deliverableMap,
    jobs,
    projects,
    insights,
    readiness,
    environmentReadiness: readiness?.environment ?? null,
  };
}

export async function getApprovalsPayload(category?: string) {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();

  let q = supabase
    .from('site00_approval_requests')
    .select('*, site00_projects(name, slug)')
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW'])
    .order('submitted_at', { ascending: false });

  if (category && category !== 'ALL') {
    q = q.eq('category', category);
  }

  const { data: items } = await q;
  return { items: items ?? [], total: items?.length ?? 0 };
}

export async function getProjectsPayload() {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();
  const { data: projects } = await supabase.from('site00_projects').select('*').order('updated_at', { ascending: false });
  return { projects: projects ?? [] };
}

export async function getProjectWorkspace(projectId: string, section: string) {
  const supabase = getSupabaseAdmin();
  const readiness = await refreshProjectDerivedState(projectId);

  const { data: project } = await supabase.from('site00_projects').select('*').eq('id', projectId).single();
  if (!project) throw new Error('PROJECT NOT FOUND');

  const { data: deliverables } = await supabase.from('site00_project_deliverables').select('*').eq('project_id', projectId);
  const { data: nextActions } = await supabase.from('site00_next_actions').select('*').eq('project_id', projectId).is('resolved_at', null);
  const { data: jobs } = await supabase.from('site00_production_jobs').select('*').eq('project_id', projectId);

  const readinessByDeliverableId = new Map(readiness?.deliverables.map((d) => [d.deliverable_id, d]) ?? []);

  const base = {
    project,
    intelligence: null as Record<string, unknown> | null,
    constitution: null as Record<string, unknown> | null,
    deliverables: (deliverables ?? []).map((d) => ({
      ...d,
      readiness: readinessByDeliverableId.get(d.id) ?? null,
    })),
    deliverableMap: groupDeliverables(deliverables ?? []),
    approvals: [] as unknown[],
    access: [] as unknown[],
    activity: [] as unknown[],
    jobs: jobs ?? [],
    nextActions: nextActions ?? [],
    studioSummary: { complete: 0, inProgress: 0, queued: 0, blocked: 0, total: 0 },
    readiness,
    environmentReadiness: readiness?.environment ?? null,
    blockers: readiness?.blockers ?? [],
  };

  const { data: intelligence } = await supabase.from('site00_project_intelligence').select('*').eq('project_id', projectId).maybeSingle();
  const { data: constitution } = await supabase.from('site00_creative_constitutions').select('*').eq('project_id', projectId).maybeSingle();
  base.intelligence = intelligence;
  base.constitution = constitution;

  const statuses = deliverables ?? [];
  base.studioSummary = {
    complete: statuses.filter((d) => ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(d.status)).length,
    inProgress: statuses.filter((d) => ['GENERATING', 'AI_DRAFT', 'ADMIN_REVIEW', 'IN_PROGRESS'].includes(d.status)).length,
    queued: statuses.filter((d) => ['QUEUED', 'READY', 'BRIEF_GENERATED'].includes(d.status)).length,
    blocked: readiness?.deliverables.filter((d) => d.overall === 'blocked').length ?? 0,
    total: statuses.length,
  };

  if (section === 'approvals' || section === 'overview') {
    const { data: approvals } = await supabase.from('site00_approval_requests').select('*').eq('project_id', projectId);
    base.approvals = approvals ?? [];
  }
  if (section === 'access' || section === 'overview') {
    const services = await loadServiceInputsForProject(projectId, project.current_phase);
    const blockedByService = new Map<string, string[]>();
    for (const d of readiness?.deliverables ?? []) {
      for (const b of d.blockers) {
        if (b.type !== 'access' || !b.service_key) continue;
        const list = blockedByService.get(b.service_key) ?? [];
        if (!list.includes(d.title)) list.push(d.title);
        blockedByService.set(b.service_key, list);
      }
    }

    base.access = services.map((svc) => {
      const effective = effectiveServiceState({
        requirementState: svc.requirement_state,
        connectionState: svc.connection_state,
        requiredPhase: svc.required_phase,
        currentPhase: project.current_phase,
      });
      const blocks = blockedByService.get(svc.provider_key) ?? [];
      return {
        ...svc,
        effective_state: effective,
        currently_required: isServiceRequiredForCurrentPhase(svc.required_phase, project.current_phase, effective),
        blocks,
        blocks_label: blocks.length ? blocks.join(', ') : 'NOTHING YET',
        provisioning_bucket: provisioningPriorityBucket(svc.required_phase, project.current_phase, effective),
      };
    });
  }
  if (section === 'activity' || section === 'overview') {
    const { data: activity } = await supabase
      .from('site00_project_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);
    base.activity = activity ?? [];
  }

  return base;
}

export async function getCtrlRoomPayload(clientEmail?: string) {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();

  let projectQuery = supabase.from('site00_projects').select('id, name, slug, client_email').eq('status', 'ACTIVE');
  if (clientEmail) {
    projectQuery = projectQuery.eq('client_email', clientEmail);
  }
  const { data: projects } = await projectQuery;

  const signals = [];
  for (const p of projects ?? []) {
    const readiness = await refreshProjectDerivedState(p.id);
    for (const s of readiness?.ctrl_room_signals ?? []) {
      signals.push(s);
    }
  }

  return { signals, projects: projects ?? [] };
}

export async function getProvisioningPayload(projectSlug: string) {
  const supabase = getSupabaseAdmin();
  await ensureDemoProjectSeeded();

  const { data: project } = await supabase.from('site00_projects').select('*').eq('slug', projectSlug).single();
  if (!project) throw new Error('PROJECT NOT FOUND');

  const readiness = await refreshProjectDerivedState(project.id);
  const services = await loadServiceInputsForProject(project.id, project.current_phase);

  const rows = services
    .filter((s) => s.requirement_state !== 'NOT_REQUIRED')
    .map((svc) => {
      const effective = effectiveServiceState({
        requirementState: svc.requirement_state,
        connectionState: svc.connection_state,
        requiredPhase: svc.required_phase,
        currentPhase: project.current_phase,
      });
      return {
        provider_key: svc.provider_key,
        display_name: svc.display_name,
        required_phase: svc.required_phase,
        effective_state: effective,
        owner_type: svc.owner_type,
        bucket: provisioningPriorityBucket(svc.required_phase, project.current_phase, effective),
        help: `SITE 00 NEEDS ${svc.display_name.toUpperCase()} ACCESS FOR YOUR BUILD.`,
      };
    });

  return {
    project: { id: project.id, slug: project.slug, name: project.name, current_phase: project.current_phase },
    environmentReadiness: readiness?.environment ?? null,
    services: {
      needed_now: rows.filter((r) => r.bucket === 'NEEDED_NOW'),
      coming_up: rows.filter((r) => r.bucket === 'COMING_UP'),
      later: rows.filter((r) => r.bucket === 'LATER'),
      complete: rows.filter((r) => r.bucket === 'COMPLETE'),
    },
  };
}

async function loadServiceInputsForProject(projectId: string, currentPhase: string): Promise<ServiceInput[]> {
  const supabase = getSupabaseAdmin();
  const { data: requirements } = await supabase
    .from('site00_project_service_requirements')
    .select('service_id, required_phase, connection_state, owner_type, site00_service_catalog(id, provider_key, display_name, description, category)')
    .eq('project_id', projectId);

  const { data: connections } = await supabase
    .from('site00_service_connections')
    .select('service_id, connection_state, permission_level, owner_type')
    .eq('project_id', projectId);

  const connByService = new Map((connections ?? []).map((c) => [c.service_id, c]));

  return (requirements ?? []).map((r) => {
    const cat = r.site00_service_catalog as {
      id: string;
      provider_key: string;
      display_name: string;
      description?: string;
      category?: string;
    } | null;
    const conn = connByService.get(r.service_id);
    return {
      service_id: r.service_id,
      provider_key: cat?.provider_key ?? '',
      display_name: cat?.display_name ?? '',
      required_phase: r.required_phase,
      requirement_state: r.connection_state,
      connection_state: conn?.connection_state ?? null,
      owner_type: r.owner_type,
    };
  });
}

export async function approveBrief(briefId: string, adminUserId: string) {
  const supabase = getSupabaseAdmin();
  const { data: brief } = await supabase
    .from('site00_production_briefs')
    .update({ status: 'APPROVED', approved_by: adminUserId, approved_at: new Date().toISOString() })
    .eq('id', briefId)
    .select('project_id')
    .single();
  if (brief?.project_id) await refreshProjectDerivedState(brief.project_id);
  return brief;
}

export async function decideApproval(approvalId: string, decision: string, adminUserId: string, notes?: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('site00_approval_requests')
    .update({
      status: decision === 'APPROVE' ? 'APPROVED_INTERNALLY' : 'REVISION',
      decision,
      notes,
      decided_by: adminUserId,
      decided_at: new Date().toISOString(),
    })
    .eq('id', approvalId)
    .select('project_id')
    .single();
  if (data?.project_id) await refreshProjectDerivedState(data.project_id);
  return data;
}

export async function generateBriefForDeliverable(projectId: string, deliverableKey: string) {
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('site00_projects').select('name').eq('id', projectId).single();
  const { data: del } = await supabase
    .from('site00_project_deliverables')
    .select('id, title')
    .eq('project_id', projectId)
    .eq('deliverable_key', deliverableKey)
    .single();
  if (!del) throw new Error('DELIVERABLE NOT FOUND');

  const { data: constitution } = await supabase.from('site00_creative_constitutions').select('*').eq('project_id', projectId).maybeSingle();
  const briefJson = await aiProductionDirector.generateBrief({
    deliverableTitle: del.title,
    projectName: project?.name ?? '',
    constitution: constitution ?? {},
  });

  const { data: brief } = await supabase
    .from('site00_production_briefs')
    .insert({
      project_id: projectId,
      deliverable_id: del.id,
      title: String(briefJson.title),
      status: 'DRAFT',
      brief_json: briefJson,
    })
    .select('*')
    .single();

  await supabase.from('site00_project_deliverables').update({ status: 'BRIEF_GENERATED', brief_id: brief?.id }).eq('id', del.id);
  await refreshProjectDerivedState(projectId);
  return brief;
}

function groupDeliverables(rows: Array<{ category: string; status: string }>) {
  const map: Record<string, { complete: number; total: number }> = {};
  for (const row of rows) {
    if (!map[row.category]) map[row.category] = { complete: 0, total: 0 };
    map[row.category].total += 1;
    if (['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(row.status)) {
      map[row.category].complete += 1;
    }
  }
  return map;
}

export { ensureDemoProjectSeeded, refreshProjectDerivedState, updateServiceConnectionState };
