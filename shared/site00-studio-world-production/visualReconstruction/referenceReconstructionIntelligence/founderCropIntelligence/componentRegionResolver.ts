/**
 * P0.VR.6R8 — ComponentRegionResolver: card-first localization before crop proposal.
 */

import type { NormalizedBbox } from '../types.js';
import { resolveFamilyCardCrop, resolveInnerMediaCrop } from './familyCropCalibration.js';
import type { AssetTargetSlotContract } from './types.js';

export type ComponentRegionResult = {
  cardRegion: NormalizedBbox;
  mediaRegion: NormalizedBbox;
  labelRegion: NormalizedBbox | null;
  pageRegion: NormalizedBbox;
  deviceChromeRegion: NormalizedBbox | null;
  componentId: string;
};

export function resolveComponentRegion(input: {
  brandKey: string;
  index: number;
  contract: AssetTargetSlotContract;
}): ComponentRegionResult {
  const cardRegion = resolveFamilyCardCrop(input.brandKey, input.index);
  const mediaRegion = resolveInnerMediaCrop(input.brandKey, cardRegion);

  const labelRegion =
    input.brandKey === 'NDXBOOK'
      ? {
          x: cardRegion.x,
          y: cardRegion.y + cardRegion.height * 0.72,
          width: cardRegion.width,
          height: cardRegion.height * 0.28,
        }
      : {
          x: cardRegion.x,
          y: cardRegion.y + cardRegion.height * 0.78,
          width: cardRegion.width,
          height: cardRegion.height * 0.22,
        };

  return {
    cardRegion,
    mediaRegion,
    labelRegion,
    pageRegion: { x: 0, y: 0, width: 1, height: 1 },
    deviceChromeRegion: input.brandKey === 'NDXBOOK' ? expandRegion(mediaRegion, 1.35) : null,
    componentId: `BRAND_FAMILY_${input.brandKey}_CARD`,
  };
}

function expandRegion(region: NormalizedBbox, factor: number): NormalizedBbox {
  const cx = region.x + region.width / 2;
  const cy = region.y + region.height / 2;
  const w = region.width * factor;
  const h = region.height * factor;
  return {
    x: cx - w / 2,
    y: cy - h / 2,
    width: w,
    height: h,
  };
}
