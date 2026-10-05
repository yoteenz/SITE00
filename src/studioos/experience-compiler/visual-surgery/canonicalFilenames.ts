import type { AssetSlotSpec } from '../../../site00/authority/publicRedesignAssetSlots';

export function canonicalImageFilename(slot: AssetSlotSpec, surface: 'master' | 'mobile' | 'tablet' | 'desktop' | 'app' = 'master'): string {
  const id = slot.id.toLowerCase().replace(/\./g, '-');
  if (slot.assetType === 'environment-plate') {
    return surface === 'master' ? `img-${id}-master.webp` : `img-${id}-${surface}.webp`;
  }
  if (slot.assetType === 'machine-illustration' && slot.transparentBackground) {
    return `obj-${id}-transparent.png`;
  }
  if (slot.assetType === 'card-thumbnail') {
    return `img-${id}.webp`;
  }
  if (slot.assetType === 'surface-material') {
    return `mat-${id}.webp`;
  }
  return `img-${id}.webp`;
}
