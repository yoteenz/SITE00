/**
 * B5.7 — Context + ratio + filename fusion for asset classification.
 */

import type {
  AssetClassificationDecision,
  AssetClassificationConfidence,
  AssetIngestionContext,
  BatchClassificationSummary,
  CampaignAssetMediaMetadata,
} from './types.js';
import type {
  Entry001AssetType,
  Entry001ContentRole,
} from '../../site00-expression-engine/entry001CampaignPackage/types.js';
import { classifyAspectRatio } from './aspectRatioClassification.js';

const SLOT_TYPE_MAP: Record<string, Entry001AssetType> = {
  FINAL_REEL: 'REEL',
  REEL_COVER: 'REEL_COVER',
  HIGHLIGHT: 'HIGHLIGHT_ICON',
  CAROUSEL: 'CAROUSEL_SLIDE',
  STORY: 'STORY_FRAME',
  TIKTOK: 'TIKTOK',
  X: 'X_POST',
};

const TAB_DEFAULTS: Record<AssetIngestionContext['formatFamily'], Entry001AssetType> = {
  CAROUSEL: 'CAROUSEL_SLIDE',
  STORY: 'STORY_FRAME',
  REEL: 'REEL',
  TIKTOK: 'TIKTOK',
  X: 'X_POST',
  HIGHLIGHT: 'HIGHLIGHT_ICON',
  GENERAL_ARCHIVE: 'STATIC_POST',
};

function inferFromFilename(name: string): {
  assetType: Entry001AssetType | null;
  assetRole: Entry001ContentRole | null;
  signal: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes('carousel') || lower.includes('slide')) {
    return { assetType: 'CAROUSEL_SLIDE', assetRole: lower.includes('cover') ? 'COVER' : 'CLAIM', signal: 'filename:carousel' };
  }
  if (lower.includes('story') || lower.includes('frame')) {
    return {
      assetType: 'STORY_FRAME',
      assetRole: lower.includes('cta') || lower.includes('poll') ? 'CTA' : 'INTERJECTION',
      signal: 'filename:story',
    };
  }
  if (lower.includes('reel') && lower.includes('cover')) {
    return { assetType: 'REEL_COVER', assetRole: 'COVER', signal: 'filename:reel_cover' };
  }
  if (lower.includes('reel')) return { assetType: 'REEL', assetRole: null, signal: 'filename:reel' };
  if (lower.includes('tiktok')) return { assetType: 'TIKTOK', assetRole: null, signal: 'filename:tiktok' };
  if (lower.includes('twitter') || lower.includes('x-post') || lower.includes('x_post')) {
    return { assetType: 'X_POST', assetRole: null, signal: 'filename:x' };
  }
  return { assetType: null, assetRole: null, signal: 'filename:ambiguous' };
}

function roleFromContext(ctx: AssetIngestionContext, index: number): Entry001ContentRole | null {
  if (ctx.expectedRole !== undefined) return ctx.expectedRole;
  if (ctx.formatFamily === 'CAROUSEL' && index === 0) return 'COVER';
  if (ctx.formatFamily === 'STORY' && ctx.destinationSlot?.toLowerCase().includes('cta')) return 'CTA';
  return null;
}

