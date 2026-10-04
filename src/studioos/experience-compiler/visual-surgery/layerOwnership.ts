import type { AssetSlotSpec } from '../../../site00/authority/publicRedesignAssetSlots';
import type { LayerOwnershipEntry, LayerOwnershipType, SceneLayer } from './visualSurgeryTypes';

export function ownershipForAssetSlot(slot: AssetSlotSpec): LayerOwnershipType {
  if (!slot.grokRequired && slot.svgCssCouldReplace) return 'LIVE_SVG';
  if (!slot.grokRequired) return 'NO_GENERATION';
  switch (slot.assetType) {
    case 'environment-plate':
      return 'ENVIRONMENT_IMAGE';
    case 'machine-illustration':
      return slot.transparentBackground ? 'TRANSPARENT_OBJECT' : 'FOREGROUND_IMAGE';
    case 'card-thumbnail':
      return 'CARD_IMAGE';
    case 'surface-material':
      return 'TEXTURE_MATERIAL';
    default:
      return 'FOREGROUND_IMAGE';
  }
}

export function isImageOwnership(type: LayerOwnershipType): boolean {
  return [
    'ENVIRONMENT_IMAGE',
    'FOREGROUND_IMAGE',
    'TRANSPARENT_OBJECT',
    'CARD_IMAGE',
    'TEXTURE_MATERIAL',
    'MASK_EFFECT',
  ].includes(type);
}

export function globalUiExclusions(): string[] {
  return [
    'header text and chrome',
    'navigation labels and buttons',
    'bottom navigation bar',
    'form fields and inputs',
    'card titles and body copy',
    'status badges and progress indicators',
    'live technical red linework (SVG)',
    'brand icons unless asset spec requires them',
  ];
}

export function sceneLayersToOwnershipEntries(layers: SceneLayer[]): LayerOwnershipEntry[] {
  return layers.map((layer) => {
    const overlaps = layers
      .filter((o) => o.layer_id !== layer.layer_id && boxesOverlap(layer.bbox, o.bbox))
      .map((o) => o.layer_id);
    const depends_on = layer.parent_layer_id ? [layer.parent_layer_id] : [];
    const excludes = layers
      .filter((o) => o.generated_or_live === 'LIVE' && o.z_index > layer.z_index)
      .map((o) => o.layer_id);
    return {
      layer_id: layer.layer_id,
      ownership_type: layer.ownership_type,
      bbox: layer.bbox,
      z_index: layer.z_index,
      parent: layer.parent_layer_id,
      mask: layer.mask,
      clip: layer.clip,
      opacity: layer.opacity,
      surface: layer.surface,
      asset_required: layer.generated_or_live === 'GENERATED' && isImageOwnership(layer.ownership_type),
      generated_or_live: layer.generated_or_live,
      overlaps,
      depends_on,
      excludes,
      asset_slot_id: layer.asset_slot_id,
    };
  });
}

function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function compileLayerOwnershipManifest(
  project_id: string,
  scenes: Record<string, LayerOwnershipEntry[]>,
): import('./visualSurgeryTypes').LayerOwnershipManifest {
  return {
    project_id,
    scenes,
    compiled_at: new Date().toISOString(),
  };
}
