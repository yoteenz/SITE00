import type { NDXIconName } from '../types.js';

export type IconGeometryAuthorityState = 'ACTIVE_CANONICAL' | 'SUPERSEDED' | 'LEGACY' | 'UNUSED' | 'DUPLICATE';

export type NdxIconAssetManifestEntry = {
  iconName: NDXIconName;
  version: 'v3';
  sourcePath: string;
  publicPath: string;
  sourceHash: string;
  referenceId: string;
  filename: string;
};

export type NdxIconRuntimeSourceEntry = {
  iconName: NDXIconName;
  sourcePath: string;
  publicPath: string;
  version: 'v3';
};

export type IconGeometryAuthorityRecord = {
  iconName: NDXIconName;
  v1: IconGeometryAuthorityState;
  v2: IconGeometryAuthorityState;
  v3: IconGeometryAuthorityState;
};

export type P0UI3EFailureCode =
  | 'FAIL_NEW_ICON_CREATED_BUT_NOT_CONSUMED'
  | 'FAIL_RUNTIME_ICON_NOT_REPLACED'
  | 'FAIL_OLD_ICON_IMPORT_STILL_ACTIVE'
  | 'FAIL_OLD_PATH_SIGNATURE_STILL_ACTIVE'
  | 'FAIL_MULTIPLE_ACTIVE_ICON_SOURCES'
  | 'FAIL_ICON_REGISTRY_FALLBACK_TO_LEGACY'
  | 'FAIL_STALE_ICON_CACHE'
  | 'FAIL_BUILD_EXCLUDES_V3_ICON'
  | 'FAIL_DOM_ICON_VERSION_NOT_V3'
  | 'FAIL_LIVE_ICON_SILHOUETTE_NOT_REFERENCE'
  | 'FAIL_PROJECT_MENU_ICON_SOURCE_NOT_V3';
