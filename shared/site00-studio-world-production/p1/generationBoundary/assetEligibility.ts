/**
 * Asset eligibility — found ≠ eligible.
 */

import type { CreativeAssetRecord } from '../../../site00-brand-lore/creativeLineage/types.js';
import type { InterfaceSemanticRole, InterfaceVisualSlot } from './interfaceVisualSlot.js';
import { LEGACY_METHODOLOGY_ASSET_ROLES } from './interfaceVisualSlot.js';

export type AssetEligibilityResult =
  | 'ELIGIBLE'
  | 'ELIGIBLE_WITH_FOUNDER_REVIEW'
  | 'WRONG_ROLE'
  | 'WRONG_PROJECT'
  | 'WRONG_CLIENT'
  | 'STALE'
  | 'SUPERSEDED'
  | 'NEGATIVE_EVIDENCE'
  | 'HISTORICAL_ONLY'
  | 'METHODOLOGY_OBSOLETE'
  | 'NOT_SURFACE_APPROPRIATE'
  | 'NOT_PRODUCTION_ELIGIBLE'
  | 'DECORATIVE_WITHOUT_PURPOSE'
  | 'REQUIRES_REVISION';

export type AssetEligibilityEvaluation = {
  candidateId: string;
  result: AssetEligibilityResult;
  reason: string;
};

export type VisualDevelopmentGeneratedAsset = {
  requirementId: string;
  storagePath: string;
  publicUrl: string | null;
  assetRole: string;
};

export function evaluateCreativeAssetEligibility(params: {
  asset: CreativeAssetRecord;
  slot: InterfaceVisualSlot;
  targetProjectSlug: string;
}): AssetEligibilityEvaluation {
  const { asset, slot } = params;

  if (slot.projectScope && asset.brandSlug !== slot.projectScope && asset.projectId !== slot.projectScope) {
    return { candidateId: asset.assetId, result: 'WRONG_PROJECT', reason: 'Asset belongs to different project' };
  }

  if (slot.clientScope && asset.brandSlug !== slot.clientScope) {
    return { candidateId: asset.assetId, result: 'WRONG_CLIENT', reason: 'Asset belongs to different client' };
  }

  if (asset.brandLineageMembership === 'EXCLUDED') {
    return { candidateId: asset.assetId, result: 'NEGATIVE_EVIDENCE', reason: 'Founder excluded from brand lineage' };
  }

  if (asset.reviewState === 'REJECTED' || asset.reviewState === 'NOT_FOR_ME') {
    return { candidateId: asset.assetId, result: 'NEGATIVE_EVIDENCE', reason: 'Rejected by founder' };
  }

  if (asset.reuseState === 'ORIGINAL_USE_ONLY' || asset.reuseState === 'RETIRED') {
    return { candidateId: asset.assetId, result: 'HISTORICAL_ONLY', reason: 'Historical-only classification' };
  }

  if (asset.productionState !== 'PUBLISHED' && asset.productionState !== 'CANONICAL') {
    if (slot.semanticRole === 'CURRENT_PROJECT_VISUAL') {
      return {
        candidateId: asset.assetId,
        result: 'ELIGIBLE_WITH_FOUNDER_REVIEW',
        reason: 'Visual development / non-production asset requires review',
      };
    }
  }

  return { candidateId: asset.assetId, result: 'ELIGIBLE', reason: 'Passes project, client, and review gates' };
}

export function evaluateVisualDevelopmentAssetEligibility(params: {
  asset: VisualDevelopmentGeneratedAsset;
  slot: InterfaceVisualSlot;
}): AssetEligibilityEvaluation {
  const role = params.asset.assetRole.toUpperCase();
  if (LEGACY_METHODOLOGY_ASSET_ROLES.some((legacy) => role.includes(legacy.replace(/_/g, '')) || params.asset.assetRole === legacy)) {
    return {
      candidateId: params.asset.requirementId,
      result: 'METHODOLOGY_OBSOLETE',
      reason: `Legacy methodology role ${params.asset.assetRole} is not surface-appropriate`,
    };
  }

  if (role.includes('DOSSIER') || role.includes('WORKBENCH') || role.includes('HOST_INTEGRATION')) {
    return {
      candidateId: params.asset.requirementId,
      result: 'NOT_SURFACE_APPROPRIATE',
      reason: 'Methodology structural concept — not a visual asset',
    };
  }

  if (params.slot.semanticRole === 'ENVIRONMENT_PLATE' && role.includes('HOST_ENVIRONMENT')) {
    return {
      candidateId: params.asset.requirementId,
      result: 'NOT_SURFACE_APPROPRIATE',
      reason: 'HOST_ENVIRONMENT resolves to existing host canon, not generated output',
    };
  }

  const roleMatch = semanticRoleMatchesAsset(params.slot.semanticRole, params.asset.assetRole);
  if (!roleMatch) {
    return {
      candidateId: params.asset.requirementId,
      result: 'WRONG_ROLE',
      reason: `Asset role ${params.asset.assetRole} does not match slot ${params.slot.semanticRole}`,
    };
  }

  return { candidateId: params.asset.requirementId, result: 'ELIGIBLE', reason: 'Role-compatible visual development asset' };
}

function semanticRoleMatchesAsset(semanticRole: InterfaceSemanticRole, assetRole: string): boolean {
  const normalized = assetRole.toUpperCase();
  if (semanticRole === 'CURRENT_PROJECT_VISUAL') {
    return normalized.includes('SPECIMEN') || normalized.includes('FOCAL') || normalized.includes('PRIMARY');
  }
  if (semanticRole === 'PROJECT_THUMBNAIL') {
    return normalized.includes('SPECIMEN') || normalized.includes('GRAPHIC') || normalized.includes('THUMBNAIL');
  }
  return false;
}

export function classifyObsoleteMethodologyAssets(
  assets: VisualDevelopmentGeneratedAsset[],
): Array<{ asset: VisualDevelopmentGeneratedAsset; result: AssetEligibilityResult }> {
  return assets.map((asset) => ({
    asset,
    result: evaluateVisualDevelopmentAssetEligibility({
      asset,
      slot: {
        slotId: 'legacy',
        surfaceId: 'SITE00_PROJECTS_INDEX',
        familyId: 'LEGACY',
        purpose: 'legacy',
        semanticRole: 'CURRENT_PROJECT_VISUAL',
        contentCategory: 'VISUAL_ASSET',
        contentSourcePreference: [],
        generationPolicy: 'NEVER_GENERATE',
        required: false,
        projectScope: null,
        clientScope: null,
        responsiveBehavior: 'BOTH',
        fallbackPolicy: 'HIDE',
        visualImportance: 'PRIMARY',
        interactionRelationship: 'LEGACY',
      },
    }).result,
  }));
}
