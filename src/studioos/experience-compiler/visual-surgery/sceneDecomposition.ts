import type { AuthorityRecord } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { getAssetSlot, type AssetSlotSpec } from '../../../site00/authority/publicRedesignAssetSlots';
import type { ExperienceSurface } from '../map2/map2Types';
import { ownershipForAssetSlot } from './layerOwnership';
import type { SceneDecomposition, SceneLayer } from './visualSurgeryTypes';

const DEFAULT_SURFACE: ExperienceSurface = 'MOBILE_WEB';

/** Normalized layout heuristics until Opus live geometry probes attach. */
function bboxForSlot(slot: AssetSlotSpec, index: number, _total: number): SceneLayer['bbox'] {
  if (slot.assetType === 'environment-plate') {
    return { x: 0, y: 0, w: 1, h: 1 };
  }
  if (slot.assetType === 'machine-illustration') {
    return { x: 0.12, y: 0.22, w: 0.76, h: 0.38 };
  }
  if (slot.assetType === 'card-thumbnail') {
    const col = index % 2;
    const row = Math.floor(index / 2);
    return { x: 0.06 + col * 0.48, y: 0.58 + row * 0.18, w: 0.4, h: 0.14 };
  }
  return { x: 0.1, y: 0.1 + index * 0.05, w: 0.8, h: 0.2 };
}

function liveUiLayers(authority: AuthorityRecord): SceneLayer[] {
  const layers: SceneLayer[] = [];
  let z = 100;
  layers.push({
    layer_id: `${authority.id}_LIVE_HEADER`,
    label: 'header',
    ownership_type: 'LIVE_CODE_UI',
    z_index: z,
    bbox: { x: 0, y: 0, w: 1, h: 0.1 },
    surface: DEFAULT_SURFACE,
    asset_slot_id: null,
    parent_layer_id: null,
    mask: null,
    clip: null,
    opacity: 1,
    generated_or_live: 'LIVE',
    notes: 'Top chrome — never bake into raster assets',
  });
  z += 10;
  if (authority.family === 'BLDR' || authority.family === 'EVOLVE' || authority.id.includes('COMMAND') || authority.id.includes('INTERVENTION')) {
    layers.push({
      layer_id: `${authority.id}_LIVE_ROUTE_SELECTORS`,
      label: 'route selectors / path cards chrome',
      ownership_type: 'LIVE_CODE_UI',
      z_index: z,
      bbox: { x: 0.04, y: 0.52, w: 0.92, h: 0.36 },
      surface: DEFAULT_SURFACE,
      asset_slot_id: null,
      parent_layer_id: null,
      mask: null,
      clip: null,
      opacity: 1,
      generated_or_live: 'LIVE',
      notes: 'Card frames and labels — imagery fills inner regions only',
    });
    z += 10;
  }
  layers.push({
    layer_id: `${authority.id}_LIVE_SVG_LINEWORK`,
    label: 'technical linework',
    ownership_type: 'LIVE_SVG',
    z_index: 45,
    bbox: { x: 0.05, y: 0.15, w: 0.9, h: 0.75 },
    surface: DEFAULT_SURFACE,
    asset_slot_id: null,
    parent_layer_id: null,
    mask: null,
    clip: null,
    opacity: 1,
    generated_or_live: 'LIVE',
    notes: 'Precision SVG — do not duplicate inside Grok environments',
  });
  layers.push({
    layer_id: `${authority.id}_LIVE_BOTTOM_NAV`,
    label: 'bottom nav',
    ownership_type: 'LIVE_CODE_UI',
    z_index: 200,
    bbox: { x: 0, y: 0.88, w: 1, h: 0.12 },
    surface: DEFAULT_SURFACE,
    asset_slot_id: null,
    parent_layer_id: null,
    mask: null,
    clip: null,
    opacity: 1,
    generated_or_live: 'LIVE',
    notes: 'Global navigation — excluded from all environment crops',
  });
  return layers;
}

