/**
 * B5.7 — Aspect ratio detection with tolerance bands.
 */

import type { AspectRatioClassification, CampaignAssetMediaMetadata } from './types.js';
import type { Entry001AssetType } from '../../site00-expression-engine/entry001CampaignPackage/types.js';

const RATIO_FAMILIES = [
  { id: '9:16' as const, target: 9 / 16, tolerance: 0.06, types: ['STORY_FRAME', 'REEL', 'REEL_COVER', 'TIKTOK'] as Entry001AssetType[] },
  { id: '4:5' as const, target: 4 / 5, tolerance: 0.06, types: ['CAROUSEL_SLIDE', 'STATIC_POST'] as Entry001AssetType[] },
  { id: '1:1' as const, target: 1, tolerance: 0.05, types: ['STATIC_POST', 'CAROUSEL_SLIDE'] as Entry001AssetType[] },
  { id: '16:9' as const, target: 16 / 9, tolerance: 0.06, types: ['REEL', 'X_POST'] as Entry001AssetType[] },
];

export function classifyAspectRatio(width: number, height: number): AspectRatioClassification {
  const ratio = width / height;
  const orientation: CampaignAssetMediaMetadata['orientation'] =
    Math.abs(ratio - 1) < 0.05 ? 'SQUARE' : ratio < 1 ? 'PORTRAIT' : 'LANDSCAPE';

  let best = RATIO_FAMILIES[0]!;
  let bestDelta = Math.abs(ratio - best.target);

  for (const family of RATIO_FAMILIES) {
    const delta = Math.abs(ratio - family.target);
    if (delta < bestDelta) {
      best = family;
      bestDelta = delta;
    }
  }

  const matched = bestDelta <= best.tolerance;
  const likelyFormatFamilies =
    best.id === '9:16'
      ? (['STORY', 'REEL'] as const)
      : best.id === '4:5'
        ? (['CAROUSEL'] as const)
        : best.id === '1:1'
          ? (['CAROUSEL'] as const)
          : (['REEL', 'X'] as const);

  return {
    ratio,
    orientation,
    likelyFormatFamilies: [...likelyFormatFamilies],
    likelyAssetTypes: [...best.types],
    confidence: matched ? 'HIGH' : bestDelta < 0.12 ? 'MODERATE' : 'LOW',
    matchedFamily: matched ? best.id : 'OTHER',
  };
}

export function inferMediaType(mimeType: string): CampaignAssetMediaMetadata['mediaType'] {
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('image/gif')) return 'GIF';
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
}

export function buildMediaMetadata(args: {
  width: number;
  height: number;
  mimeType: string;
  fileSize: number;
  duration?: number;
}): CampaignAssetMediaMetadata {
  const aspect = classifyAspectRatio(args.width, args.height);
  return {
    width: args.width,
    height: args.height,
    aspectRatio: aspect.ratio,
    orientation: aspect.orientation,
    duration: args.duration,
    mimeType: args.mimeType,
    fileSize: args.fileSize,
    mediaType: inferMediaType(args.mimeType),
  };
}
