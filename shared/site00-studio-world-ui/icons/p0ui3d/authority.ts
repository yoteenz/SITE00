import {
  NDX_ICON_REFERENCE_AUTHORITY,
  NDX_ICON_REFERENCE_SHEET_HEIGHT,
  NDX_ICON_REFERENCE_SHEET_PATH,
  NDX_ICON_REFERENCE_SHEET_SOURCE_ID,
  NDX_ICON_REFERENCE_SHEET_WIDTH,
  NDX_ICON_V3_CROPS,
  NDXIconReferenceAuthorityMap,
} from './constants.js';
import type { NdxIconPixelReferenceAuthority } from '../p0ui3b/types.js';

export const NDX_ICON_SHEET_REFERENCE_AUTHORITY: NdxIconPixelReferenceAuthority = {
  id: 'ndx-icon-sheet-reference-authority-v3',
  sourceReferenceId: NDX_ICON_REFERENCE_SHEET_SOURCE_ID,
  sourceAssetPath: NDX_ICON_REFERENCE_SHEET_PATH,
  imageWidth: NDX_ICON_REFERENCE_SHEET_WIDTH,
  imageHeight: NDX_ICON_REFERENCE_SHEET_HEIGHT,
  screenContext: 'P0.UI.3D icon reference sheet — bottom nav, header, project menu',
  iconCrops: NDX_ICON_V3_CROPS,
};

export { NDX_ICON_REFERENCE_AUTHORITY, NDXIconReferenceAuthorityMap };
