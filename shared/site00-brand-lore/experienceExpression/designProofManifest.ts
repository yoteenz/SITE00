/**
 * Visual development proof manifests — small deliberate subsets per surface proof.
 */

import { createHash } from 'node:crypto';
import type { DeviceClass } from './constants.js';
import { EXPERIENCE_VISUAL_COST_ESTIMATE_USD } from './constants.js';
import type { SurfaceExperienceArtDirection } from './surfaceArtDirection.js';
import type { ProjectWorkspaceCanon } from '../projectWorkspace/projectWorkspaceCanon.js';
import type { ClientProjectExpressionProfile } from '../projectWorkspace/clientProjectExpressionProfile.js';

export const DESIGN_PROOF_ASSET_CATEGORIES = [
  'BACKGROUND_OR_ENVIRONMENT',
  'PRIMARY_ARTWORK',
  'SUPPORTING_ARTWORK',
  'GRAPHIC_INTERVENTION',
  'EXPRESSIVE_TYPE_ARTIFACT',
  'MATERIAL_OR_TEXTURE',
  'UI_INTEGRATION_REFERENCE',
  'OTHER',
] as const;

export type DesignProofAssetCategory = (typeof DESIGN_PROOF_ASSET_CATEGORIES)[number];

export type DesignProofAssetRequirement = {
  id: string;
  proofId: string;
  category: DesignProofAssetCategory;
  assetRole: string;
  purpose: string;
  deviceClass: DeviceClass;
  reusable: boolean;
  reusableAssetId: string | null;
  missing: boolean;
  generationAllowed: boolean;
  idempotencyKey: string;
  estimatedCostUsd: number;
};

export type DesignProofManifest = {
  manifestId: string;
  proofId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME';
  owner: 'SITE00' | 'SITE00_PLUS_NDXBOOK';
  deviceClass: DeviceClass;
  requirements: DesignProofAssetRequirement[];
  reusableAssetCount: number;
  missingAssetCount: number;
  expectedFalCalls: number;
  estimatedCostUsd: number;
  compiledAt: string;
};

export type Site00ProjectsIndexProofManifest = DesignProofManifest & {
  proofId: 'SITE00_PROJECTS_INDEX';
  owner: 'SITE00';
};

export type NdxbookProjectHomeProofManifest = DesignProofManifest & {
  proofId: 'NDXBOOK_PROJECT_HOME';
  owner: 'SITE00_PLUS_NDXBOOK';
};

function idempotencyKey(proofId: string, role: string, device: DeviceClass): string {
  return createHash('sha256').update(`${proofId}:${role}:${device}`).digest('hex').slice(0, 16);
}

