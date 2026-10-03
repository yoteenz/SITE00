import type { StudioWorldResidentDossier } from './types.js';

/** Role-level styling allowed without mutating resident canon. */
export const ALLOWED_ROLE_FABRICATION_KEYS = [
  'wardrobe',
  'hairStylingWithinContinuity',
  'makeup',
  'temporaryStyling',
  'environment',
  'roleProps',
  'performanceMode',
  'contextualGlamMode', // e.g. Iona — must be explicit, never default
] as const;

export const FORBIDDEN_ROLE_IDENTITY_OVERRIDES = [
  'ethnicity',
  'age',
  'bodyStructure',
  'faceReplacement',
  'canonicalName',
  'sexuality',
  'culturalContext',
] as const;

export type CastRoleAppearanceOverride = Partial<Record<(typeof ALLOWED_ROLE_FABRICATION_KEYS)[number], string>> &
  Partial<Record<(typeof FORBIDDEN_ROLE_IDENTITY_OVERRIDES)[number], string>>;

export type CastRoleOverrideValidation =
  | { ok: true; appliedKeys: readonly string[] }
  | { ok: false; rejectedKeys: readonly string[]; reason: string };

/**
 * Temporary cast-role instructions cannot overwrite canonical resident identity.
 */
export function validateCastRoleOverridesForResident(
  resident: StudioWorldResidentDossier,
  overrides: CastRoleAppearanceOverride,
): CastRoleOverrideValidation {
  const rejected = FORBIDDEN_ROLE_IDENTITY_OVERRIDES.filter((k) => overrides[k] != null && String(overrides[k]).trim() !== '');
  if (rejected.length) {
    return {
      ok: false,
      rejectedKeys: rejected,
      reason: `Cannot mutate resident canon (${resident.sourceResidentId} ${resident.canonicalName}) via role override: ${rejected.join(', ')}`,
    };
  }
  if (overrides.contextualGlamMode && resident.sourceResidentId === 'SW-RESIDENT-006' && !overrides.contextualGlamMode.includes('contextual')) {
    return {
      ok: false,
      rejectedKeys: ['contextualGlamMode'],
      reason: 'Iona full-glam must be explicit contextual alternate mode — not default identity',
    };
  }
  const applied = ALLOWED_ROLE_FABRICATION_KEYS.filter((k) => overrides[k] != null && String(overrides[k]).trim() !== '');
  return { ok: true, appliedKeys: applied };
}

export function isResidentBackedActorId(actorId: string): boolean {
  return actorId.startsWith('sw-resident-');
}
