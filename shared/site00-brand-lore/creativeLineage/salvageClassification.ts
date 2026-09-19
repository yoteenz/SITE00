/**
 * Salvage classification for non-winning directions.
 */

import type {
  CreativeAssetRecord,
  CreativeConceptRecord,
  ContentFranchiseRecord,
  SalvageClassification,
  SalvageReviewItem,
} from './types.js';

export function classifySalvageItem(params: {
  kind: SalvageReviewItem['itemKind'];
  founderLiked: boolean;
  visuallyCompatibleWithWinningWorld: boolean;
  portableCorePresent: boolean;
  isFranchise: boolean;
  isCopyMechanic: boolean;
  isMotionMechanic: boolean;
  isVisualDevice: boolean;
}): SalvageClassification {
  if (!params.founderLiked && !params.portableCorePresent) return 'RETIRE';
  if (params.visuallyCompatibleWithWinningWorld && params.founderLiked && params.kind === 'ASSET') {
    return 'REUSE_AS_IS';
  }
  if (params.founderLiked && params.portableCorePresent && !params.visuallyCompatibleWithWinningWorld) {
    if (params.isFranchise) return 'SALVAGE_CONTENT_FRANCHISE';
    if (params.isCopyMechanic) return 'SALVAGE_COPY_MECHANIC';
    if (params.isMotionMechanic) return 'SALVAGE_MOTION_MECHANIC';
    if (params.isVisualDevice) return 'SALVAGE_VISUAL_DEVICE';
    if (params.portableCorePresent) return 'SALVAGE_IDEA_ONLY';
    return 'REUSE_WITH_ADAPTATION';
  }
  if (params.portableCorePresent) return 'SALVAGE_IDEA_ONLY';
  return 'RETIRE';
}

export function salvageClassificationToReuseState(classification: SalvageClassification): CreativeAssetRecord['reuseState'] {
  switch (classification) {
    case 'REUSE_AS_IS':
      return 'REUSABLE_AS_IS';
    case 'REUSE_WITH_ADAPTATION':
      return 'REUSABLE_WITH_ADAPTATION';
    case 'SALVAGE_IDEA_ONLY':
      return 'IDEA_ONLY';
    case 'SALVAGE_CONTENT_FRANCHISE':
      return 'CONTENT_FRANCHISE_ONLY';
    case 'SALVAGE_COPY_MECHANIC':
      return 'COPY_MECHANIC_ONLY';
    case 'SALVAGE_MOTION_MECHANIC':
      return 'MOTION_MECHANIC_ONLY';
    case 'SALVAGE_VISUAL_DEVICE':
      return 'VISUAL_DEVICE_ONLY';
    default:
      return 'RETIRED';
  }
}

export function buildSalvageReviewItems(params: {
  losingDirectionId: string;
  losingDirectionName: string;
  assets: CreativeAssetRecord[];
  concepts: CreativeConceptRecord[];
  franchises: ContentFranchiseRecord[];
}): SalvageReviewItem[] {
  const items: SalvageReviewItem[] = [];
  for (const asset of params.assets.filter((a) => a.directionLineage.directionId === params.losingDirectionId)) {
    const loved =
      asset.creativeValue === 'LOVE_IT' ||
      asset.reviewState === 'LOVE_IT' ||
      asset.productionState === 'PRODUCTION_CANDIDATE';
    items.push({
      itemId: asset.assetId,
      itemKind: 'ASSET',
      originDirectionId: params.losingDirectionId,
      originDirectionName: params.losingDirectionName,
      title: `${asset.assetType}${loved ? ' · LOVED PRODUCTION CANDIDATE' : ''} — ${asset.contentLineage.topicName ?? 'untitled'}`,
      classification: asset.salvageClassification,
      founderAction: null,
      translationPreview: null,
    });
  }
  for (const concept of params.concepts.filter((c) => c.originDirectionId === params.losingDirectionId)) {
    items.push({
      itemId: concept.conceptId,
      itemKind: 'CONCEPT',
      originDirectionId: params.losingDirectionId,
      originDirectionName: params.losingDirectionName,
      title: concept.name,
      classification: concept.salvageClassification,
      founderAction: null,
      translationPreview: null,
    });
  }
  for (const franchise of params.franchises.filter((f) => f.originDirectionId === params.losingDirectionId)) {
    items.push({
      itemId: franchise.franchiseId,
      itemKind: 'FRANCHISE',
      originDirectionId: params.losingDirectionId,
      originDirectionName: params.losingDirectionName,
      title: franchise.name,
      classification: 'SALVAGE_CONTENT_FRANCHISE',
      founderAction: null,
      translationPreview: null,
    });
  }
  return items;
}

export function runSalvageClassificationTest(classification: SalvageClassification): { passed: boolean; notes: string[] } {
  const valid = [
    'REUSE_AS_IS',
    'REUSE_WITH_ADAPTATION',
    'SALVAGE_IDEA_ONLY',
    'SALVAGE_CONTENT_FRANCHISE',
    'SALVAGE_COPY_MECHANIC',
    'SALVAGE_MOTION_MECHANIC',
    'SALVAGE_VISUAL_DEVICE',
    'RETIRE',
  ];
  return { passed: valid.includes(classification), notes: valid.includes(classification) ? [] : ['Invalid classification'] };
}

export function runLosingDirectionPreservationTest(params: {
  historicalRecordsIntact: boolean;
  normalizedRecordsCreated: boolean;
  historicalDeleted: boolean;
}): { passed: boolean; notes: string[] } {
  if (params.historicalDeleted) return { passed: false, notes: ['Historical records deleted — forbidden'] };
  if (!params.historicalRecordsIntact) return { passed: false, notes: ['Historical records not intact'] };
  if (!params.normalizedRecordsCreated) return { passed: false, notes: ['Normalized records not created'] };
  return { passed: true, notes: ['Losing direction assets preserved with lineage'] };
}
