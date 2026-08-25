import type { NdxIconPixelReferenceAuthority } from './types.js';
import {
  NDX_ICON_PIXEL_AUTHORITY_ID,
  NDX_ICON_PIXEL_IMAGE_HEIGHT,
  NDX_ICON_PIXEL_IMAGE_WIDTH,
  NDX_ICON_PIXEL_REFERENCE_ASSET_PATH,
  NDX_ICON_PIXEL_REFERENCE_SOURCE_ID,
  NDX_ICON_V2_CROPS,
} from './constants.js';

export const NDX_ICON_PIXEL_REFERENCE_AUTHORITY: NdxIconPixelReferenceAuthority = {
  id: NDX_ICON_PIXEL_AUTHORITY_ID,
  sourceReferenceId: NDX_ICON_PIXEL_REFERENCE_SOURCE_ID,
  sourceAssetPath: NDX_ICON_PIXEL_REFERENCE_ASSET_PATH,
  imageWidth: NDX_ICON_PIXEL_IMAGE_WIDTH,
  imageHeight: NDX_ICON_PIXEL_IMAGE_HEIGHT,
  screenContext: 'MOBILE_OVERVIEW_MENU_OPEN',
  iconCrops: NDX_ICON_V2_CROPS,
};

export function resolvePixelReferenceAssetPath(): string {
  return NDX_ICON_PIXEL_REFERENCE_ASSET_PATH;
}

export function getExactIconReferenceCrop(iconName: string) {
  const crop = NDX_ICON_V2_CROPS[iconName];
  if (!crop) throw new Error(`Missing P0.UI.3B crop for ${iconName}`);
  return crop;
}
