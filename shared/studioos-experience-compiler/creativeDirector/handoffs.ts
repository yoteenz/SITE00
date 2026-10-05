import type {
  ConceptTerritoryArtifact,
  CreativeArtifact,
  OpusVisualHandoff,
  SonnetImplementationHandoff,
  VisualAuthorityModelHandoff,
} from '../creativeDirectorTypes.js';

export function compileVisualAuthorityModelHandoff(args: {
  artifacts: CreativeArtifact[];
  founder_constraints: string[];
}): VisualAuthorityModelHandoff | null {
  const approvedTerritory = findApprovedTerritory(args.artifacts);
  const graph = findApprovedPayload(args.artifacts, 'EXPERIENCE_GRAPH');
  const families = findApprovedPayload(args.artifacts, 'FAMILY_ARCHITECTURE');
  const surfaces = findApprovedPayload(args.artifacts, 'SURFACE_EXPRESSION');

  if (!approvedTerritory && !graph) return null;

  return {
    role: 'VISUAL_AUTHORITY_MODEL',
    intended_model_slot: 'GPT2',
    creative_direction_authority: { note: 'Downstream visual authority generation only — no React/routes/business logic.' },
    approved_territory: approvedTerritory,
    approved_experience_graph: graph,
    approved_family_architecture: families,
    surface_expression_brief: surfaces,
    reference_images: [],
    brand_assets: [],
    composition_requirements: [],
    continuity_requirements: [],
    founder_constraints: args.founder_constraints,
  };
}

export function compileSonnetHandoff(args: {
  graph: Record<string, unknown> | null;
  families: Record<string, unknown> | null;
  surfaces: Record<string, unknown> | null;
  approved_authority_ids: string[];
  locked_decisions: string[];
}): SonnetImplementationHandoff {
  return {
    route_state_graph: args.graph ?? { routes: [] },
    family_definitions: args.families ?? { families: [] },
    responsive_expressions: args.surfaces ?? { surface_expressions: [] },
    approved_visual_authorities: args.approved_authority_ids,
    functional_contracts: { note: 'Implement routes/states only — visual from approved authorities.' },
    asset_slots: [],
    live_code_ownership: [],
    locked_founder_decisions: args.locked_decisions,
  };
}

export function compileOpusHandoff(sonnet: SonnetImplementationHandoff, visualPack: Record<string, unknown>): OpusVisualHandoff {
  return {
    visual_authority_pack: visualPack,
    sonnet_implementation: sonnet,
    family_rules: ['Respect approved family architecture', 'No geometry drift without Opus allowance'],
    responsive_rules: ['Mobile/tablet/desktop/app are distinct — not stretched breakpoints'],
    locked_functionality: sonnet.locked_founder_decisions,
    allowed_visual_dom_css_changes: ['Visual DOM/CSS within approved authority plates'],
    prohibited_changes: ['Route graph', 'Business logic', 'Blind Grok mass fabrication'],
  };
}

function findApprovedTerritory(artifacts: CreativeArtifact[]): ConceptTerritoryArtifact | null {
  for (const a of artifacts) {
    if (a.approval_state !== 'APPROVED' || a.task_mode !== 'CONCEPT_TERRITORIES') continue;
    const territories = (a.payload as { territories?: ConceptTerritoryArtifact[] }).territories;
    if (!territories?.length) continue;
    const approvedId = (a.payload as { approved_territory_id?: string }).approved_territory_id;
    if (approvedId) {
      return territories.find((t) => t.territory_id === approvedId) ?? territories[0];
    }
  }
  return null;
}

function findApprovedPayload(artifacts: CreativeArtifact[], mode: string): Record<string, unknown> | null {
  const hit = artifacts.find((a) => a.task_mode === mode && a.approval_state === 'APPROVED');
  return hit ? hit.payload : null;
}

export function downstreamGateReadiness(artifacts: CreativeArtifact[]): {
  visual_authority_model: boolean;
  sonnet: boolean;
  opus: boolean;
  asset_surgery: boolean;
  composer: boolean;
} {
  const hasApprovedGraph = artifacts.some((a) => a.task_mode === 'EXPERIENCE_GRAPH' && a.approval_state === 'APPROVED');
  const hasApprovedFamilies = artifacts.some((a) => a.task_mode === 'FAMILY_ARCHITECTURE' && a.approval_state === 'APPROVED');
  const hasApprovedSurfaces = artifacts.some((a) => a.task_mode === 'SURFACE_EXPRESSION' && a.approval_state === 'APPROVED');
  const hasApprovedBriefs = artifacts.some((a) => a.task_mode === 'AUTHORITY_BRIEF' && a.approval_state === 'APPROVED');
  const hasApprovedTerritory = artifacts.some((a) => a.task_mode === 'CONCEPT_TERRITORIES' && a.approval_state === 'APPROVED');

  return {
    visual_authority_model: hasApprovedSurfaces && hasApprovedTerritory,
    sonnet: hasApprovedGraph && hasApprovedFamilies && hasApprovedBriefs,
    opus: hasApprovedGraph && hasApprovedBriefs,
    asset_surgery: hasApprovedBriefs,
    composer: hasApprovedGraph && hasApprovedBriefs,
  };
}
