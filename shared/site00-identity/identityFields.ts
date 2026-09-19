/**
 * Canonical identity field keys for field-level judgment and promotion (P0.E)
 */

export const IDENTITY_CANON_FIELD_KEYS = [
  'masterBrandPositioning',
  'masterBrandPersonality',
  'masterBrandTone',
  'masterBrandDirection',
  'typographyDirection',
  'paletteDirection',
  'symbolicLanguage',
  'astreaDistrictExpression',
  'masterDistrictRelationship',
  'districtMarkerSystem',
  'signageDirection',
  'environmentalIdentityPrinciples',
  'differentiationStrategy',
  'futureDistrictModel',
] as const;

export type IdentityCanonFieldKey = (typeof IDENTITY_CANON_FIELD_KEYS)[number];

/** Maps territory payload keys → canonical field keys */
export const TERRITORY_PAYLOAD_TO_FIELD: Record<string, IdentityCanonFieldKey> = {
  positioning: 'masterBrandPositioning',
  personality: 'masterBrandPersonality',
  tone: 'masterBrandTone',
  masterBrandDirection: 'masterBrandDirection',
  typographyDirection: 'typographyDirection',
  paletteDirection: 'paletteDirection',
  symbolicLanguage: 'symbolicLanguage',
  districtIdentityDirection: 'astreaDistrictExpression',
  districtRelationship: 'masterDistrictRelationship',
  differentiation: 'differentiationStrategy',
  futureDistrictModel: 'futureDistrictModel',
};

export const FIELD_JUDGMENT_VALUES = ['APPROVE', 'REVISE', 'REJECT', 'UNREVIEWED'] as const;
export type FieldJudgmentValue = (typeof FIELD_JUDGMENT_VALUES)[number];

export const STRUCTURAL_WORLD_CONFIRMATION_KEYS = [
  'master_product_universe',
  'astrea_flagship_district',
  'astrea_destinations',
  'future_districts_supported',
  'world_structure_model',
] as const;

export type StructuralWorldConfirmationKey = (typeof STRUCTURAL_WORLD_CONFIRMATION_KEYS)[number];

export const SYSTEM_APPROVER_BLOCKLIST = [
  'system',
  'automated',
  'cursor-cloud',
  'auto',
  'bot',
  'agent',
] as const;

export function isBlockedAutomatedApprover(approver: string | null | undefined): boolean {
  if (!approver || !approver.trim()) return true;
  const lower = approver.trim().toLowerCase();
  return SYSTEM_APPROVER_BLOCKLIST.some((b) => lower.includes(b));
}

export function extractFieldValueFromTerritoryPayload(
  payload: Record<string, unknown>,
  fieldKey: IdentityCanonFieldKey,
): unknown {
  for (const [payloadKey, canonKey] of Object.entries(TERRITORY_PAYLOAD_TO_FIELD)) {
    if (canonKey === fieldKey && payload[payloadKey] !== undefined) {
      return payload[payloadKey];
    }
  }
  return null;
}