export function classifyAssetWithContext(args: {
  assetId: string;
  fileName: string;
  context: AssetIngestionContext;
  media?: CampaignAssetMediaMetadata | null;
  sequenceIndex?: number;
}): AssetClassificationDecision {
  const { assetId, fileName, context, media, sequenceIndex = 0 } = args;
  const contextSignals: string[] = [];
  const ratioSignals: string[] = [];
  const filenameSignals: string[] = [];
  const packageSignals: string[] = [];

  let suggestedType: Entry001AssetType = TAB_DEFAULTS[context.formatFamily];
  let suggestedRole: Entry001ContentRole | null = roleFromContext(context, sequenceIndex);
  let confidence: AssetClassificationConfidence = 'MODERATE';
  const rationaleParts: string[] = [];

  if (context.expectedAssetType) {
    suggestedType = context.expectedAssetType;
    contextSignals.push(`expectedType:${context.expectedAssetType}`);
    confidence = 'HIGH';
    rationaleParts.push('Destination slot defines type');
  } else if (context.destinationSlot && SLOT_TYPE_MAP[context.destinationSlot]) {
    suggestedType = SLOT_TYPE_MAP[context.destinationSlot]!;
    contextSignals.push(`slot:${context.destinationSlot}`);
    confidence = 'HIGH';
    rationaleParts.push(`Slot ${context.destinationSlot}`);
  } else if (context.formatFamily !== 'GENERAL_ARCHIVE') {
    suggestedType = TAB_DEFAULTS[context.formatFamily];
    contextSignals.push(`tab:${context.formatFamily}`);
    confidence = 'HIGH';
    rationaleParts.push(`Upload from ${context.formatFamily} tab`);
  }

  if (media) {
    const aspect = classifyAspectRatio(media.width, media.height);
    ratioSignals.push(`${media.width}x${media.height}`, aspect.matchedFamily ?? 'OTHER');
    if (context.formatFamily === 'STORY' && aspect.matchedFamily === '9:16') {
      suggestedType = media.mediaType === 'VIDEO' ? 'REEL' : 'STORY_FRAME';
      confidence = 'HIGH';
      rationaleParts.push('9:16 + Story context');
    } else if (context.formatFamily === 'CAROUSEL' && aspect.matchedFamily === '4:5') {
      suggestedType = 'CAROUSEL_SLIDE';
      confidence = confidence === 'HIGH' ? 'HIGH' : 'MODERATE';
      rationaleParts.push('4:5 + Carousel context');
    } else if (context.formatFamily === 'CAROUSEL' && aspect.matchedFamily === '9:16') {
      suggestedType = 'STORY_FRAME';
      confidence = 'MODERATE';
      rationaleParts.push('9:16 unusual in Carousel tab');
    } else if (context.formatFamily === 'REEL') {
      if (context.destinationSlot === 'REEL_COVER' || context.expectedAssetType === 'REEL_COVER') {
        suggestedType = 'REEL_COVER';
      } else if (media.mediaType === 'VIDEO' && aspect.matchedFamily === '9:16') {
        suggestedType = 'REEL';
      }
      confidence = 'HIGH';
    } else if (context.formatFamily === 'GENERAL_ARCHIVE') {
      if (aspect.matchedFamily === '4:5') {
        suggestedType = 'CAROUSEL_SLIDE';
        confidence = 'MODERATE';
        rationaleParts.push('4:5 suggests carousel/static');
      } else if (aspect.matchedFamily === '9:16') {
        suggestedType = media.mediaType === 'VIDEO' ? 'REEL' : 'STORY_FRAME';
        confidence = 'MODERATE';
      }
    }
  }

  const filename = inferFromFilename(fileName);
  if (filename.assetType) {
    filenameSignals.push(filename.signal);
    if (confidence !== 'HIGH') {
      suggestedType = filename.assetType;
      suggestedRole = filename.assetRole ?? suggestedRole;
      confidence = 'MODERATE';
    }
  }

  if (context.existingSequenceCount && context.existingSequenceCount > 0) {
    packageSignals.push(`extend_sequence:${context.existingSequenceCount}`);
    rationaleParts.push(`Add to existing sequence (${context.existingSequenceCount} items)`);
  }

  if (confidence === 'MODERATE' && context.formatFamily === 'GENERAL_ARCHIVE' && !media) {
    confidence = 'LOW';
  }

  return {
    assetId,
    fileName,
    contextSignals,
    ratioSignals,
    filenameSignals,
    visualSignals: [],
    existingPackageSignals: packageSignals,
    suggestedType,
    suggestedRole,
    confidence,
    rationale: rationaleParts.join(' · ') || 'Context-aware classification',
    createdAt: new Date().toISOString(),
  };
}

export function summarizeBatchClassification(
  decisions: AssetClassificationDecision[],
): BatchClassificationSummary {
  if (!decisions.length) {
    return {
      homogeneous: true,
      primaryType: 'STATIC_POST',
      primaryRole: null,
      confidence: 'LOW',
      totalCount: 0,
      autoAcceptCount: 0,
      reviewCount: 0,
      anomalies: [],
      headline: 'No assets',
    };
  }

  const typeCounts = new Map<Entry001AssetType, number>();
  for (const d of decisions) {
    typeCounts.set(d.suggestedType, (typeCounts.get(d.suggestedType) ?? 0) + 1);
  }
  const primaryType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  const homogeneous = typeCounts.size === 1;
  const autoAccept = decisions.filter((d) => d.confidence === 'HIGH');
  const review = decisions.filter((d) => d.confidence !== 'HIGH');
  const anomalies = decisions
    .filter((d) => d.suggestedType !== primaryType)
    .map((d) => ({ assetId: d.assetId, reason: `Suggested ${d.suggestedType} vs batch ${primaryType}` }));

  const label = primaryType.replace(/_/g, ' ');
  const headline = homogeneous
    ? `${decisions.length} ${label}${decisions.length > 1 ? 'S' : ''} DETECTED`
    : `${autoAccept.length} ${label} · ${anomalies.length} TO REVIEW`;

  return {
    homogeneous,
    primaryType,
    primaryRole: decisions[0]?.suggestedRole ?? null,
    confidence: homogeneous && autoAccept.length === decisions.length ? 'HIGH' : 'MODERATE',
    totalCount: decisions.length,
    autoAcceptCount: autoAccept.length,
    reviewCount: review.length,
    anomalies,
    headline,
  };
}

export function ingestionContextFromFormatFamily(
  formatFamily: AssetIngestionContext['formatFamily'],
  args?: Partial<AssetIngestionContext>,
): AssetIngestionContext {
  return {
    projectId: args?.projectId ?? 'ndxbook',
    entryId: args?.entryId ?? 'entry-001',
    formatFamily,
    uploadIntent: args?.uploadIntent ?? 'ADD_TO_PACKAGE',
    ...args,
  };
}
