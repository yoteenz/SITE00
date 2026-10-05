import type { CreativeExperienceConcept, CreativeExperienceGraph, CustomExperienceDefinition, ExperienceRouteNode, ExpansionProposal, IntegrationOpportunity } from './map2Types';
import { assertGraphExpansionAllowed } from './conceptDirectionGate';
import type { ConceptDirectionGate } from './map2Types';

function node(partial: ExperienceRouteNode): ExperienceRouteNode {
  return partial;
}

/** Expand approved concept into full experience graph (deterministic template from concept zones). */
export function expandConceptToGraph(
  project_id: string,
  concept: CreativeExperienceConcept,
  gate0: ConceptDirectionGate,
): CreativeExperienceGraph {
  assertGraphExpansionAllowed(gate0);
  const selectedOk =
    concept.concept_id === gate0.selected_concept_id ||
    gate0.hybrid?.resulting_concept_id === concept.concept_id;
  if (!selectedOk) {
    throw new Error('CONCEPT_MISMATCH: graph must expand selected/hybrid concept only');
  }

  const nodes: ExperienceRouteNode[] = concept.proposed_routes_high_level.map((route, i) =>
    node({
      route_id: `r_${i}_${route.replace(/\W+/g, '_')}`,
      route,
      parent: route === '/' ? null : '/',
      children: [],
      experience_unit: route === '/' ? 'ENTRY' : route.includes('build') ? 'CONFIGURATOR' : 'HUB',
      family: route.includes('account') ? 'MEMBERSHIP_LOUNGE' : route.includes('review') ? 'TRANSACTION_FLOW' : 'EDITORIAL_CONTENT',
      purpose: `Serve ${concept.primary_zones[i % concept.primary_zones.length] ?? 'zone'}`,
      primary_user: 'Customer',
      business_role: 'Conversion + retention',
      conversion_role: route.includes('review') ? 'Checkout adjacency' : 'Discovery',
      priority: i < 4 ? 'P0' : 'P1',
      launch_phase: i < 5 ? 'LAUNCH' : 'PHASE_2',
    }),
  );

  const custom_experiences: CustomExperienceDefinition[] = concept.custom_experiences.map((name, idx) => ({
    custom_experience_id: `cx_${idx}`,
    name,
    description: `Custom experience derived from concept ${concept.concept_id}`,
    business_purpose: concept.business_alignment,
    states: ['INTRO', 'CONFIGURE', 'PREVIEW', 'REVIEW'],
    inherits_from: name.includes('BUILD') ? ['MULTI_STEP_CONFIGURATION', 'PRODUCT_OPTION_SELECTOR'] : ['IMMERSIVE_DESTINATION'],
    new_family_id: name.includes('BUILD') ? 'PRODUCT_ASSEMBLY_CONFIGURATOR' : null,
    capability_candidate: true,
  }));

  const integrations: IntegrationOpportunity[] = concept.integration_opportunities.map((integration) => ({
    integration,
    reason: `Enables ${concept.commerce_model}`,
    experience_enabled: concept.experience_thesis,
    routes_affected: concept.proposed_routes_high_level.slice(0, 3),
    required_or_optional: integration === 'Shopify' ? 'REQUIRED' : 'OPTIONAL',
    launch_or_future: 'LAUNCH',
  }));

  const expansion_proposals: ExpansionProposal[] = concept.future_expansion.map((title, i) => ({
    id: `exp_${i}`,
    title,
    classification: 'HIGH_VALUE_LATER',
    description: 'Optional expansion — not in launch scope until founder approves',
  }));

  return {
    project_id,
    concept_id: concept.concept_id,
    nodes,
    custom_experiences,
    integrations,
    expansion_proposals,
    approved: false,
  };
}

export function approveExperienceGraph(graph: CreativeExperienceGraph): CreativeExperienceGraph {
  return { ...graph, approved: true };
}