export function decomposeAuthorityScreen(authority: AuthorityRecord): SceneDecomposition {
  const slots = authority.assetSlots
    .map((id) => getAssetSlot(id))
    .filter(Boolean) as AssetSlotSpec[];

  const envSlots = slots.filter((s) => s.assetType === 'environment-plate');
  const machineSlots = slots.filter((s) => s.assetType === 'machine-illustration');
  const cardSlots = slots.filter((s) => s.assetType === 'card-thumbnail');
  const otherSlots = slots.filter((s) => !envSlots.includes(s) && !machineSlots.includes(s) && !cardSlots.includes(s));

  const layers: SceneLayer[] = [];
  let z = 10;

  for (const slot of envSlots) {
    layers.push({
      layer_id: `${authority.id}_${slot.id}`,
      label: slot.role.slice(0, 80),
      ownership_type: ownershipForAssetSlot(slot),
      z_index: z,
      bbox: bboxForSlot(slot, 0, 1),
      surface: DEFAULT_SURFACE,
      asset_slot_id: slot.id,
      parent_layer_id: null,
      mask: null,
      clip: 'full-bleed',
      opacity: 1,
      generated_or_live: slot.grokRequired ? 'GENERATED' : 'LIVE',
      notes: slot.position,
    });
    z += 5;
  }

  for (let i = 0; i < machineSlots.length; i++) {
    const slot = machineSlots[i]!;
    layers.push({
      layer_id: `${authority.id}_${slot.id}`,
      label: slot.role.slice(0, 80),
      ownership_type: ownershipForAssetSlot(slot),
      z_index: 50 + i,
      bbox: bboxForSlot(slot, i, machineSlots.length),
      surface: DEFAULT_SURFACE,
      asset_slot_id: slot.id,
      parent_layer_id: envSlots[0] ? `${authority.id}_${envSlots[0].id}` : null,
      mask: null,
      clip: null,
      opacity: 1,
      generated_or_live: slot.grokRequired ? 'GENERATED' : 'LIVE',
      notes: slot.transparentBackground ? 'Requires true alpha' : slot.position,
    });
  }

  cardSlots.forEach((slot, i) => {
    layers.push({
      layer_id: `${authority.id}_${slot.id}`,
      label: slot.role.slice(0, 80),
      ownership_type: ownershipForAssetSlot(slot),
      z_index: 60 + i,
      bbox: bboxForSlot(slot, i, cardSlots.length),
      surface: DEFAULT_SURFACE,
      asset_slot_id: slot.id,
      parent_layer_id: null,
      mask: 'card-viewport',
      clip: 'card-inner',
      opacity: 1,
      generated_or_live: slot.grokRequired ? 'GENERATED' : 'LIVE',
      notes: 'Image region inside live card — no baked copy',
    });
  });

  otherSlots.forEach((slot, i) => {
    layers.push({
      layer_id: `${authority.id}_${slot.id}`,
      label: slot.role.slice(0, 80),
      ownership_type: ownershipForAssetSlot(slot),
      z_index: 40 + i,
      bbox: bboxForSlot(slot, i, otherSlots.length),
      surface: DEFAULT_SURFACE,
      asset_slot_id: slot.id,
      parent_layer_id: null,
      mask: null,
      clip: null,
      opacity: 1,
      generated_or_live: slot.grokRequired ? 'GENERATED' : 'LIVE',
      notes: slot.position,
    });
  });

  layers.push(...liveUiLayers(authority));

  return {
    authority_id: authority.id,
    route: authority.route,
    viewport: authority.viewport,
    layers: layers.sort((a, b) => a.z_index - b.z_index),
    compiled_at: new Date().toISOString(),
  };
}

export function decomposeAuthorities(authorities: AuthorityRecord[]): SceneDecomposition[] {
  return authorities.map(decomposeAuthorityScreen);
}
