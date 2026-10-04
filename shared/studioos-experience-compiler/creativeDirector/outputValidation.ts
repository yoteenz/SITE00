import type { ConceptTerritoriesOutput, CreativeDirectorTaskMode } from '../creativeDirectorTypes.js';

export function validateTaskOutput(taskMode: CreativeDirectorTaskMode, payload: unknown): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'Output must be a JSON object' };
  }
  const obj = payload as Record<string, unknown>;

  switch (taskMode) {
    case 'CONCEPT_TERRITORIES':
      return validateConceptTerritories(obj);
    case 'EXPERIENCE_GRAPH':
      return validateExperienceGraph(obj);
    case 'FAMILY_ARCHITECTURE':
      return validateFamilyArchitecture(obj);
    case 'SURFACE_EXPRESSION':
      return validateSurfaceExpression(obj);
    case 'AUTHORITY_BRIEF':
      return validateAuthorityBrief(obj);
    case 'HYBRIDIZE_TERRITORIES':
      return validateHybridize(obj);
    default:
      return { ok: true, data: obj };
  }
}

function validateConceptTerritories(obj: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const territories = obj.territories;
  if (!Array.isArray(territories) || territories.length !== 3) {
    return { ok: false, error: 'CONCEPT_TERRITORIES requires exactly 3 territories' };
  }
  const required = [
    'territory_id',
    'name',
    'core_idea',
    'spatial_metaphor',
    'emotional_objective',
    'experience_logic',
    'information_architecture',
    'interaction_language',
    'visual_language',
    'mobile_expression',
    'tablet_expression',
    'desktop_expression',
    'app_expression',
  ] as const;
  for (const t of territories) {
    if (!t || typeof t !== 'object') return { ok: false, error: 'Invalid territory object' };
    const row = t as Record<string, unknown>;
    for (const key of required) {
      if (typeof row[key] !== 'string' || !String(row[key]).trim()) {
        return { ok: false, error: `Territory missing field: ${key}` };
      }
    }
  }
  const names = territories.map((t) => String((t as Record<string, unknown>).name).toLowerCase());
  if (new Set(names).size !== 3) {
    return { ok: false, error: 'Territories must have distinct names' };
  }
  return { ok: true, data: obj as ConceptTerritoriesOutput as unknown as Record<string, unknown> };
}

function validateExperienceGraph(obj: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const routes = obj.routes;
  if (!Array.isArray(routes) || routes.length < 3) {
    return { ok: false, error: 'EXPERIENCE_GRAPH requires routes[] with meaningful states' };
  }
  if (!obj.entry_points || !Array.isArray(obj.entry_points)) {
    return { ok: false, error: 'EXPERIENCE_GRAPH requires entry_points[]' };
  }
  return { ok: true, data: obj };
}

function validateFamilyArchitecture(obj: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const families = obj.families;
  if (!Array.isArray(families) || families.length < 1) {
    return { ok: false, error: 'FAMILY_ARCHITECTURE requires families[]' };
  }
  return { ok: true, data: obj };
}

function validateSurfaceExpression(obj: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const surfaces = obj.surface_expressions;
  if (!Array.isArray(surfaces) || surfaces.length < 1) {
    return { ok: false, error: 'SURFACE_EXPRESSION requires surface_expressions[]' };
  }
  for (const s of surfaces) {
    const row = s as Record<string, unknown>;
    const kind = String(row.surface ?? '');
    if (!['MOBILE_WEB', 'TABLET_WEB', 'DESKTOP_WEB', 'CLIENT_APP_MOBILE', 'CLIENT_APP_TABLET'].includes(kind)) {
      return { ok: false, error: `Invalid surface kind: ${kind}` };
    }
  }
  return { ok: true, data: obj };
}

function validateAuthorityBrief(obj: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  const briefs = obj.authority_briefs;
  if (!Array.isArray(briefs) || briefs.length < 1) {
    return { ok: false, error: 'AUTHORITY_BRIEF requires authority_briefs[]' };
  }
  return { ok: true, data: obj };
}

function validateHybridize(obj: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (!obj.resulting_territory || typeof obj.resulting_territory !== 'object') {
    return { ok: false, error: 'HYBRIDIZE_TERRITORIES requires resulting_territory object' };
  }
  return { ok: true, data: obj };
}
