/**
 * P0.VR.2A — Asset safe area contract for prompt + crop guidance.
 */

import { DEFAULT_SAFE_AREA_INSET } from './constants.js';
import type { AssetSafeAreaContract, ObjectFitMode, ReferenceBounds } from './types.js';

export function createDefaultSafeAreaContract(
  objectFit: ObjectFitMode = 'cover',
  inset = DEFAULT_SAFE_AREA_INSET,
): AssetSafeAreaContract {
  return {
    safeInsetTop: inset,
    safeInsetRight: inset,
    safeInsetBottom: inset,
    safeInsetLeft: inset,
    subjectAnchor: objectFit === 'cover' ? 'center' : 'center',
    textFreeZone: true,
    cropTolerance: objectFit === 'cover' ? 0.12 : 0.04,
  };
}

export function formatSafeAreaForPrompt(safeArea: AssetSafeAreaContract, bounds: ReferenceBounds): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return [
    `Safe area insets: top ${pct(safeArea.safeInsetTop)}, right ${pct(safeArea.safeInsetRight)}, bottom ${pct(safeArea.safeInsetBottom)}, left ${pct(safeArea.safeInsetLeft)}.`,
    `Subject anchor: ${safeArea.subjectAnchor}.`,
    `Subject must remain inside central safe area for ${bounds.width}×${bounds.height} (${bounds.aspectRatio}:1) slot.`,
    safeArea.textFreeZone ? 'Keep subject clear of overlay text zones.' : '',
    `Crop tolerance: ${pct(safeArea.cropTolerance)}.`,
  ]
    .filter(Boolean)
    .join(' ');
}

export function safeAreaPass(subjectCenterX: number, subjectCenterY: number, safeArea: AssetSafeAreaContract): boolean {
  const inX = subjectCenterX >= safeArea.safeInsetLeft && subjectCenterX <= 1 - safeArea.safeInsetRight;
  const inY = subjectCenterY >= safeArea.safeInsetTop && subjectCenterY <= 1 - safeArea.safeInsetBottom;
  return inX && inY;
}
