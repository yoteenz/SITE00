/**
 * AuthorityCascade — child surface design authority resolution order.
 */

export type AuthorityCascadeInput = {
  childAuthorityId?: string | null;
  parentAuthorityId?: string | null;
  skinContinuityRecordId?: string | null;
  moduleVisualContractId?: string | null;
};

export type AuthorityCascadeResult = {
  level: 1 | 2 | 3 | 4 | 5;
  source: string;
  authorityId: string | null;
  usedGenericFallback: boolean;
};

export function resolveAuthorityCascade(input: AuthorityCascadeInput): AuthorityCascadeResult {
  if (input.childAuthorityId) {
    return { level: 1, source: 'EXACT_CHILD_SCREEN_AUTHORITY', authorityId: input.childAuthorityId, usedGenericFallback: false };
  }
  if (input.parentAuthorityId) {
    return { level: 2, source: 'PARENT_AUTHORITY_WITH_CHILD_INHERITANCE', authorityId: input.parentAuthorityId, usedGenericFallback: false };
  }
  if (input.skinContinuityRecordId) {
    return { level: 3, source: 'BRAND_FAMILY_CONTINUITY', authorityId: input.skinContinuityRecordId, usedGenericFallback: false };
  }
  if (input.moduleVisualContractId) {
    return { level: 4, source: 'MODULE_VISUAL_CONTRACT', authorityId: input.moduleVisualContractId, usedGenericFallback: false };
  }
  return { level: 5, source: 'SAFE_SITE00_FALLBACK', authorityId: null, usedGenericFallback: true };
}

export function childCohesionWouldFailGenericFallback(cascade: AuthorityCascadeResult): boolean {
  return cascade.usedGenericFallback;
}
