import { getSupabaseAdmin } from '../supabase.js';
import { aiProductionDirector } from './aiDirector.js';
import { syncProductionBlockers } from './blockerSync.js';
import { buildDependencyMapFromRecipe, recomputeDeliverableReadiness } from './dependencyEngine.js';
import { computeNextActionsFromReadiness } from './nextActionEngine.js';
import {
  computeDeliverablesBlockedByService,
  evaluateProjectReadinessGraph,
  readinessSummaryForAi,
  type RecipeDeliverableInput,
} from './readinessEvaluator.js';
import type { ServiceInput } from './readinessEvaluator.js';

const DEMO_SLUG = 'northquarter-rebuild';

export async function ensureDemoProjectSeeded(): Promise<{ projectId: string; created: boolean }> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from('site00_projects').select('id').eq('slug', DEMO_SLUG).maybeSingle();
  if (existing?.id) return { projectId: existing.id, created: false };

  const { data: recipe } = await supabase
    .from('site00_production_recipes')
    .select('id')
    .eq('recipe_key', 'site_ecommerce')
    .single();
  if (!recipe) throw new Error('SITE ECOMMERCE RECIPE NOT FOUND');

  const { data: project, error: pErr } = await supabase
    .from('site00_projects')
    .insert({
      slug: DEMO_SLUG,
      name: 'NORTHQUARTER REBUILD',
      client_email: 'client@northquarter.example',
      build_class: 'SITE',
      build_type: 'ECOMMERCE',
      identity_state: 'SOME PIECES EXIST',
      current_phase: 'DESIGN_DIRECTION',
      project_health: 'ON_TRACK',
      payment_state: 'CONFIRMED',
      provisioning_state: 'IN_PROGRESS',
      production_readiness_pct: 50,
      environment_readiness_pct: 100,
      recipe_id: recipe.id,
    })
    .select('id')
    .single();
  if (pErr || !project) throw pErr ?? new Error('FAILED TO CREATE DEMO PROJECT');

  const projectId = project.id;

  await supabase.from('site00_project_intelligence').insert({
    project_id: projectId,
    identity_state: 'SOME PIECES EXIST',
    build_class: 'SITE',
    build_type: 'ECOMMERCE',
    business_type: 'ECOMMERCE',
    industry: 'PREMIUM SKINCARE',
    primary_goals: ['INCREASE CONVERSION', 'BUILD BRAND CREDIBILITY'],
    target_audience: ['WOMEN 25–45', 'PREMIUM SKINCARE BUYERS'],
    brand_maturity: 'PARTIAL',
    existing_assets: ['LOGO MARK', 'PRODUCT PHOTOGRAPHY'],
    missing_assets: ['TYPOGRAPHY SYSTEM', 'HOMEPAGE DIRECTION'],
    required_features: ['COLLECTION PAGES', 'CHECKOUT', 'MEMBER AREA'],
    timeline: 'Q4 LAUNCH',
    budget_range: '$4K+–$10K',
    current_phase: 'DESIGN_DIRECTION',
    confidence: 0.84,
    provenance: { build_class: 'CLIENT_PROVIDED', goals: 'AI_SUGGESTED' },
  });

  await supabase.from('site00_creative_constitutions').insert({
    project_id: projectId,
    brand_rules: ['PRIMARY RED: #EB1C24', 'USE APPROVED LOGO ONLY', 'BRIGHT ARCHITECTURE', 'NO GOLD'],
    client_preferences: ['MINIMAL LAYOUTS', 'EDITORIAL TYPOGRAPHY', 'STRONG WHITESPACE'],
    approved_decisions: ['DIRECTION B', 'TYPOGRAPHY OPTION 2'],
    rejected_decisions: ['DARK BACKGROUND', 'GRADIENT HERO', 'DIRECTION A'],
    must_include: ['PRODUCT CRAFTSMANSHIP STORY'],
    must_avoid: ['GENERIC ECOMMERCE CLICHÉS'],
  });

  const { data: recipeDeliverables } = await supabase
    .from('site00_recipe_deliverables')
    .select('*')
    .eq('recipe_id', recipe.id)
    .order('sort_order');

  const statusByKey: Record<string, string> = {
    strategy_synthesis: 'APPROVED',
    sitemap: 'APPROVED',
    conversion_architecture: 'APPROVED',
    homepage_visual_direction: 'GENERATING',
    collection_page: 'QUEUED',
    product_page: 'QUEUED',
    cart_checkout: 'NOT_READY',
    mobile_adaptation: 'BLOCKED',
    design_system: 'QUEUED',
    developer_handoff: 'NOT_READY',
    frontend_build: 'NOT_READY',
    backend_build: 'NOT_READY',
    preview_deployment: 'NOT_READY',
    payment_integration: 'NOT_READY',
    production_domain: 'NOT_READY',
    transactional_email: 'NOT_READY',
  };

  for (const rd of recipeDeliverables ?? []) {
    await supabase.from('site00_project_deliverables').insert({
      project_id: projectId,
      recipe_deliverable_id: rd.id,
      deliverable_key: rd.deliverable_key,
      category: rd.category,
      title: rd.title,
      description: rd.description,
      status: statusByKey[rd.deliverable_key] ?? 'NOT_READY',
      recipe_id: recipe.id,
      variants_requested: rd.default_variants,
      blocked_by: rd.deliverable_key === 'mobile_adaptation' ? ['homepage_visual_direction'] : [],
    });
  }

  await supabase.from('site00_studio_pipeline_state').insert({
    project_id: projectId,
    interpret_status: 'COMPLETE',
    direct_status: 'COMPLETE',
    produce_status: 'IN_PROGRESS',
    approve_status: 'PENDING',
  });

  const { data: homepageDel } = await supabase
    .from('site00_project_deliverables')
    .select('id')
    .eq('project_id', projectId)
    .eq('deliverable_key', 'homepage_visual_direction')
    .single();

  if (homepageDel) {
    const briefJson = await aiProductionDirector.generateBrief({
      deliverableTitle: 'HOMEPAGE ART DIRECTION',
      projectName: 'NORTHQUARTER REBUILD',
      constitution: {},
    });
    const { data: brief } = await supabase
      .from('site00_production_briefs')
      .insert({
        project_id: projectId,
        deliverable_id: homepageDel.id,
        title: String(briefJson.title),
        status: 'APPROVED',
        brief_json: briefJson,
        provenance: 'AI_SUGGESTED',
      })
      .select('id')
      .single();

    await supabase.from('site00_production_jobs').insert([
      {
        project_id: projectId,
        deliverable_id: homepageDel.id,
        brief_id: brief?.id,
        status: 'PROCESSING',
        variants_requested: 3,
        progress_pct: 62,
        provider: 'dev-adapter',
        started_at: new Date().toISOString(),
        metadata: { label: 'HOMEPAGE ART DIRECTION' },
      },
      {
        project_id: projectId,
        deliverable_id: homepageDel.id,
        status: 'QUEUED',
        variants_requested: 2,
        metadata: { label: 'TYPOGRAPHY SYSTEM' },
      },
    ]);
  }

  const { data: services } = await supabase.from('site00_service_catalog').select('id, provider_key');
  const phaseByKey: Record<string, string> = {
    github: 'BUILD',
    vercel: 'BUILD',
    supabase: 'BUILD',
    stripe: 'INTEGRATION',
    resend: 'INTEGRATION',
    godaddy: 'LAUNCH',
    shopify: 'INTEGRATION',
  };

  for (const svc of services ?? []) {
    let state = 'NOT_REQUIRED';
    const phase = phaseByKey[svc.provider_key] ?? 'LAUNCH';
    if (svc.provider_key === 'github' || svc.provider_key === 'vercel') {
      state = 'CONNECTED';
    } else if (svc.provider_key === 'supabase') {
      state = 'CLIENT_ACTION_REQUIRED';
    } else if (svc.provider_key === 'stripe' || svc.provider_key === 'resend' || svc.provider_key === 'godaddy') {
      state = 'REQUIRED_LATER';
    }
    await supabase.from('site00_project_service_requirements').insert({
      project_id: projectId,
      service_id: svc.id,
      required_phase: phase,
      connection_state: state,
      owner_type: 'CLIENT',
    });
    if (state === 'CONNECTED') {
      await supabase.from('site00_service_connections').insert({
        project_id: projectId,
        service_id: svc.id,
        connection_state: 'CONNECTED',
        owner_type: 'CLIENT',
        connected_account_label: 'CLIENT OWNED',
        permission_level: 'DEVELOPER',
      });
    }
  }

  await supabase.from('site00_provisioning_sessions').insert({
    project_id: projectId,
    status: 'OPEN',
    current_step: 'CONNECT_ACCESS',
    readiness_pct: 100,
  });

  await supabase.from('site00_approval_requests').insert([
    {
      project_id: projectId,
      title: 'HOMEPAGE ART DIRECTION — OPTION B',
      category: 'DESIGN',
      status: 'ADMIN_REVIEW',
      priority: 'HIGH',
    },
    {
      project_id: projectId,
      title: 'BRAND VOICE REFINEMENT',
      category: 'COPY',
      status: 'AI_DRAFT',
      priority: 'MEDIUM',
    },
  ]);

  await supabase.from('site00_project_activity').insert([
    { project_id: projectId, event_type: 'PAYMENT_CONFIRMED', actor_type: 'SYSTEM', summary: 'PAYMENT CONFIRMED FOR NORTHQUARTER REBUILD.' },
    { project_id: projectId, event_type: 'BRIEF_APPROVED', actor_type: 'ADMIN', summary: 'HOMEPAGE ART DIRECTION BRIEF APPROVED.' },
    { project_id: projectId, event_type: 'GENERATION_STARTED', actor_type: 'AI', summary: 'HOMEPAGE ART DIRECTION GENERATION STARTED (3 VARIANTS).' },
  ]);

  await refreshProjectDerivedState(projectId);

  return { projectId, created: true };
}

