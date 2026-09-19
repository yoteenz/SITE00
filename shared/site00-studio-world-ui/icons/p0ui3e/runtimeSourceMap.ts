import type { NDXIconName } from '../types.js';
import { P0_UI_3D_TARGET_ICONS } from '../p0ui3d/constants.js';
import { NDX_V3_ASSET_REGISTRY } from './v3AssetRegistry.generated.js';
import type { NdxIconRuntimeSourceEntry } from './types.js';

/** Single runtime source per target icon — physical V3 SVG file path. */
export const NDX_ICON_RUNTIME_SOURCE_MAP: Record<NDXIconName, NdxIconRuntimeSourceEntry | null> = {
  overview: null,
  campaigns: null,
  content_ops: null,
  lab: null,
  more: null,
  notifications: null,
  ellipsis: null,
  project_overview: null,
  project_settings: null,
  back_to_projects: null,
  return_to_origin: null,
  inspect: null,
  help: null,
  experiments_hub: null,
  campaign_board: null,
  cultural_intelligence: null,
  character_lab: null,
  performance_learning: null,
  archive: null,
  projects: null,
  origin: null,
};

for (const iconName of P0_UI_3D_TARGET_ICONS) {
  const asset = NDX_V3_ASSET_REGISTRY[iconName];
  if (!asset) continue;
  NDX_ICON_RUNTIME_SOURCE_MAP[iconName] = {
    iconName: iconName as NDXIconName,
    sourcePath: asset.sourcePath,
    publicPath: asset.publicPath,
    version: 'v3',
  };
}

export function getRuntimeSourceForIcon(name: NDXIconName): NdxIconRuntimeSourceEntry | null {
  return NDX_ICON_RUNTIME_SOURCE_MAP[name] ?? null;
}

export function targetIconHasV3RuntimeSource(name: NDXIconName): boolean {
  return P0_UI_3D_TARGET_ICONS.includes(name) && NDX_ICON_RUNTIME_SOURCE_MAP[name]?.version === 'v3';
}
