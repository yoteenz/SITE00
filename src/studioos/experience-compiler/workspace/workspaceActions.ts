import { applyGate0Action } from '../map2/conceptDirectionGate';
import { approveExperienceGraph } from '../map2/creativeExperienceGraph';
import { applyGateAAction, createGateA } from '../map2/experienceArchitectureGate';
import { approveFamiliesAndSurfaces } from '../map2/familySurfaceGate';
import { compileExperienceFamilies } from '../map2/experienceFamilies';
import { buildSurfaceExpressionsForFamilies } from '../map2/surfaceExpressions';
import { compileAuthorityPlan } from '../map2/authorityPlanner';
import { runIconPipeline } from '../icons/iconPipeline';
import { hybridizeConcepts, pushConceptConceptually } from '../map2/creativeConcepts';
import { createCustomExperience } from '../map2/customExperience';
import { applyReviewAction, createReviewFromPlan, refineReview } from '../map2/authorityReview';
import { applyIconReviewAction } from '../icons/iconReview';
import { planOpenArtBatches } from '../map2/openartBatchPlanner';
import { compileAuthorityPackManifest } from '../map2/authorityPackCompiler';
import type { ExperienceCompilerWorkspaceState } from './types';
import { persistWorkspace } from './persistence';

function pushHistory(state: ExperienceCompilerWorkspaceState, kind: string, detail: string): ExperienceCompilerWorkspaceState {
  return {
    ...state,
    history: [
      ...state.history,
      { id: `${Date.now()}`, at: new Date().toISOString(), kind, detail },
    ],
  };
}

export function selectConcept(state: ExperienceCompilerWorkspaceState, conceptId: string): ExperienceCompilerWorkspaceState {
  if (!state.pipeline.concept_set) return state;
  const gate = applyGate0Action(state.pipeline.gate_0, 'SELECT', { concept_id: conceptId });
  let next = pushHistory({ ...state, pipeline: { ...state.pipeline, gate_0: gate } }, 'GATE_0', `Selected ${conceptId}`);
  persistWorkspace(next);
  return next;
}

export function pushConcept(state: ExperienceCompilerWorkspaceState, conceptId: string, feedback: string): ExperienceCompilerWorkspaceState {
  if (!state.pipeline.concept_set) return state;
  const concept = state.pipeline.concept_set.concepts.find((c) => c.concept_id === conceptId);
  if (!concept) return state;
  const pushed = pushConceptConceptually(concept);
  pushed.experience_thesis += ` Feedback: ${feedback}`;
  const concepts = state.pipeline.concept_set.concepts.map((c) => (c.concept_id === conceptId ? pushed : c));
  const gate = applyGate0Action(state.pipeline.gate_0, 'PUSH_CONCEPTUALLY', { concept_id: pushed.concept_id });
  let next = pushHistory(
    {
      ...state,
      pipeline: {
        ...state.pipeline,
        concept_set: { ...state.pipeline.concept_set, concepts: [...concepts, pushed] },
        gate_0: { ...gate, selected_concept_id: pushed.concept_id, status: 'APPROVED' },
      },
    },
    'CONCEPT_PUSH',
    feedback,
  );
  persistWorkspace(next);
  return next;
}

export function hybridizeConcept(
  state: ExperienceCompilerWorkspaceState,
  baseId: string,
  borrowId: string,
  elements: string[],
  note: string,
): ExperienceCompilerWorkspaceState {
  if (!state.pipeline.concept_set) return state;
  const base = state.pipeline.concept_set.concepts.find((c) => c.concept_id === baseId);
  const borrow = state.pipeline.concept_set.concepts.find((c) => c.concept_id === borrowId);
  if (!base || !borrow) return state;
  const hybrid = hybridizeConcepts(base, borrow, elements);
  const gate = applyGate0Action(state.pipeline.gate_0, 'HYBRIDIZE', {
    hybrid: {
      base_direction: baseId,
      borrowed_elements: elements,
      rejected_elements: [],
      hybrid_reasoning: note,
      resulting_concept_id: hybrid.concept_id,
    },
  });
  let next = pushHistory(
    {
      ...state,
      pipeline: {
        ...state.pipeline,
        concept_set: { ...state.pipeline.concept_set, concepts: [...state.pipeline.concept_set.concepts, hybrid] },
        gate_0: gate,
      },
    },
    'HYBRID',
    note,
  );
  persistWorkspace(next);
  return next;
}

export function approveGraph(state: ExperienceCompilerWorkspaceState): ExperienceCompilerWorkspaceState {
  if (!state.pipeline.graph) return state;
  const graph = approveExperienceGraph(state.pipeline.graph);
  let gate_a = state.pipeline.gate_a ?? createGateA();
  gate_a = applyGateAAction(gate_a, 'APPROVE', 'Approved from workspace');
  let pipeline = { ...state.pipeline, graph, gate_a };
  const families = compileExperienceFamilies(graph, gate_a);
  const intelligence = pipeline.intelligence;
  const surfaces = intelligence ? buildSurfaceExpressionsForFamilies(families, intelligence) : pipeline.surface_expressions;
  const icon_pipeline = runIconPipeline({
    project_id: state.project_id,
    graph,
    families,
    surface_expressions: surfaces,
    intelligence: intelligence ?? undefined,
    auto_approve_family: false,
  });
  let gate_b = pipeline.gate_b;
  gate_b = approveFamiliesAndSurfaces(
    gate_b,
    families.map((f) => f.family_id),
    { icon_expression_approved: false, micro_asset_expression_approved: Boolean(icon_pipeline.micro_asset_family) },
  );
  pipeline = {
    ...pipeline,
    families,
    surface_expressions: surfaces,
    icon_pipeline,
    gate_b,
    authority_plan: [],
  };
  let next = pushHistory({ ...state, pipeline }, 'GATE_A', 'Experience graph approved');
  persistWorkspace(next);
  return next;
}

