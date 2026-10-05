import type { WorkspaceCreativeDirectorSnapshot } from '../../../../shared/studioos-experience-compiler/creativeDirectorTypes.js';
import type { ExperienceCompilerWorkspaceState } from '../workspace/types.js';
import { pipelineStageLabel } from '../workspace/batchReadiness';

export function buildCreativeDirectorSnapshot(state: ExperienceCompilerWorkspaceState): WorkspaceCreativeDirectorSnapshot {
  const intel = state.pipeline.intelligence;
  return {
    project_id: state.project_id,
    project_slug: state.project_slug,
    project_name: state.project_name,
    mode: state.mode,
    phase_label: pipelineStageLabel(state.pipeline),
    approved_authority_count: state.pipeline.authority_plan.filter(
      (a) => a.approval_status === 'APPROVED' || a.approval_status === 'LOVE_IT',
    ).length,
    open_founder_gates: [
      state.pipeline.gate_0.status !== 'APPROVED' ? 'GATE_0_CONCEPT' : '',
      !state.pipeline.graph?.approved ? 'GATE_A_GRAPH' : '',
      state.pipeline.gate_b.status !== 'APPROVED' ? 'GATE_B_FAMILIES' : '',
      state.pipeline.gate_c.status !== 'APPROVED' ? 'GATE_C_AUTHORITY' : '',
    ].filter(Boolean),
    active_experience_family: state.pipeline.families[0]?.family_id ?? null,
    production_stage: pipelineStageLabel(state.pipeline),
    intelligence_summary: {
      brand_name: intel?.brand_name ?? state.project_name,
      business_model: intel?.business_model,
      audience: intel?.audience,
      creative_appetite: intel?.creative_appetite,
      constraints: intel?.constraints,
    },
    pipeline_summary: {
      graph: state.pipeline.graph,
      families: state.pipeline.families,
      surfaces: state.pipeline.surface_expressions,
      authorities: state.pipeline.authority_plan,
      authority_ids: state.pipeline.authority_plan.map((a) => a.authority_id),
    },
  };
}
