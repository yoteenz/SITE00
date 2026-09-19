import { NDX_FOUNDER_REFERENCE_PATHS } from '../../../site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.js';
import {
  NDX_ICON_CROP_BOUNDS,
  NDX_ICON_MOBILE_OVERVIEW_SCREEN,
  NDX_ICON_REFERENCE_ASSET_PATH,
  NDX_ICON_REFERENCE_SOURCE_ID,
  NDX_ICON_VISUAL_AUTHORITY_ID,
} from './constants.js';
import type { NdxIconVisualReferenceAuthority } from './types.js';

export const NDX_ICON_VISUAL_REFERENCE_AUTHORITY: NdxIconVisualReferenceAuthority = {
  id: NDX_ICON_VISUAL_AUTHORITY_ID,
  sourceReferenceId: NDX_ICON_REFERENCE_SOURCE_ID,
  sourceAssetPath: NDX_ICON_REFERENCE_ASSET_PATH,
  boardWidth: 2340,
  boardHeight: 844,
  screenContext: 'MOBILE_OVERVIEW',
  screenBounds: NDX_ICON_MOBILE_OVERVIEW_SCREEN,
  iconCropBounds: NDX_ICON_CROP_BOUNDS,
};

export function resolveIconReferenceAssetPath(): string {
  return NDX_FOUNDER_REFERENCE_PATHS.mobile;
}

export function boardToScreenCropBounds(cropKey: string): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const crop = NDX_ICON_CROP_BOUNDS[cropKey];
  if (!crop) throw new Error(`Unknown icon crop: ${cropKey}`);
  const screen = NDX_ICON_MOBILE_OVERVIEW_SCREEN;
  return {
    x: screen.x + crop.x * screen.width,
    y: screen.y + crop.y * screen.height,
    width: crop.width * screen.width,
    height: crop.height * screen.height,
  };
}
