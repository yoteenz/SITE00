import type { AuthorityRecord } from '../../../site00/authority/publicRedesignAuthorityManifest';
import { PUBLIC_REDESIGN_ASSET_SLOTS, type AssetSlotSpec } from '../../../site00/authority/publicRedesignAssetSlots';
import type { ExperienceSurface } from '../map2/map2Types';
import { globalUiExclusions, isImageOwnership, ownershipForAssetSlot } from './layerOwnership';
import { canonicalImageFilename } from './canonicalFilenames';
import type { ImageRequirement, ImageRequirementManifest, SceneDecomposition } from './visualSurgeryTypes';

const DEFAULT_SURFACE: ExperienceSurface = 'MOBILE_WEB';

function continuityForSlot(slot: AssetSlotSpec): string {
  if (slot.id.includes('BLDR')) return 'BLDR_WORLD_SYSTEM_V1';
  if (slot.id.includes('EVOLVE')) return 'EVOLVE_INTERVENTION_SYSTEM_V1';
  if (slot.id.includes('IDNTY')) return 'IDNTY_ATRIUM_CONTINUITY_V1';
  if (slot.id.includes('ORIGIN')) return 'SITE00_ORIGIN_UNIVERSE_V1';
  if (slot.id.includes('LOCATIONS')) return 'SITE00_LOCATIONS_UNIVERSE_V1';
  return 'SITE00_VISUAL_UNIVERSE_V1';
}

function familyForSlot(slot: AssetSlotSpec): string {
  if (slot.assetType === 'environment-plate') return `${slot.id.split('.')[1]}_ENVIRONMENT_FAMILY_V1`;
  if (slot.assetType === 'machine-illustration') return `${slot.id.split('.')[1]}_TRANSPARENT_OBJECT_FAMILY_V1`;
  if (slot.assetType === 'card-thumbnail') return `${slot.id.split('.')[1]}_CARD_IMAGE_FAMILY_V1`;
  return 'CUSTOM_EXPERIENCE_IMAGE_FAMILY_V1';
}

function mustIncludeForSlot(slot: AssetSlotSpec): string[] {
  const roleSummary = slot.role.replace(/\(PANEL HEADER\)/gi, 'panel vignette').replace(/\bHEADER\b/gi, 'hero region');
  const base = [roleSummary.split('—')[0]?.trim() ?? roleSummary, 'SITE 00 luminous white material language where applicable'];
  if (slot.assetType === 'environment-plate') {
    base.push('architectural depth', 'polished floor or terrace when visible', 'red structural accents when BLDR/EVOLVE family');
  }
  if (slot.transparentBackground) {
    base.push('clean alpha edges', 'object isolation without environment bake-in');
  }
  return base.filter(Boolean);
}

function mustExcludeForSlot(slot: AssetSlotSpec, authority?: AuthorityRecord): string[] {
  const ex = [...globalUiExclusions()];
  if (slot.assetType === 'environment-plate') {
    ex.push('central machine tower', 'path card illustrations', 'floating UI panels');
  }
  if (slot.assetType === 'card-thumbnail') {
    ex.push('card titles', 'path labels', 'buttons');
  }
  if (slot.assetType === 'machine-illustration') {
    ex.push('full environment plate', 'navigation', 'header');
  }
  if (authority?.family === 'BLDR' && slot.id.includes('ENV')) {
    ex.push('BLDR tower assembly', 'route selector cards');
  }
  return ex;
}

function surfaceDerivationForSlot(slot: AssetSlotSpec): ImageRequirement['surface_derivation'] {
  if (slot.assetType === 'environment-plate') return 'EXTENDED_CANVAS';
  if (slot.assetType === 'card-thumbnail') return 'SAME_ASSET_DIFFERENT_CROP';
  return 'NOT_APPLICABLE';
}

function defaultNegativeSpace(slot: AssetSlotSpec): ImageRequirement['negative_space'] {
  if (slot.assetType === 'environment-plate') {
    return {
      left_clear_percent: 5,
      right_clear_percent: 5,
      top_clear_percent: 12,
      bottom_clear_percent: 35,
      central_clear_region: { x: 0.1, y: 0.55, w: 0.8, h: 0.35 },
      custom_polygon_clear_region: null,
    };
  }
  return {
    left_clear_percent: 0,
    right_clear_percent: 0,
    top_clear_percent: 0,
    bottom_clear_percent: 0,
    central_clear_region: null,
    custom_polygon_clear_region: null,
  };
}

