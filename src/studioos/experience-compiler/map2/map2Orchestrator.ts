import { buildGreenfieldConceptSet, hybridizeConcepts } from './creativeConcepts';
import { applyGate0Action, createGate0, markConceptSelected } from './conceptDirectionGate';
import { expandConceptToGraph, approveExperienceGraph } from './creativeExperienceGraph';
import { applyGateAAction, createGateA } from './experienceArchitectureGate';
import { compileExperienceFamilies } from './experienceFamilies';
import { buildSurfaceExpressionsForFamilies } from './surfaceExpressions';
import { approveFamiliesAndSurfaces, createGateB } from './familySurfaceGate';
import { compileAuthorityPlan, computeAuthorityReduction } from './authorityPlanner';
import { planOpenArtBatches } from './openartBatchPlanner';
import { compileAuthorityPackManifest } from './authorityPackCompiler';
import { promoteCapabilityFromCustomExperience } from './capabilities';
import { buildGreenfieldProjectIntelligence } from './projectIntelligence';
import { resolveProjectMode } from './projectMode';
import { reclassifyGraphUnits } from './experienceUnits';
import type { Map2PipelineState } from './map2Types';

export function runGreenfieldMap2Pipeline(options?: { hybrid?: boolean }): Map2PipelineState {
  const intelligence = buildGreenfieldProjectIntelligence();
  const concept_set = buildGreenfieldConceptSet(intelligence);
  let gate_0 = createGate0();

  const dirB = concept_set.concepts.find((c) => c.concept_id === 'DIR_B_PRODUCT_LAB')!;
  const dirC = concept_set.concepts.find((c) => c.concept_id === 'DIR_C_IMMERSIVE_DESTINATION')!;
  let selected = dirB;
  if (options?.hybrid) {
    selected = hybridizeConcepts(dirB, dirC, ['SPATIAL SHOWROOM']);
    gate_0 = applyGate0Action(gate_0, 'HYBRIDIZE', {
      hybrid: {
        base_direction: dirB.concept_id,
        borrowed_elements: ['SPATIAL SHOWROOM'],
        rejected_elements: ['TOKEN MARKET'],
        hybrid_reasoning: 'Lab foundation + immersive showroom borrow',
        resulting_concept_id: selected.concept_id,
      },
    });
  } else {
    gate_0 = applyGate0Action(gate_0, 'SELECT', { concept_id: dirB.concept_id });
  }
  markConceptSelected(concept_set.concepts, selected.concept_id);

  let graph = expandConceptToGraph(intelligence.project_id, selected, gate_0);
  graph = { ...graph, nodes: reclassifyGraphUnits(graph.nodes) };

  let gate_a = createGateA();
  gate_a = applyGateAAction(gate_a, 'AMEND', 'Founder added expert review emphasis');
  graph = approveExperienceGraph(graph);
  gate_a = applyGateAAction(gate_a, 'APPROVE', 'Graph approved for family compile');

  const families = compileExperienceFamilies(graph, gate_a);
  const surface_expressions = buildSurfaceExpressionsForFamilies(families, intelligence);
  let gate_b = createGateB();
  gate_b = approveFamiliesAndSurfaces(
    gate_b,
    families.map((f) => f.family_id),
  );

  const authority_plan = compileAuthorityPlan(families, surface_expressions, gate_b);
  computeAuthorityReduction(graph.nodes.length, authority_plan);

  const openart_batches = planOpenArtBatches(intelligence.project_id, authority_plan);
  const authority_pack = compileAuthorityPackManifest(intelligence.project_id, authority_plan, openart_batches);

  const capabilities = graph.custom_experiences
    .map((cx) => promoteCapabilityFromCustomExperience(cx, intelligence.project_id))
    .filter(Boolean) as Map2PipelineState['capabilities'];

  return {
    mode: resolveProjectMode({ has_existing_product: false, preserve_product_truth: false, requires_reconcept: false }),
    intelligence,
    concept_set,
    gate_0,
    graph,
    gate_a,
    families,
    surface_expressions,
    gate_b,
    authority_plan,
    gate_c: { gate_id: 'GATE_C_VISUAL_AUTHORITY', status: 'NOT_READY' },
    openart_batches,
    authority_pack,
    capabilities,
  };
}