export function addCustomExperienceFromWorkspace(
  state: ExperienceCompilerWorkspaceState,
  input: { name: string; purpose: string; inherits_from: string[] },
): ExperienceCompilerWorkspaceState {
  const cx = createCustomExperience({
    name: input.name,
    description: input.purpose,
    business_purpose: input.purpose,
    inherits_from: input.inherits_from,
    new_family_id: `${input.name.replace(/\W/g, '_').toUpperCase()}_FAMILY`,
  });
  const graph = state.pipeline.graph;
  if (!graph) return state;
  const nextGraph = { ...graph, custom_experiences: [...graph.custom_experiences, cx], approved: false };
  let next = pushHistory(
    { ...state, pipeline: { ...state.pipeline, graph: nextGraph }, custom_experiences_draft: nextGraph.custom_experiences },
    'CUSTOM_EXPERIENCE',
    input.name,
  );
  persistWorkspace(next);
  return next;
}

export function approveAuthorityCandidate(state: ExperienceCompilerWorkspaceState, authorityId: string): ExperienceCompilerWorkspaceState {
  const entry = state.pipeline.authority_plan.find((a) => a.authority_id === authorityId);
  if (!entry) return state;
  let review = state.authority_reviews.find((r) => r.authority_id === authorityId && !r.superseded_by);
  if (!review) review = createReviewFromPlan(entry);
  applyReviewAction(review, 'LOVE_IT');
  const plan = state.pipeline.authority_plan.map((a) =>
    a.authority_id === authorityId ? { ...a, approval_status: 'APPROVED' as const } : a,
  );
  const reviews = [...state.authority_reviews.filter((r) => r.authority_id !== authorityId), review];
  let next = pushHistory(
    { ...state, pipeline: { ...state.pipeline, authority_plan: plan, gate_c: { ...state.pipeline.gate_c, status: 'PARTIAL' } }, authority_reviews: reviews },
    'AUTHORITY',
    `Approved ${authorityId}`,
  );
  persistWorkspace(next);
  return next;
}

export function refineAuthority(state: ExperienceCompilerWorkspaceState, authorityId: string, feedback: string): ExperienceCompilerWorkspaceState {
  const entry = state.pipeline.authority_plan.find((a) => a.authority_id === authorityId);
  if (!entry) return state;
  const current = state.authority_reviews.find((r) => r.authority_id === authorityId && !r.superseded_by) ?? createReviewFromPlan(entry);
  current.feedback = feedback;
  const nextReview = refineReview({ ...current });
  let next = pushHistory(
    { ...state, authority_reviews: [...state.authority_reviews, current, nextReview] },
    'AUTHORITY_REFINE',
    feedback,
  );
  persistWorkspace(next);
  return next;
}

export function approveIconExpression(state: ExperienceCompilerWorkspaceState): ExperienceCompilerWorkspaceState {
  if (!state.pipeline.icon_pipeline || !state.pipeline.graph) return state;
  const { family, review } = applyIconReviewAction(state.pipeline.icon_pipeline.icon_family, 'APPROVE_FAMILY');
  const icon_pipeline = { ...state.pipeline.icon_pipeline, icon_family: family, icon_expression_approved: true };
  let gate_b = approveFamiliesAndSurfaces(state.pipeline.gate_b, state.pipeline.gate_b.approved_family_ids, {
    icon_expression_approved: true,
    micro_asset_expression_approved: Boolean(icon_pipeline.micro_asset_family),
  });
  const authority_plan = compileAuthorityPlan(
    state.pipeline.families,
    state.pipeline.surface_expressions,
    gate_b,
    icon_pipeline.icon_family_authority.authority_id,
  );
  const openart_batches = planOpenArtBatches(state.project_id, authority_plan, icon_pipeline.icon_family_authority);
  const authority_pack = compileAuthorityPackManifest(state.project_id, authority_plan, openart_batches);
  let next = pushHistory(
    {
      ...state,
      pipeline: { ...state.pipeline, icon_pipeline, gate_b, authority_plan, openart_batches, authority_pack },
    },
    'ICON_FAMILY',
    review.status,
  );
  persistWorkspace(next);
  return next;
}

export function switchToHybridMode(state: ExperienceCompilerWorkspaceState): ExperienceCompilerWorkspaceState {
  if (state.mode !== 'INGEST') return state;
  let next = pushHistory({ ...state, mode: 'HYBRID' }, 'MODE', 'Reconcept requested — HYBRID');
  persistWorkspace(next);
  return next;
}
