/**
 * HeroFrameAssetSubset — minimum assets for one NDXBOOK Project Home desktop hero.
 */

import { createHash } from 'node:crypto';
import type { ExperienceAssetManifest, ExperienceAssetRequirement } from '../experienceExpression/assetManifest.js';
import type { ClientProjectExpressionProfile } from './clientProjectExpressionProfile.js';
import type { ProjectWorkspaceBible } from './projectWorkspaceBible.js';
import type { ProjectProductionScope } from '../experienceExpression/productionScope.js';
import { EXPERIENCE_VISUAL_COST_ESTIMATE_USD } from '../experienceExpression/constants.js';

export type HeroFrameAssetRole = {
  roleId: string;
  assetFamily: string;
  assetRole: string;
  purpose: string;
  required: boolean;
  deviceClass: 'DESKTOP';
  requirementId: string | null;
  reusableAssetId: string | null;
  missing: boolean;
  generationAllowed: boolean;
};

export type HeroFrameAssetSubset = {
  subsetId: string;
  projectId: string;
  targetSurface: 'PROJECT_HOME';
  deviceClass: 'DESKTOP';
  ownershipModel: 'SITE_00_WORKSPACE + CLIENT_EXPRESSION';
  roles: HeroFrameAssetRole[];
  reusableAssetCount: number;
  missingAssetCount: number;
  newGenerationCount: number;
  fullManifestRequirementCount: number;
  estimatedFalRequests: number;
  estimatedCostUsd: number;
  scopeValid: boolean;
  scopeBlockReason: string | null;
  compiledAt: string;
};

export function compileHeroFrameAssetSubset(params: {
  projectId: string;
  bible: ProjectWorkspaceBible;
  clientExpression: ClientProjectExpressionProfile;
  fullManifest: ExperienceAssetManifest | null;
  scope: ProjectProductionScope;
  existingAssetPaths?: Array<{ assetId: string; storagePath: string | null; assetFamily: string; surfaceId: string }>;
  spentUsd?: number;
}): HeroFrameAssetSubset {
  const fullCount = params.fullManifest?.requirements.length ?? 0;

  // Derive MINIMUM roles for one convincing desktop hero — not full manifest
  const derivedRoles: Omit<HeroFrameAssetRole, 'requirementId' | 'reusableAssetId' | 'missing'>[] = [
    {
      roleId: 'hero-env',
      assetFamily: 'ENVIRONMENT_PLATE',
      assetRole: 'Project environment inhabiting SITE 00 workbench',
      purpose: 'Show NDXBOOK inhabiting universal workspace — not inventing NDXBOOK workbench',
      required: true,
      deviceClass: 'DESKTOP',
      generationAllowed: true,
    },
    {
      roleId: 'hero-active-specimen',
      assetFamily: 'ACTIVE_VISUAL_SPECIMEN',
      assetRole: 'Dominant active creative specimen on bench',
      purpose: 'Active Piece visual weight — NDXBOOK creative material in work',
      required: true,
      deviceClass: 'DESKTOP',
      generationAllowed: true,
    },
    {
      roleId: 'hero-supporting-specimen',
      assetFamily: 'VISUAL_SPECIMEN',
      assetRole: 'Supporting visual evidence',
      purpose: 'Layered dossier-weight evidence without investigative metaphor',
      required: false,
      deviceClass: 'DESKTOP',
      generationAllowed: true,
    },
    {
      roleId: 'hero-graphic-intervention',
      assetFamily: 'EDITORIAL_ARTWORK',
      assetRole: 'Client-native graphic intervention',
      purpose: 'Prevent CSS-only/card-grid hero — artwork participates',
      required: true,
      deviceClass: 'DESKTOP',
      generationAllowed: true,
    },
  ];

  const manifestReqs = params.fullManifest?.requirements ?? [];
  let reusableCount = 0;

  const roles: HeroFrameAssetRole[] = derivedRoles.map((role) => {
    const matchingReq = manifestReqs.find(
      (r) =>
        r.assetFamily === role.assetFamily &&
        r.surfaceId === 'PROJECT_HOME' &&
        r.desktopRequirement,
    );

    const reusable = params.existingAssetPaths?.find(
      (a) =>
        a.assetFamily === role.assetFamily &&
        a.surfaceId === 'PROJECT_HOME' &&
        a.storagePath,
    );

    if (reusable) reusableCount += 1;

    return {
      ...role,
      requirementId: matchingReq?.id ?? null,
      reusableAssetId: reusable?.assetId ?? null,
      missing: !reusable?.storagePath && role.required,
    };
  });

  const missingRoles = roles.filter((r) => r.missing && r.generationAllowed);
  const newGenerationCount = missingRoles.length;
  const estimatedCost = newGenerationCount * EXPERIENCE_VISUAL_COST_ESTIMATE_USD;
  const spent = params.spentUsd ?? 0;

  let scopeValid = true;
  let scopeBlockReason: string | null = null;
  if (newGenerationCount > params.scope.maximumGeneratedAssets) {
    scopeValid = false;
    scopeBlockReason = 'MAX_GENERATED_ASSETS';
  } else if (spent + estimatedCost > params.scope.generationBudgetUsd) {
    scopeValid = false;
    scopeBlockReason = 'GENERATION_BUDGET_EXCEEDED';
  }

  const fingerprint = createHash('sha256')
    .update(roles.map((r) => r.roleId).join('|'))
    .digest('hex')
    .slice(0, 12);

  return {
    subsetId: `hero-subset-${params.projectId}-${fingerprint}`,
    projectId: params.projectId,
    targetSurface: 'PROJECT_HOME',
    deviceClass: 'DESKTOP',
    ownershipModel: 'SITE_00_WORKSPACE + CLIENT_EXPRESSION',
    roles,
    reusableAssetCount: reusableCount,
    missingAssetCount: missingRoles.length,
    newGenerationCount,
    fullManifestRequirementCount: fullCount,
    estimatedFalRequests: newGenerationCount,
    estimatedCostUsd: estimatedCost,
    scopeValid,
    scopeBlockReason,
    compiledAt: new Date().toISOString(),
  };
}

export function heroSubsetSmallerThanFullManifest(subset: HeroFrameAssetSubset): boolean {
  return subset.roles.length < subset.fullManifestRequirementCount;
}

export function recompiledUnderCorrectedOwnership(subset: HeroFrameAssetSubset): boolean {
  return subset.ownershipModel === 'SITE_00_WORKSPACE + CLIENT_EXPRESSION';
}

export function identifyReusableBeforeGeneration(subset: HeroFrameAssetSubset): boolean {
  return subset.reusableAssetCount >= 0 && subset.roles.some((r) => r.reusableAssetId !== null || r.missing);
}

export function mapSubsetToGenerationRequirements(
  subset: HeroFrameAssetSubset,
  manifestRequirements: ExperienceAssetRequirement[],
): ExperienceAssetRequirement[] {
  const families = subset.roles.filter((r) => r.missing).map((r) => r.assetFamily);
  return manifestRequirements.filter(
    (req) =>
      req.surfaceId === 'PROJECT_HOME' &&
      req.desktopRequirement &&
      families.includes(req.assetFamily),
  );
}
