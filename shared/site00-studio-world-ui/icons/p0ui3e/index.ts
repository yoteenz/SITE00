export * from './types.js';
export * from './runtimeSourceMap.js';
export * from './authorityState.js';
export * from './buildRegistry.js';
export { detectLibraryIconSubstitution } from '../p0ui3d/evaluation.js';
export { NDX_V3_ASSET_REGISTRY } from './v3AssetRegistry.generated.js';
export type { V3AssetRegistryEntry } from './v3AssetRegistry.generated.js';

import manifestJson from './manifest.generated.json';
export const NDX_ICON_ASSET_MANIFEST = manifestJson as {
  generatedAt: string;
  icons: import('./types.js').NdxIconAssetManifestEntry[];
};
