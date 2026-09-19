/**
 * Sprint B4.1 — pinned canonical Entry 002 REEL keyframe asset identities.
 */

import type { ReelKeyframeRole } from './entry002ReelTypes.js';

export const ENTRY_002_REEL_KF_START_001 = 'NDX-ENTRY-002-REEL-KF-START-001' as const;
export const ENTRY_002_REEL_KF_MID_001 = 'NDX-ENTRY-002-REEL-KF-MID-001' as const;
export const ENTRY_002_REEL_KF_END_001 = 'NDX-ENTRY-002-REEL-KF-END-001' as const;

export const ENTRY_002_REEL_KF_CANONICAL_IDS = {
  START: ENTRY_002_REEL_KF_START_001,
  MID: ENTRY_002_REEL_KF_MID_001,
  END: ENTRY_002_REEL_KF_END_001,
} as const;

export const ENTRY_002_REEL_KF_ASPECT_RATIO = '9:16' as const;
export const ENTRY_002_REEL_KF_DIMENSIONS = { width: 1080, height: 1920 } as const;

export function buildEntry002ReelKeyframeAssetId(
  role: ReelKeyframeRole,
  version = 1,
): string {
  const suffix = String(version).padStart(3, '0');
  return `NDX-ENTRY-002-REEL-KF-${role}-${suffix}`;
}

export function buildEntry002ReelKeyframeStoragePath(assetId: string): string {
  return `site00/assts/expression-engine/ndxbook/entry-002/reel/${assetId.toLowerCase()}.webp`;
}

export function resolveCanonicalKeyframeAssetId(role: ReelKeyframeRole): string {
  return ENTRY_002_REEL_KF_CANONICAL_IDS[role];
}