async function loadServiceInputs(projectId: string, currentPhase: string): Promise<ServiceInput[]> {
  const supabase = getSupabaseAdmin();
  const { data: requirements } = await supabase
    .from('site00_project_service_requirements')
    .select('service_id, required_phase, connection_state, owner_type, site00_service_catalog(id, provider_key, display_name)')
    .eq('project_id', projectId);

  const { data: connections } = await supabase
    .from('site00_service_connections')
    .select('service_id, connection_state, permission_level, owner_type')
    .eq('project_id', projectId);

  const connByService = new Map((connections ?? []).map((c) => [c.service_id, c]));

  return (requirements ?? []).map((r) => {
    const cat = r.site00_service_catalog as { id: string; provider_key: string; display_name: string } | null;
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

async function loadRecipeByKey(recipeId: string | null): Promise<Map<string, RecipeDeliverableInput>> {
  const supabase = getSupabaseAdmin();
  if (!recipeId) return new Map();
  const { data } = await supabase
    .from('site00_recipe_deliverables')
    .select('deliverable_key, depends_on, required_services, required_assets, required_approvals')
    .eq('recipe_id', recipeId);

  const map = new Map<string, RecipeDeliverableInput>();
  for (const row of data ?? []) {
    map.set(row.deliverable_key, {
      deliverable_key: row.deliverable_key,
      depends_on: Array.isArray(row.depends_on) ? row.depends_on.map(String) : [],
      required_services: Array.isArray(row.required_services) ? row.required_services : [],
      required_assets: Array.isArray(row.required_assets) ? row.required_assets.map(String) : [],
      required_approvals: Array.isArray(row.required_approvals) ? row.required_approvals.map(String) : [],
    });
  }
  return map;
}

export async function refreshProjectDerivedState(projectId: string) {
  const supabase = getSupabaseAdmin();

  const { data: project } = await supabase.from('site00_projects').select('*').eq('id', projectId).single();
  if (!project) return;

  await syncMissingRecipeDeliverables(projectId, project.recipe_id);

  const { data: deliverables } = await supabase
    .from('site00_project_deliverables')
    .select('id, deliverable_key, title, status, blocked_by, approval_required')
    .eq('project_id', projectId);

  const recipeByKey = await loadRecipeByKey(project.recipe_id);
  const depMap = buildDependencyMapFromRecipe(
    [...recipeByKey.values()].map((r) => ({ deliverable_key: r.deliverable_key, depends_on: r.depends_on })),
  );

  const recomputed = recomputeDeliverableReadiness(
    (deliverables ?? []).map((d) => ({
      id: d.id,
      deliverable_key: d.deliverable_key,
      status: d.status,
      blocked_by: d.blocked_by ?? [],
    })),
    depMap,
  );

  for (const d of recomputed) {
    const prev = deliverables?.find((x) => x.id === d.id);
    const keepGenerating = ['GENERATING', 'PROCESSING', 'QUEUED', 'AI_DRAFT', 'ADMIN_REVIEW'].includes(
      String(prev?.status),
    );
    const nextStatus =
      d.status === 'BLOCKED' && keepGenerating ? String(prev?.status) : d.status;
    await supabase
      .from('site00_project_deliverables')
      .update({ status: nextStatus, blocked_by: d.blocked_by })
      .eq('id', d.id);
  }

  const { data: intelligence } = await supabase
    .from('site00_project_intelligence')
    .select('existing_assets')
    .eq('project_id', projectId)
    .maybeSingle();

  const services = await loadServiceInputs(projectId, project.current_phase);
  const readiness = evaluateProjectReadinessGraph({
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
      current_phase: project.current_phase,
      payment_state: project.payment_state,
    },
    deliverables: (deliverables ?? []).map((d) => ({
      id: d.id,
      deliverable_key: d.deliverable_key,
      title: d.title,
      status: String(d.status),
      blocked_by: d.blocked_by ?? [],
      approval_required: d.approval_required ?? false,
    })),
    recipeByKey,
    services,
    existingAssets: Array.isArray(intelligence?.existing_assets) ? intelligence.existing_assets.map(String) : [],
  });

  await syncProductionBlockers(supabase, projectId, readiness.blockers);

  const blockedByService = computeDeliverablesBlockedByService(readiness.deliverables);
  for (const svc of services) {
    const blocks = blockedByService.get(svc.provider_key) ?? [];
    await supabase
      .from('site00_project_service_requirements')
      .update({ dependency_impact: blocks })
      .eq('project_id', projectId)
      .eq('service_id', svc.service_id);
  }

  const complete = readiness.deliverables.filter((d) =>
    ['APPROVED', 'CLIENT_APPROVED', 'DELIVERED'].includes(d.workflow_status),
  ).length;

  await supabase
    .from('site00_projects')
    .update({
      production_readiness_pct: Math.round(
        (readiness.deliverables.filter((d) => d.overall === 'ready').length /
          Math.max(readiness.deliverables.length, 1)) *
          100,
      ),
      environment_readiness_pct: readiness.environment.current_phase_readiness_pct,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  const { count: pendingApprovals } = await supabase
    .from('site00_approval_requests')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .in('status', ['AI_DRAFT', 'ADMIN_REVIEW']);

  const { data: feedback } = await supabase
    .from('site00_client_feedback')
    .select('id, body')
    .eq('project_id', projectId)
    .eq('status', 'RECEIVED');

  const actions = computeNextActionsFromReadiness({
    project,
    readiness,
    pendingApprovals: pendingApprovals ?? 0,
    feedback: feedback ?? [],
  });

  await supabase.from('site00_next_actions').delete().eq('project_id', projectId).is('resolved_at', null);
  if (actions.length) {
    await supabase.from('site00_next_actions').insert(actions);
  }

  return readiness;
}

async function syncMissingRecipeDeliverables(projectId: string, recipeId: string | null) {
  if (!recipeId) return;
  const supabase = getSupabaseAdmin();
  const { data: recipeDeliverables } = await supabase
    .from('site00_recipe_deliverables')
    .select('*')
    .eq('recipe_id', recipeId);
  const { data: existing } = await supabase
    .from('site00_project_deliverables')
    .select('deliverable_key')
    .eq('project_id', projectId);
  const existingKeys = new Set((existing ?? []).map((e) => e.deliverable_key));

  for (const rd of recipeDeliverables ?? []) {
    if (existingKeys.has(rd.deliverable_key)) continue;
    await supabase.from('site00_project_deliverables').insert({
      project_id: projectId,
      recipe_deliverable_id: rd.id,
      deliverable_key: rd.deliverable_key,
      category: rd.category,
      title: rd.title,
      description: rd.description,
      status: 'NOT_READY',
      recipe_id: recipeId,
      variants_requested: rd.default_variants,
      blocked_by: [],
    });
  }
}

export async function updateServiceConnectionState(
  projectId: string,
  providerKey: string,
  connectionState: string,
  actorType: 'CLIENT' | 'ADMIN' | 'SYSTEM' = 'SYSTEM',
) {
  const supabase = getSupabaseAdmin();
  const { data: svc } = await supabase.from('site00_service_catalog').select('id, display_name').eq('provider_key', providerKey).single();
  if (!svc) throw new Error('SERVICE NOT FOUND');

  await supabase
    .from('site00_project_service_requirements')
    .update({ connection_state: connectionState, last_verified_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .eq('service_id', svc.id);

  if (['CONNECTED', 'ACCESS_LIMITED'].includes(connectionState)) {
    await supabase.from('site00_service_connections').upsert(
      {
        project_id: projectId,
        service_id: svc.id,
        connection_state: connectionState,
        owner_type: 'CLIENT',
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id,service_id' },
    );
  } else {
    await supabase
      .from('site00_service_connections')
      .update({ connection_state: connectionState, updated_at: new Date().toISOString() })
      .eq('project_id', projectId)
      .eq('service_id', svc.id);
  }

  await supabase.from('site00_project_activity').insert({
    project_id: projectId,
    event_type: 'SERVICE_CONNECTION_CHANGED',
    actor_type: actorType,
    summary: `${svc.display_name.toUpperCase()} ACCESS ${connectionState.replace(/_/g, ' ')}.`,
    metadata: { providerKey, connectionState },
  });

  const readiness = await refreshProjectDerivedState(projectId);

  const unblocked = readiness?.deliverables.filter(
    (d) => d.deliverable_key === 'backend_build' && d.overall === 'ready',
  );
  if (unblocked?.length && connectionState === 'CONNECTED' && providerKey === 'supabase') {
    await supabase.from('site00_project_activity').insert({
      project_id: projectId,
      event_type: 'DELIVERABLE_UNBLOCKED',
      actor_type: 'SYSTEM',
      summary: 'BACKEND BUILD IS NOW READY.',
      metadata: { deliverableKey: 'backend_build' },
    });
  }

  return readiness;
}