export function compileImageRequirementFromSlot(
  slot: AssetSlotSpec,
  authority: AuthorityRecord,
  _layerId: string,
): ImageRequirement | null {
  const ownership = ownershipForAssetSlot(slot);
  if (!isImageOwnership(ownership) || !slot.grokRequired) return null;

  return {
    asset_id: slot.id,
    canonical_name: canonicalImageFilename(slot),
    authority_id: authority.id,
    route: authority.route,
    family: familyForSlot(slot),
    surface: DEFAULT_SURFACE,
    asset_type: ownership,
    source_bbox: { x: 0, y: 0, w: 1, h: 1 },
    target_output_size: slot.dimensions,
    aspect_ratio: slot.aspect,
    crop_mode: slot.crop,
    anchor: 'center',
    z_index: ownership === 'ENVIRONMENT_IMAGE' ? 10 : 60,
    transparency: slot.transparentBackground,
    mask: slot.assetType === 'card-thumbnail' ? 'PARENT_OVERFLOW' : 'IN_ASSET',
    parent_layer: null,
    layers_above: [],
    layers_below: [],
    must_include: mustIncludeForSlot(slot),
    must_exclude: mustExcludeForSlot(slot, authority),
    clear_zones: slot.assetType === 'environment-plate' ? ['UI_CLEAR_ZONE', 'NAV_OVERLAY_ZONE'] : ['PRIMARY_CONTENT_ZONE'],
    safe_zones: slot.assetType === 'environment-plate' ? ['CROP_SAFE_ZONE', 'FOCAL_ZONE', 'NO_FOCAL_DETAIL_ZONE'] : ['CROP_SAFE_ZONE'],
    focus_region: slot.assetType === 'environment-plate' ? { x: 0.2, y: 0.15, w: 0.6, h: 0.45 } : null,
    perspective: 'architectural one-point with subtle wide lens',
    camera: 'eye-level hero environment camera',
    lighting: 'soft daylight with red accent bounce where brand family requires',
    materials: 'white ceramic, glass, polished floor, red structural inserts',
    depth: 'medium atmospheric depth',
    contrast: 'high legibility, calm midtones',
    color_behavior: 'neutral whites with brand red accents only on structure',
    continuity_group: continuityForSlot(slot),
    surface_derivation: surfaceDerivationForSlot(slot),
    source_reference: authority.id,
    reference_crop: `reference-crops/${slot.id.replace(/\./g, '_')}_REFERENCE.jpg`,
    output_format: slot.transparentBackground ? 'png' : 'webp',
    generation_required: slot.grokRequired,
    grok_required: slot.grokRequired,
    shadow_ownership: slot.transparentBackground ? 'SHADOW_SEPARATE_ASSET' : 'NO_SHADOW',
    reflection_ownership: slot.transparentBackground ? 'CSS' : 'NONE',
    negative_space: defaultNegativeSpace(slot),
    version: 1,
    existing_disposition: slot.id === 'ENV.ORIGIN.COLLAPSED' ? 'KEEP' : null,
  };
}

export function compileImageRequirements(input: {
  project_id: string;
  authorities: AuthorityRecord[];
  decompositions: SceneDecomposition[];
}): ImageRequirementManifest {
  const byAuth = new Map(input.decompositions.map((d) => [d.authority_id, d]));
  const seen = new Set<string>();
  const requirements: ImageRequirement[] = [];

  for (const authority of input.authorities) {
    const decomp = byAuth.get(authority.id);
    for (const slotId of authority.assetSlots) {
      const slot = PUBLIC_REDESIGN_ASSET_SLOTS.find((s) => s.id === slotId);
      if (!slot || seen.has(slot.id)) continue;
      seen.add(slot.id);
      const layer = decomp?.layers.find((l) => l.asset_slot_id === slot.id);
      const req = compileImageRequirementFromSlot(slot, authority, layer?.layer_id ?? slot.id);
      if (req) requirements.push(req);
    }
  }

  return {
    project_id: input.project_id,
    requirements,
    compiled_at: new Date().toISOString(),
  };
}

export function validateMustIncludeExclude(req: ImageRequirement): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!req.must_include.length) errors.push('must_include empty');
  if (!req.must_exclude.length) errors.push('must_exclude empty');
  const uiTerms = ['navigation', 'header', 'text', 'button'];
  for (const term of uiTerms) {
    if (req.must_include.some((m) => m.toLowerCase().includes(term))) {
      errors.push(`must_include must not reference live UI: ${term}`);
    }
  }
  return { ok: errors.length === 0, errors };
}
