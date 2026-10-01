import { runExperienceCompiler } from '../compilerEngine';
import { resolveProjectMode } from './projectMode';
import type { CreativeExperienceGraph, ExperienceRouteNode, Map2PipelineState } from './map2Types';
import { createGate0 } from './conceptDirectionGate';
import { createGateA } from './experienceArchitectureGate';
import { createGateB } from './familySurfaceGate';

/** SITE 00 validates as INGEST — no three replacement concept directions. */
export function buildSite00IngestFixture(): {
  mode: 'INGEST';
  map1_node_count: number;
  graph: CreativeExperienceGraph;
  pipeline_sketch: Map2PipelineState;
} {
  const map1 = runExperienceCompiler();
  const nodes: ExperienceRouteNode[] = map1.nodes.map((n) => ({
    route_id: n.page_id,
    route: n.route,
    parent: n.parent_route,
    children: [],
    experience_unit: n.route.includes('existing-location') ? 'EXTERNAL_LOCATION' : 'STANDARD_PAGE',
    family: n.product_family,
    purpose: n.screen_type || n.route,
    primary_user: 'Customer',
    business_role: n.product_family,
    conversion_role: n.product_family === 'CHECKOUT' ? 'Transaction' : 'Discovery',
    priority: n.classification === 'CREATIVE_AUTHORITY_REQUIRED' ? 'P0' : 'P1',
    launch_phase: 'LAUNCH',
  }));

  const graph: CreativeExperienceGraph = {
    project_id: 'site00',
    concept_id: 'INGEST_PRODUCT_TRUTH',
    nodes,
    custom_experiences: [
      {
        custom_experience_id: 'cx_existing_location',
        name: 'Existing Location Service',
        description: 'Diagnose/repair/enhance external digital properties',
        business_purpose: 'Non-greenfield enhancement path',
        states: ['INTAKE', 'DIAGNOSE', 'PLAN', 'EXECUTE'],
        inherits_from: ['REPAIR_WORKFLOW'],
        new_family_id: null,
        capability_candidate: true,
      },
    ],
    integrations: [],
    expansion_proposals: [],
    approved: true,
  };

  const gate0 = createGate0();
  gate0.status = 'APPROVED';
  gate0.selected_concept_id = 'INGEST_PRODUCT_TRUTH';

  const gate_a = createGateA();
  gate_a.status = 'APPROVED';

  const gate_b = createGateB();
  gate_b.status = 'PENDING';

  const pipeline_sketch: Map2PipelineState = {
    mode: resolveProjectMode({ has_existing_product: true, preserve_product_truth: true, requires_reconcept: false }),
    intelligence: null,
    concept_set: null,
    gate_0: gate0,
    graph,
    gate_a,
    families: [],
    surface_expressions: [],
    gate_b,
    authority_plan: [],
    gate_c: { gate_id: 'GATE_C_VISUAL_AUTHORITY', status: 'NOT_READY' },
    openart_batches: [],
    authority_pack: null,
    capabilities: [],
  };

  return {
    mode: 'INGEST',
    map1_node_count: map1.nodes.length,
    graph,
    pipeline_sketch,
  };
}
