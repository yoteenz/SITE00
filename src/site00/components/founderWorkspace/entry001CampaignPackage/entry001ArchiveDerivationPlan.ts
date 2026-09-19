/**
 * B5.2 / B5.4 — Entry 001 archive derivation plan (typed sources — no provider dispatch).
 */

import type {
  Entry001ArchiveDerivationPlan,
  Entry001CampaignAsset,
  Entry001AssetType,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import { ENTRY001_REQUIRED_DELIVERABLE_TYPES } from '../../../config/entry001CampaignAssets.js';
import {
  ENTRY001_VISUAL_CONTINUITY,
  formatContinuityForType,
  styleContinuityLockedFromArchive,
} from './entry001VisualContinuity.js';
import { legacyRoleToAssetType, assetTypeToLegacyRole } from './entry001AssetTaxonomy.js';

function continuityRules(): string[] {
  return [
    ...ENTRY001_VISUAL_CONTINUITY.palette,
    ...ENTRY001_VISUAL_CONTINUITY.imageLanguage.slice(0, 2),
    ...ENTRY001_VISUAL_CONTINUITY.annotation.slice(0, 3),
  ];
}

function copyRules(): string[] {
  return [
    'WHO TF IS WE? thesis preserved',
    'media complicity / public rehabilitation argument',
    'no invented apology narrative',
    'archival confrontational tone',
  ];
}

function sourceAssetsForTarget(
  targetType: Entry001AssetType,
  archive: Entry001CampaignAsset[],
): { ids: string[]; types: Entry001AssetType[] } {
  const familyMap: Partial<Record<Entry001AssetType, Entry001AssetType[]>> = {
    REEL_COVER: ['CAROUSEL_SLIDE', 'STORY_FRAME', 'STATIC_POST', 'QUOTE_POST'],
    HIGHLIGHT_ICON: ['CAROUSEL_SLIDE', 'STATIC_POST'],
    TIKTOK: ['CAROUSEL_SLIDE', 'STORY_FRAME'],
    X_POST: ['QUOTE_POST', 'CAROUSEL_SLIDE', 'INFOGRAPHIC'],
    REEL: ['CAROUSEL_SLIDE', 'STORY_FRAME'],
  };
  const families = familyMap[targetType] ?? ['CAROUSEL_SLIDE'];
  const matches = archive.filter((a) => families.includes(a.assetType ?? legacyRoleToAssetType(a.role)));
  const types = [...new Set(matches.map((a) => a.assetType ?? legacyRoleToAssetType(a.role)))];
  return { ids: matches.slice(0, 5).map((a) => a.assetId), types };
}

export function compileEntry001ArchiveDerivationPlan(
  activeArchive: Entry001CampaignAsset[],
): Entry001ArchiveDerivationPlan {
  const locked = styleContinuityLockedFromArchive(activeArchive.length);

  const targets = ENTRY001_REQUIRED_DELIVERABLE_TYPES.map((targetAssetType) => {
    const { ids, types } = sourceAssetsForTarget(targetAssetType, activeArchive);
    const derivable = locked && targetAssetType !== 'REEL';
    let strategy = 'Manual production or founder upload';
    if (targetAssetType === 'REEL_COVER') {
      strategy =
        'Derive dominant typography, Britney treatment, torn-paper collage, lime marker from typed carousel/story sources';
    } else if (targetAssetType === 'HIGHLIGHT_ICON') {
      strategy = 'Derive simple icon/cover from carousel/static language — no unrelated iconography';
    } else if (targetAssetType === 'REEL') {
      strategy =
        'Major production object — story/visual package established; requires explicit founder generation decision';
    } else if (targetAssetType === 'TIKTOK') {
      strategy = 'Platform-native expression from story-frame / carousel sources — not carousel resize';
    } else if (targetAssetType === 'X_POST') {
      strategy = 'X-native thread from quote/carousel sources — not reel repost';
    }

    const formatRules = formatContinuityForType(targetAssetType);

    return {
      targetAssetType,
      targetAssetRole: (targetAssetType === 'REEL_COVER' ? 'COVER' : null) as import('../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js').Entry001ContentRole | null,
      role: assetTypeToLegacyRole(targetAssetType),
      derivable,
      recommendedSourceAssetIds: derivable ? ids : [],
      sourceAssetTypes: derivable ? types : [],
      recommendedContinuityReferences: formatRules.slice(0, 3),
      visualContinuityRules: continuityRules(),
      copyContinuityRules: copyRules(),
      formatRules,
      generationStrategy: strategy,
      founderApprovalRequired: true,
    };
  });

  return {
    planId: 'entry001-derivation-plan-v002',
    entryId: 'entry-001',
    compiledAt: new Date().toISOString(),
    providerDispatchCount: 0,
    targets,
  };
}