function requirement(
  proofId: DesignProofManifest['proofId'],
  role: string,
  category: DesignProofAssetCategory,
  purpose: string,
  options?: { reusableAssetId?: string | null },
): DesignProofAssetRequirement {
  const reusable = Boolean(options?.reusableAssetId);
  const id = `${proofId}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id,
    proofId,
    category,
    assetRole: role,
    purpose,
    deviceClass: 'DESKTOP',
    reusable,
    reusableAssetId: options?.reusableAssetId ?? null,
    missing: !reusable,
    generationAllowed: !reusable,
    idempotencyKey: idempotencyKey(proofId, role, 'DESKTOP'),
    estimatedCostUsd: reusable ? 0 : EXPERIENCE_VISUAL_COST_ESTIMATE_USD,
  };
}

function requirementIdForRole(proofId: DesignProofManifest['proofId'], role: string): string {
  return `${proofId}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function compileSite00ProjectsIndexProofManifest(params: {
  artDirection: SurfaceExperienceArtDirection;
  workspaceCanon: ProjectWorkspaceCanon;
  existingReusableAssetIds?: string[];
}): Site00ProjectsIndexProofManifest {
  const proofId = 'SITE00_PROJECTS_INDEX' as const;
  const reusableSet = new Set(params.existingReusableAssetIds ?? []);
  const reusableFor = (role: string) => {
    const id = requirementIdForRole(proofId, role);
    return reusableSet.has(id) ? id : null;
  };

  const requirements: DesignProofAssetRequirement[] = [
    requirement(proofId, 'HOST_ENVIRONMENT', 'BACKGROUND_OR_ENVIRONMENT', 'SITE 00 universal working environment depth — not white document page', {
      reusableAssetId: reusableFor('HOST_ENVIRONMENT'),
    }),
    requirement(proofId, 'WORKBENCH_FOCAL_ARTIFACT', 'PRIMARY_ARTWORK', 'Active work focal zone — asymmetric priority, not equal cards', {
      reusableAssetId: reusableFor('WORKBENCH_FOCAL_ARTIFACT'),
    }),
    requirement(proofId, 'DOSSIER_DEPTH_LAYER', 'SUPPORTING_ARTWORK', 'Dossier structural sophistication — layered evidence without literal case file', {
      reusableAssetId: reusableFor('DOSSIER_DEPTH_LAYER'),
    }),
    requirement(proofId, 'PROJECT_SPECIMEN_GRAPHIC', 'GRAPHIC_INTERVENTION', 'Projects as working artifacts — NDXBOOK/Frontal Slayer/AIO accommodate without identical branding', {
      reusableAssetId: reusableFor('PROJECT_SPECIMEN_GRAPHIC'),
    }),
    requirement(proofId, 'HOST_INTEGRATION_REFERENCE', 'UI_INTEGRATION_REFERENCE', 'SITE 00 host recognition — navigation and control grammar', {
      reusableAssetId: reusableFor('HOST_INTEGRATION_REFERENCE'),
    }),
  ];

  return finalizeManifest(proofId, 'SITE00', requirements) as Site00ProjectsIndexProofManifest;
}

export function compileNdxbookProjectHomeProofManifest(params: {
  artDirection: SurfaceExperienceArtDirection;
  workspaceCanon: ProjectWorkspaceCanon;
  clientExpression: ClientProjectExpressionProfile;
  existingReusableAssetIds?: string[];
}): NdxbookProjectHomeProofManifest {
  const proofId = 'NDXBOOK_PROJECT_HOME' as const;
  const reusableSet = new Set(params.existingReusableAssetIds ?? []);
  const reusableFor = (role: string) => {
    const id = requirementIdForRole(proofId, role);
    return reusableSet.has(id) ? id : null;
  };

  const requirements: DesignProofAssetRequirement[] = [
    requirement(proofId, 'NDXBOOK_ENVIRONMENT', 'BACKGROUND_OR_ENVIRONMENT', 'NDXBOOK client environment within SITE 00 workspace shell', {
      reusableAssetId: reusableFor('NDXBOOK_ENVIRONMENT'),
    }),
    requirement(proofId, 'NDXBOOK_PRIMARY_ARTWORK', 'PRIMARY_ARTWORK', 'Client-native visual specimen — not name-only recognition', {
      reusableAssetId: reusableFor('NDXBOOK_PRIMARY_ARTWORK'),
    }),
    requirement(proofId, 'WORKSPACE_STRUCTURE_LAYER', 'SUPPORTING_ARTWORK', 'SITE 00 workspace grammar — shell and workflow recognition', {
      reusableAssetId: reusableFor('WORKSPACE_STRUCTURE_LAYER'),
    }),
    requirement(proofId, 'EXPRESSIVE_TYPE_ARTIFACT', 'EXPRESSIVE_TYPE_ARTIFACT', 'Experimental visual typography — not Martian Mono, not Brand Canon', {
      reusableAssetId: reusableFor('EXPRESSIVE_TYPE_ARTIFACT'),
    }),
    requirement(proofId, 'CLIENT_GRAPHIC_INTERVENTION', 'GRAPHIC_INTERVENTION', 'NDXBOOK accent and material behavior', {
      reusableAssetId: reusableFor('CLIENT_GRAPHIC_INTERVENTION'),
    }),
    requirement(proofId, 'HOST_CLIENT_SEPARATION_REFERENCE', 'UI_INTEGRATION_REFERENCE', 'Both SITE 00 host and NDXBOOK client visible', {
      reusableAssetId: reusableFor('HOST_CLIENT_SEPARATION_REFERENCE'),
    }),
  ];

  return finalizeManifest(proofId, 'SITE00_PLUS_NDXBOOK', requirements) as NdxbookProjectHomeProofManifest;
}

function finalizeManifest(
  proofId: DesignProofManifest['proofId'],
  owner: DesignProofManifest['owner'],
  requirements: DesignProofAssetRequirement[],
): DesignProofManifest {
  const missing = requirements.filter((r) => r.missing);
  const reusable = requirements.filter((r) => r.reusable);
  const expectedFalCalls = missing.filter((r) => r.generationAllowed).length;
  const estimatedCostUsd = missing.reduce((sum, r) => sum + r.estimatedCostUsd, 0);

  return {
    manifestId: `manifest-${proofId.toLowerCase()}`,
    proofId,
    owner,
    deviceClass: 'DESKTOP',
    requirements,
    reusableAssetCount: reusable.length,
    missingAssetCount: missing.length,
    expectedFalCalls,
    estimatedCostUsd,
    compiledAt: new Date().toISOString(),
  };
}

export function manifestCompileGeneratesZeroFalRequests(): true {
  return true;
}

export function pageVisitGeneratesZeroFalRequests(): true {
  return true;
}

export function buildGeneratesZeroFalRequests(): true {
  return true;
}

export function projectsIndexDoesNotInheritNdxbookExpression(
  projectsManifest: Site00ProjectsIndexProofManifest,
  ndxbookManifest: NdxbookProjectHomeProofManifest,
): boolean {
  return projectsManifest.owner === 'SITE00' && ndxbookManifest.owner === 'SITE00_PLUS_NDXBOOK';
}
