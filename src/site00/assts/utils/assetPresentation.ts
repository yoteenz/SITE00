export type AssetPresentationMode = 'environment' | 'object' | 'ui' | 'brand' | 'project';

/** Maps logical asset_type to inspection staging mode. */
export function getAssetPresentationMode(assetType?: string | null): AssetPresentationMode {
  switch ((assetType ?? 'environment').toLowerCase()) {
    case 'object':
      return 'object';
    case 'ui':
    case 'graphic':
      return 'ui';
    case 'brand':
      return 'brand';
    case 'project':
      return 'project';
    default:
      return 'environment';
  }
}
