/**
 * B5.4 / B5.7 — AI-suggested asset classification (context + aspect ratio + heuristics).
 */

import type {
  Entry001AssetClassificationSuggestion,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';
import {
  classifyAssetWithContext,
  summarizeBatchClassification,
} from '../../../../../shared/site00-campaign-package/assetIngestion/assetClassificationEngine.js';
import type {
  AssetIngestionContext,
  CampaignAssetMediaMetadata,
} from '../../../../../shared/site00-campaign-package/assetIngestion/types.js';
import { ingestionContextFromFormatFamily } from '../../../../../shared/site00-campaign-package/assetIngestion/assetClassificationEngine.js';

export function suggestAssetClassification(
  assetId: string,
  fileName: string,
  context?: AssetIngestionContext,
  media?: CampaignAssetMediaMetadata | null,
  sequenceIndex?: number,
): Entry001AssetClassificationSuggestion {
  const ctx =
    context ??
    ingestionContextFromFormatFamily('GENERAL_ARCHIVE', { projectId: 'ndxbook', entryId: 'entry-001' });

  const decision = classifyAssetWithContext({
    assetId,
    fileName,
    context: ctx,
    media,
    sequenceIndex,
  });

  const confidenceMap = { HIGH: 'HIGH' as const, MODERATE: 'MEDIUM' as const, LOW: 'LOW' as const };

  return {
    assetId,
    suggestedAssetType: decision.suggestedType,
    suggestedAssetRole: decision.suggestedRole,
    confidence: confidenceMap[decision.confidence],
    rationale: decision.rationale,
  };
}

export function suggestBatchClassifications(
  items: { assetId: string; fileName: string; media?: CampaignAssetMediaMetadata | null }[],
  context?: AssetIngestionContext,
): Entry001AssetClassificationSuggestion[] {
  const ctx =
    context ??
    ingestionContextFromFormatFamily('GENERAL_ARCHIVE', { projectId: 'ndxbook', entryId: 'entry-001' });

  return items.map((item, index) => {
    const decision = classifyAssetWithContext({
      assetId: item.assetId,
      fileName: item.fileName,
      context: ctx,
      media: item.media,
      sequenceIndex: index,
    });
    const confidenceMap = { HIGH: 'HIGH' as const, MODERATE: 'MEDIUM' as const, LOW: 'LOW' as const };
    return {
      assetId: item.assetId,
      suggestedAssetType: decision.suggestedType,
      suggestedAssetRole: decision.suggestedRole,
      confidence: confidenceMap[decision.confidence],
      rationale: decision.rationale,
    };
  });
}

export { summarizeBatchClassification, ingestionContextFromFormatFamily };
export type { AssetIngestionContext, CampaignAssetMediaMetadata, BatchClassificationSummary } from '../../../../../shared/site00-campaign-package/assetIngestion/types.js';
