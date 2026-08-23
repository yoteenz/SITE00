/**
 * InterfaceAssetManifest — missing-asset-driven generation for COMPOSED_INTERFACE surfaces.
 */

import { createHash } from 'node:crypto';
import type { DesignProofManifest } from '../../../site00-brand-lore/experienceExpression/designProofManifest.js';

export const INTERFACE_ASSET_ROLES = [
  'ACTIVE_VISUAL_SPECIMEN',
  'PROJECT_SPECIMEN',
  'REVIEW_EVIDENCE',
  'WORK_HISTORY_PREVIEW',
  'ENVIRONMENTAL_EXPRESSION',
  'EDITORIAL_ARTWORK',
  'TEXTURE',
  'THUMBNAIL',
  'BACKGROUND_PLATE',
  'CLIENT_ARTWORK',
  'DECORATIVE_ARTIFACT',
] as const;

export type InterfaceAssetRole = (typeof INTERFACE_ASSET_ROLES)[number];

export type InterfaceAssetRequirement = {
  requirementId: string;
  assetRole: InterfaceAssetRole;
  sourceManifestRole: string;
  purpose: string;
  reusable: boolean;
  reusableAssetId: string | null;
  missing: boolean;
  generationRequired: boolean;
  preferExistingArtifact: boolean;
};

export type InterfaceAssetManifest = {
  manifestId: string;
  surfaceId: string;
  requirements: InterfaceAssetRequirement[];
  reusableCount: number;
  missingCount: number;
  generationRequiredCount: number;
  fullPageProofRequired: false;
  estimatedFalCalls: number;
  estimatedCostUsd: number;
  compiledAt: string;
};

const MANIFEST_ROLE_MAP: Record<string, InterfaceAssetRole> = {
  HOST_ENVIRONMENT: 'ENVIRONMENTAL_EXPRESSION',
  WORKBENCH_FOCAL_ARTIFACT: 'ACTIVE_VISUAL_SPECIMEN',
  DOSSIER_DEPTH_LAYER: 'REVIEW_EVIDENCE',
  PROJECT_SPECIMEN_GRAPHIC: 'PROJECT_SPECIMEN',
  HOST_INTEGRATION_REFERENCE: 'BACKGROUND_PLATE',
};

export function compileInterfaceAssetManifest(params: {
  surfaceId: string;
  designProofManifest: DesignProofManifest;
}): InterfaceAssetManifest {
  const requirements: InterfaceAssetRequirement[] = params.designProofManifest.requirements.map((req) => {
    const assetRole = MANIFEST_ROLE_MAP[req.assetRole] ?? 'EDITORIAL_ARTWORK';
    return {
      requirementId: req.id,
      assetRole,
      sourceManifestRole: req.assetRole,
      purpose: req.purpose,
      reusable: req.reusable,
      reusableAssetId: req.reusableAssetId,
      missing: req.missing,
      generationRequired: req.missing && req.generationAllowed,
      preferExistingArtifact: true,
    };
  });

  const reusableCount = requirements.filter((r) => r.reusable && !r.missing).length;
  const missingCount = requirements.filter((r) => r.missing).length;
  const generationRequiredCount = requirements.filter((r) => r.generationRequired).length;

  const manifestId = createHash('sha256')
    .update(`${params.surfaceId}:${requirements.map((r) => r.requirementId).join(',')}`)
    .digest('hex')
    .slice(0, 16);

  return {
    manifestId,
    surfaceId: params.surfaceId,
    requirements,
    reusableCount,
    missingCount,
    generationRequiredCount,
    fullPageProofRequired: false,
    estimatedFalCalls: generationRequiredCount,
    estimatedCostUsd: params.designProofManifest.estimatedCostUsd,
    compiledAt: new Date().toISOString(),
  };
}

export function reusableAssetsReduceGenerationCount(manifest: InterfaceAssetManifest): number {
  return manifest.reusableCount;
}
