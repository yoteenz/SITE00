/**
 * Validation OpenArt source binding — explicit roles, no silent fallback to mounted runtime portraits.
 */
import { buildCurrentFabricationSourceAuthority } from './fabricationSourceAuthority.js';

export type ValidationSourceRole = 'IDENTITY_FACE' | 'WORK_LOOK' | 'BODY_GEOMETRY';

export type ValidationSourcePathBinding = {
  role: ValidationSourceRole;
  repoPath: string;
};

export type ValidationSourceBinding = {
  residentId: `SW-${string}`;
  sourceResidentId: string;
  identityFaceAuthority: ValidationSourcePathBinding;
  workLookAuthority: ValidationSourcePathBinding;
  bodyGeometryAuthority: ValidationSourcePathBinding;
};

const SUPERSEDED_MOUNT_PREFIX = 'public/site00/production-authority-assets/shared/residents/';
const REQUIRED_WORK_LOOK_SEGMENT = 'studio-world-residents/casting-thumbnails-v1/';

function assertWorkLookPath(repoPath: string, residentId: string): void {
  if (repoPath.includes(SUPERSEDED_MOUNT_PREFIX)) {
    throw new Error(
      `[${residentId}] workLookAuthority resolves to superseded production-authority mount: ${repoPath}`,
    );
  }
  if (!repoPath.includes(REQUIRED_WORK_LOOK_SEGMENT)) {
    throw new Error(
      `[${residentId}] workLookAuthority must resolve under casting-thumbnails-v1, got: ${repoPath}`,
    );
  }
}

function assertBodyGeometryPath(repoPath: string, residentId: string): void {
  const uniformRegen = repoPath.includes('STUDIO_WORLD_RESIDENT_FULL_BODY_UNIFORM_REGEN');
  const geometryComplete = repoPath.includes('STUDIO_WORLD_RESIDENT_GEOMETRY_COMPLETE');
  if (!uniformRegen && !geometryComplete) {
    throw new Error(
      `[${residentId}] bodyGeometryAuthority must resolve to approved uniform full-body pack, got: ${repoPath}`,
    );
  }
}

/** Resolve validation OpenArt inputs from recovery4 fabrication source authority only. */
export function resolveValidationSourceBinding(residentId: `SW-${string}`): ValidationSourceBinding {
  const auth = buildCurrentFabricationSourceAuthority(residentId);
  if (!auth) {
    throw new Error(`Missing CURRENT_FABRICATION_SOURCE_AUTHORITY for ${residentId}`);
  }
  const workPath = auth.portraitAuthority.repoPath;
  const bodyPath = auth.fullBodyAuthority.repoPath;
  assertWorkLookPath(workPath, residentId);
  assertBodyGeometryPath(bodyPath, residentId);

  const faceAndWork: ValidationSourcePathBinding = { role: 'WORK_LOOK', repoPath: workPath };
  return {
    residentId,
    sourceResidentId: auth.sourceResidentId,
    identityFaceAuthority: { role: 'IDENTITY_FACE', repoPath: workPath },
    workLookAuthority: faceAndWork,
    bodyGeometryAuthority: { role: 'BODY_GEOMETRY', repoPath: bodyPath },
  };
}

export const VALIDATION_RESIDENT_IDS: `SW-${string}`[] = [
  'SW-001',
  'SW-002',
  'SW-003',
  'SW-004',
  'SW-005',
  'SW-006',
  'SW-007',
  'SW-008',
];

export function listValidationSourceBindings(): ValidationSourceBinding[] {
  return VALIDATION_RESIDENT_IDS.map((id) => resolveValidationSourceBinding(id));
}
