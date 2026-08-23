/**
 * SurfaceVisualAuthorityPackage — role-aware reference authority for Composer + asset generation.
 */

import { createHash } from 'node:crypto';
import type {
  VisualReferenceAuthorityDimension,
  VisualReferencePackage,
  VisualReferenceRecord,
  VisualReferenceRole,
} from '../../../site00-visual-reference/types.js';
import { negativeReferenceHasZeroStyleAuthority } from './referenceAuthorityRules.js';

export type SurfaceVisualAuthorityRole =
  | 'HOST_SHELL'
  | 'HOST_NAVIGATION'
  | 'HOST_TYPOGRAPHY'
  | 'HOST_COLOR_BEHAVIOR'
  | 'HOST_SPATIAL_ATMOSPHERE'
  | 'HOST_MATERIAL_BEHAVIOR'
  | 'CURRENT_FUNCTIONAL_SURFACE'
  | 'STRUCTURAL_REFERENCE'
  | 'CLIENT_EXPRESSION_REFERENCE'
  | 'NEGATIVE_REFERENCE';

export type SurfaceVisualAuthorityEntry = {
  referenceId: string;
  route: string;
  device: string;
  captureCommit: string | null;
  freshness: string;
  authority: string;
  role: SurfaceVisualAuthorityRole;
  preserve: string[];
  mayAdapt: string[];
  ignore: string[];
  doNotInherit: string[];
  negativeTraits: string[];
  fingerprint: string;
  dimensionAuthority: Partial<Record<VisualReferenceAuthorityDimension, string>>;
};

export type SurfaceVisualAuthorityPackage = {
  packageId: string;
  surfaceId: string;
  fingerprint: string;
  references: SurfaceVisualAuthorityEntry[];
  negativeReferenceIds: string[];
  strictConditioning: boolean;
  compiledAt: string;
};

const ROLE_MAP: Partial<Record<VisualReferenceRole, SurfaceVisualAuthorityRole>> = {
  HOST_SHELL: 'HOST_SHELL',
  HOST_NAVIGATION: 'HOST_NAVIGATION',
  HOST_TYPOGRAPHY: 'HOST_TYPOGRAPHY',
  HOST_COLOR_BEHAVIOR: 'HOST_COLOR_BEHAVIOR',
  HOST_SPATIAL_ATMOSPHERE: 'HOST_SPATIAL_ATMOSPHERE',
  HOST_MATERIAL_LANGUAGE: 'HOST_MATERIAL_BEHAVIOR',
  CURRENT_FUNCTIONAL_SURFACE: 'CURRENT_FUNCTIONAL_SURFACE',
  STRUCTURAL_HIERARCHY: 'STRUCTURAL_REFERENCE',
  CLIENT_VISUAL_IDENTITY: 'CLIENT_EXPRESSION_REFERENCE',
  NEGATIVE_REFERENCE: 'NEGATIVE_REFERENCE',
  ANTI_DIRECTION: 'NEGATIVE_REFERENCE',
};

function resolveAuthorityRole(ref: VisualReferenceRecord): SurfaceVisualAuthorityRole {
  if (ref.approvalStatus === 'NEGATIVE_REFERENCE') return 'NEGATIVE_REFERENCE';
  if (ref.approvalStatus === 'STRUCTURAL_REFERENCE') return 'STRUCTURAL_REFERENCE';
  for (const r of ref.referenceRoles) {
    const mapped = ROLE_MAP[r];
    if (mapped) return mapped;
  }
  return 'CURRENT_FUNCTIONAL_SURFACE';
}

function entryFromPackageRef(
  entry: VisualReferencePackage['references'][number],
  targetDevice: string,
  targetSurface: string,
): SurfaceVisualAuthorityEntry {
  const pseudoRecord = {
    id: entry.referenceId,
    referenceRoles: entry.roles,
    approvalStatus: entry.approvalStatus,
    route: targetSurface,
    viewportClass: targetDevice,
    sourceCommit: null,
    stalenessState: 'FRESH' as const,
    imageFingerprint: entry.referenceId,
    authority: entry.authority,
  };

  const role = resolveAuthorityRole(pseudoRecord as VisualReferenceRecord);

  return {
    referenceId: entry.referenceId,
    route: targetSurface,
    device: targetDevice,
    captureCommit: null,
    freshness: 'FRESH',
    authority: entry.approvalStatus,
    role,
    preserve: entry.preserve,
    mayAdapt: [],
    ignore: entry.ignore,
    doNotInherit: entry.doNotInherit,
    negativeTraits: entry.approvalStatus === 'NEGATIVE_REFERENCE' ? entry.doNotInherit : [],
    fingerprint: entry.referenceId,
    dimensionAuthority: entry.authority as Partial<Record<VisualReferenceAuthorityDimension, string>>,
  };
}

export function compileSurfaceVisualAuthorityPackage(params: {
  surfaceId: string;
  referencePackage: VisualReferencePackage;
}): SurfaceVisualAuthorityPackage {
  const references = params.referencePackage.references.map((entry) =>
    entryFromPackageRef(entry, params.referencePackage.targetDevice, params.referencePackage.targetSurface),
  );
  const negativeReferenceIds = references
    .filter((r) => r.role === 'NEGATIVE_REFERENCE')
    .map((r) => r.referenceId);

  for (const neg of references.filter((r) => r.role === 'NEGATIVE_REFERENCE')) {
    if (!negativeReferenceHasZeroStyleAuthority(neg)) {
      throw new Error(`NEGATIVE_REFERENCE ${neg.referenceId} must have zero style authority`);
    }
  }

  const fingerprint = createHash('sha256')
    .update(references.map((r) => r.fingerprint).join(':'))
    .digest('hex')
    .slice(0, 16);

  return {
    packageId: `sva-${params.surfaceId}-${fingerprint}`,
    surfaceId: params.surfaceId,
    fingerprint,
    references,
    negativeReferenceIds,
    strictConditioning: params.referencePackage.strictHostVisualConditioning,
    compiledAt: new Date().toISOString(),
  };
}

export function desktopAuthorityDoesNotSatisfyMobile(params: {
  desktopReferenceCount: number;
  mobileReferenceCount: number;
  mobileRequired: boolean;
}): boolean {
  return params.mobileRequired && params.mobileReferenceCount === 0 && params.desktopReferenceCount > 0;
}
