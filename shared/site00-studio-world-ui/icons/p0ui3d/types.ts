import type { NDXIconName } from '../types.js';
import type { ExactIconReferenceCrop, PixelTracedIconSpec } from '../p0ui3b/types.js';

export type NdxIconVisualVersionV3 = 'NDX_ICON_VISUAL_CANON_V3';

export type IconReferenceCrop = ExactIconReferenceCrop & {
  referenceAssetId: string;
  referenceWidth: number;
  referenceHeight: number;
  activeStateAvailable: boolean;
  inactiveStateAvailable: boolean;
};

export type ReferenceLockedIconSpec = Omit<PixelTracedIconSpec, 'visualVersion' | 'classification' | 'supersededGeometryId'> & {
  visualVersion: NdxIconVisualVersionV3;
  classification: 'REFERENCE_LOCKED';
  supersededGeometryId: 'NDX_ICON_V2_PIXEL_TRACED';
  referenceIconNumber: number;
  previousPathHash?: string;
};

export type SupersededIconGeometryRecord = {
  iconName: NDXIconName;
  previousPath: string[];
  newPath: string[];
  referenceSource: string;
  version: NdxIconVisualVersionV3;
  reason: 'SUPERSEDED_BY_P0_UI_3D_REFERENCE_CANON';
  status: 'SUPERSEDED_BY_P0_UI_3D_REFERENCE_CANON';
};

export type NdxIconReferenceAuthorityMapEntry = {
  registryName: NDXIconName;
  referenceIconNumber: number;
  referenceLabel: string;
};

export type P0UI3DFailureCode =
  | 'FAIL_OLD_ICON_GEOMETRY_INCORRECTLY_PROTECTED'
  | 'FAIL_REFERENCE_ICON_NOT_USED'
  | 'FAIL_SEMANTIC_ICON_REINTERPRETATION'
  | 'FAIL_LIBRARY_ICON_SUBSTITUTION'
  | 'FAIL_ICON_PATH_NOT_REPLACED'
  | 'FAIL_ICON_SILHOUETTE_MISMATCH'
  | 'FAIL_ICON_OPTICAL_FOOTPRINT_MISMATCH'
  | 'FAIL_HEADER_ELLIPSIS_CONTAINER_MISSING'
  | 'FAIL_ACTIVE_ICON_GEOMETRY_VARIATION'
  | 'FAIL_PROJECT_MENU_ICON_REFERENCE_MISMATCH';
