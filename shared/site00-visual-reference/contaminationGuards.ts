/**
 * Reference contamination guards — prevent cross-boundary style leakage.
 */

import type { VisualReferenceRecord, VisualReferenceRole } from './types.js';

export type ContaminationGuardResult = {
  allowed: boolean;
  reason: string | null;
};

export function guardNdxbookReferenceFromHostCanon(ref: VisualReferenceRecord): ContaminationGuardResult {
  if (ref.brandId === 'ndxbook' && ref.authorityScopes.includes('HOST')) {
    return { allowed: false, reason: 'NDXBOOK reference cannot define HOST canon' };
  }
  return { allowed: true, reason: null };
}

export function guardFrontalSlayerFromNdxbookGeneration(
  ref: VisualReferenceRecord,
  targetProjectId: string,
): ContaminationGuardResult {
  if (ref.brandId === 'frontal-slayer' && targetProjectId === 'ndxbook') {
    return { allowed: false, reason: 'Frontal Slayer reference cannot contaminate NDXBOOK generation' };
  }
  return { allowed: true, reason: null };
}

export function guardStructuralStyleFromHostStyle(ref: VisualReferenceRecord): ContaminationGuardResult {
  if (
    ref.approvalStatus === 'STRUCTURAL_REFERENCE' &&
    ref.authority.STYLE &&
    !['STRUCTURAL_ONLY', 'NONE', 'NEGATIVE_ONLY'].includes(ref.authority.STYLE)
  ) {
    return { allowed: false, reason: 'Structural reference cannot gain style authority' };
  }
  return { allowed: true, reason: null };
}

export function guardNegativeReferenceFromTargetStyle(ref: VisualReferenceRecord): ContaminationGuardResult {
  if (
    ref.approvalStatus === 'NEGATIVE_REFERENCE' &&
    ref.authority.STYLE &&
    !['NEGATIVE_ONLY', 'NONE'].includes(ref.authority.STYLE)
  ) {
    return { allowed: false, reason: 'Negative reference cannot become positive style source' };
  }
  return { allowed: true, reason: null };
}

export function guardVisualMemoryNotCanon(): true {
  return true;
}

export function guardHostTypographyNotClientTypography(
  ref: VisualReferenceRecord,
  targetScope: 'HOST' | 'CLIENT',
): ContaminationGuardResult {
  if (
    targetScope === 'CLIENT' &&
    ref.referenceRoles.includes('HOST_TYPOGRAPHY') &&
    !ref.referenceRoles.includes('CLIENT_TYPOGRAPHY')
  ) {
    return { allowed: false, reason: 'Host typography cannot become client typography' };
  }
  return { allowed: true, reason: null };
}

export function guardDesktopNotMobileLayoutAuthority(
  ref: VisualReferenceRecord,
  targetDevice: string,
): ContaminationGuardResult {
  if (targetDevice === 'MOBILE' && ref.viewportClass === 'DESKTOP' && ref.authority.LAYOUT === 'STRICT') {
    return { allowed: false, reason: 'Desktop reference cannot be strict mobile layout authority' };
  }
  return { allowed: true, reason: null };
}

export function guardMartianMonoNotNdxbookClientTypography(fontName: string): boolean {
  return fontName.toLowerCase() !== 'martian mono';
}

export function validateReferenceForPackage(
  ref: VisualReferenceRecord,
  params: { targetProjectId: string; targetDevice: string; targetScope: 'HOST' | 'CLIENT' },
): ContaminationGuardResult {
  const checks = [
    guardNdxbookReferenceFromHostCanon(ref),
    guardFrontalSlayerFromNdxbookGeneration(ref, params.targetProjectId),
    guardStructuralStyleFromHostStyle(ref),
    guardNegativeReferenceFromTargetStyle(ref),
    guardHostTypographyNotClientTypography(ref, params.targetScope),
    guardDesktopNotMobileLayoutAuthority(ref, params.targetDevice),
  ];
  const blocked = checks.find((c) => !c.allowed);
  return blocked ?? { allowed: true, reason: null };
}

export function roleMatchesIntent(role: VisualReferenceRole, intentRoles: VisualReferenceRole[]): boolean {
  return intentRoles.includes(role);
}
