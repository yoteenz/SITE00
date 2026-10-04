import type { ExperienceCompilerWorkspaceState, WorkspaceMetrics } from './types';

export function computeWorkspaceMetrics(state: ExperienceCompilerWorkspaceState): WorkspaceMetrics {
  const graph = state.pipeline.graph;
  const routes = graph?.nodes.length ?? 0;
  const families = state.pipeline.families.length;
  const plan = state.pipeline.authority_plan;
  const approved = plan.filter((a) => a.approval_status === 'APPROVED' || a.approval_status === 'LOVE_IT').length;
  const screens_unlocked = plan.reduce((s, a) => s + a.routes_unlocked, 0);
  const sonnet_ready = Object.values(state.sonnet_batch_status).filter((s) => s === 'SONNET_READY').length;
  const blocked = Object.values(state.sonnet_batch_status).filter((s) => s !== 'SONNET_READY' && s !== 'IMPLEMENTED').length;

  return {
    experience_units: graph?.nodes.length ?? 0,
    routes,
    families,
    custom_experiences: graph?.custom_experiences.length ?? 0,
    integrations: graph?.integrations.length ?? 0,
    authorities_required: plan.length || state.site00_authority_count || 0,
    authorities_approved: approved,
    screens_unlocked,
    sonnet_ready_batches: sonnet_ready,
    blocked_batches: blocked,
  };
}

export function nextFounderAction(state: ExperienceCompilerWorkspaceState): string {
  const p = state.pipeline;
  if (state.mode === 'GREENFIELD' || state.mode === 'HYBRID') {
    if (p.gate_0.status !== 'APPROVED') return 'Approve a concept direction (Gate 0)';
  }
  if (!p.graph?.approved) return 'Review and approve experience graph (Gate A)';
  if (p.gate_b.status !== 'APPROVED') return 'Approve families and surface expressions (Gate B)';
  if (p.authority_plan.length && p.gate_c.status !== 'APPROVED') return 'Review visual authorities (Gate C)';
  if (state.ingested_assets.length < p.authority_plan.length) return 'Ingest OpenArt manifest outputs';
  return 'Compile authority pack and emit Sonnet batch';
}
