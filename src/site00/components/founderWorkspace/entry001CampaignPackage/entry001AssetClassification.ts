/**
 * B5.4 — AI-suggested asset classification (deterministic heuristics — no provider dispatch).
 */

import type {
  Entry001AssetClassificationSuggestion,
  Entry001AssetType,
  Entry001ContentRole,
} from '../../../../../shared/site00-expression-engine/entry001CampaignPackage/types.js';

function inferFromFilename(name: string): {
  assetType: Entry001AssetType;
  assetRole: Entry001ContentRole | null;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  rationale: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes('carousel') || lower.includes('slide')) {
    return {
      assetType: 'CAROUSEL_SLIDE',
      assetRole: lower.includes('cover') ? 'COVER' : 'CLAIM',
      confidence: 'HIGH',
      rationale: 'Filename suggests carousel slide',
    };
  }
  if (lower.includes('story') || lower.includes('frame')) {
    return {
      assetType: 'STORY_FRAME',
      assetRole: lower.includes('cta') || lower.includes('poll') ? 'CTA' : 'INTERJECTION',
      confidence: 'MEDIUM',
      rationale: 'Filename suggests story frame',
    };
  }
  if (lower.includes('reel') && lower.includes('cover')) {
    return { assetType: 'REEL_COVER', assetRole: 'COVER', confidence: 'HIGH', rationale: 'Reel cover filename' };
  }
  if (lower.includes('reel')) {
    return { assetType: 'REEL', assetRole: null, confidence: 'MEDIUM', rationale: 'Reel filename' };
  }
  if (lower.includes('tiktok')) {
    return { assetType: 'TIKTOK', assetRole: null, confidence: 'HIGH', rationale: 'TikTok filename' };
  }
  if (lower.includes('twitter') || lower.includes('x-post') || lower.includes('x_post')) {
    return { assetType: 'X_POST', assetRole: null, confidence: 'HIGH', rationale: 'X/Twitter filename' };
  }
  if (lower.includes('quote')) {
    return { assetType: 'QUOTE_POST', assetRole: 'INTERJECTION', confidence: 'MEDIUM', rationale: 'Quote filename' };
  }
  if (lower.includes('infographic') || lower.includes('cycle')) {
    return {
      assetType: 'INFOGRAPHIC',
      assetRole: 'CONTRADICTION',
      confidence: 'MEDIUM',
      rationale: 'Infographic / cycle filename',
    };
  }
  if (lower.includes('cta') || lower.includes('poll')) {
    return { assetType: 'CTA_FRAME', assetRole: 'CTA', confidence: 'MEDIUM', rationale: 'CTA filename' };
  }
  return {
    assetType: 'STATIC_POST',
    assetRole: 'SUPPORTING_EVIDENCE',
    confidence: 'LOW',
    rationale: 'Ambiguous upload — founder confirmation required',
  };
}

export function suggestAssetClassification(
  assetId: string,
  fileName: string,
): Entry001AssetClassificationSuggestion {
  const inferred = inferFromFilename(fileName);
  return {
    assetId,
    suggestedAssetType: inferred.assetType,
    suggestedAssetRole: inferred.assetRole,
    confidence: inferred.confidence,
    rationale: inferred.rationale,
  };
}

export function suggestBatchClassifications(
  items: { assetId: string; fileName: string }[],
): Entry001AssetClassificationSuggestion[] {
  return items.map((i) => suggestAssetClassification(i.assetId, i.fileName));
}
