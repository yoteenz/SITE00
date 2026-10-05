import type { ForensicBlueprintObject, BlueprintAssetBinding } from './types.js';

export function buildBlueprintAssetBindings(input: {
  objects: ForensicBlueprintObject[];
  authorityAssetUrl: string | null;
}): BlueprintAssetBinding[] {
  return input.objects
    .filter((o) => o.objectType === 'image' || o.assetRole != null)
    .map((obj) => {
      const bounds = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
      if (obj.objectId === '22' && input.authorityAssetUrl) {
        return {
          objectId: obj.objectId,
          assetRole: obj.assetRole ?? 'hero-photo',
          expectedBounds: bounds,
          sourceAsset: input.authorityAssetUrl,
          sourceStrategy: 'AUTHORITY_CROP',
          crop: 'hero-center-band-no-text',
          objectFit: 'cover',
          objectPosition: '58% 22%',
          status: 'AUTHORITY_CROP',
        } satisfies BlueprintAssetBinding;
      }
      if (obj.objectId === '47') {
        return {
          objectId: obj.objectId,
          assetRole: 'focus-books-photo',
          expectedBounds: bounds,
          sourceAsset: 'dom:book-stack-css',
          sourceStrategy: 'RECONSTRUCT',
          crop: null,
          objectFit: 'cover',
          objectPosition: 'center',
          status: 'RESOLVED',
        } satisfies BlueprintAssetBinding;
      }
      if (obj.assetRole === 'crosshair-svg') {
        return {
          objectId: obj.objectId,
          assetRole: 'crosshair-svg',
          expectedBounds: bounds,
          sourceAsset: 'dom:crosshair',
          sourceStrategy: 'RECONSTRUCT',
          crop: null,
          objectFit: null,
          objectPosition: null,
          status: 'RESOLVED',
        } satisfies BlueprintAssetBinding;
      }
      return {
        objectId: obj.objectId,
        assetRole: obj.assetRole ?? 'graphic',
        expectedBounds: bounds,
        sourceAsset: 'dom:css',
        sourceStrategy: 'RECONSTRUCT',
        crop: null,
        objectFit: null,
        objectPosition: null,
        status: 'RESOLVED',
      } satisfies BlueprintAssetBinding;
    });
}
