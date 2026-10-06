/**
 * VISUAL_AUTHORITY_REGISTRY + COMPOSITION_TERRITORY_REGISTRY rows.
 */
import { evaluateAuthorityGate } from './gate.js';
import type { AuthorityGateInput, CompositionTerritory, CompositionTerritoryRegistryRow, VisualAuthorityRegistryRow } from './schema.js';

export function visualAuthorityRow(i: AuthorityGateInput, at: string): VisualAuthorityRegistryRow {
  const g = evaluateAuthorityGate(i);
  const a = i.authority ?? null;
  const selected = (i.territories ?? []).find((t) => t.status === 'SELECTED' || t.status === 'COMBINED');
  return {
    project_id: i.project_id,
    family_id: i.family_id,
    feature_id: i.feature_id,
    actor: i.actor,
    authority_id: a?.authority_id ?? null,
    authority_level: a?.authority_level ?? null,
    status: g.state,
    guard: g.guard,
    reference_paths: a?.reference_paths ?? [],
    brand_context_id: i.brand_context?.brand_context_id ?? null,
    experience_contract_id: i.experience_contract ? `${i.experience_contract.feature_id}@${i.experience_contract.schema_version}` : null,
    territory_id: selected?.territory_id ?? null,
    core_logic_locks: a?.core_logic_locks ?? [],
    flexible_areas: a?.flexible_implementation_areas ?? [],
    founder_decision: i.founder_decision ? `${i.founder_decision.verdict}: ${i.founder_decision.notes}` : null,
    created_at: at,
    updated_at: at,
    supersedes: a?.supersedes ?? null,
  };
}

export const territoryRow = (t: CompositionTerritory): CompositionTerritoryRegistryRow => ({
  territory_id: t.territory_id, project_id: t.project_id, family_id: t.family_id, feature_id: t.feature_id, actor: t.actor, name: t.name,
  concept: t.concept, metaphor: t.metaphor, primary_object: t.primary_object, composition_logic: t.composition_logic, mobile_logic: t.mobile_logic,
  desktop_logic: t.desktop_logic, brand_fit: t.brand_fit, experience_fit: t.experience_fit, status: t.status, founder_decision: t.founder_decision,
});
