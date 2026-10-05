import type { ExperienceSurface } from '../map2/map2Types';

export type LayerOwnershipType =
  | 'LIVE_CODE_UI'
  | 'LIVE_SVG'
  | 'ENVIRONMENT_IMAGE'
  | 'FOREGROUND_IMAGE'
  | 'TRANSPARENT_OBJECT'
  | 'CARD_IMAGE'
  | 'TEXTURE_MATERIAL'
  | 'MASK_EFFECT'
  | 'EXISTING_BRAND_ASSET'
  | 'EXTERNAL_ASSET'
  | 'ICON_ASSET'
  | 'MICRO_ASSET'
  | 'NO_GENERATION';

export type ShadowOwnership = 'SHADOW_BAKED_IN' | 'SHADOW_SEPARATE_ASSET' | 'SHADOW_CSS' | 'NO_SHADOW';
export type ReflectionOwnership = 'BAKED' | 'SEPARATE' | 'CSS' | 'NONE';
export type MaskOwnership = 'IN_ASSET' | 'CSS_MASK' | 'SVG_MASK' | 'PARENT_OVERFLOW';

export type SurfaceDerivationKind =
  | 'SAME_ASSET_DIFFERENT_CROP'
  | 'EXTENDED_CANVAS'
  | 'SURFACE_VARIANT_REQUIRED'
  | 'APP_VARIANT_REQUIRED'
  | 'SURFACE_SPECIFIC_COMPOSITION'
  | 'NOT_APPLICABLE';

export type ImageFamilyKind =
  | 'ENVIRONMENT_FAMILY'
  | 'CARD_IMAGE_FAMILY'
  | 'PRODUCT_IMAGE_FAMILY'
  | 'CHARACTER_FAMILY'
  | 'TRANSPARENT_OBJECT_FAMILY'
  | 'ILLUSTRATION_FAMILY'
  | 'MATERIAL_FAMILY'
  | 'EDITORIAL_IMAGE_FAMILY'
  | 'IMMERSIVE_WORLD_FAMILY'
  | 'CUSTOM_EXPERIENCE_IMAGE_FAMILY';

export type ContinuityGroupKind =
  | 'SAME_LOCATION'
  | 'SAME_WORLD'
  | 'SAME_BUILDING'
  | 'SAME_PRODUCT_SESSION'
  | 'SAME_CAMPAIGN'
  | 'SAME_CHARACTER'
  | 'SAME_MATERIAL_SYSTEM'
  | 'SAME_EXPERIENCE_FAMILY'
  | 'CUSTOM';

export type SafeZoneKind =
  | 'UI_CLEAR_ZONE'
  | 'PRIMARY_CONTENT_ZONE'
  | 'CROP_SAFE_ZONE'
  | 'FOCAL_ZONE'
  | 'NO_FOCAL_DETAIL_ZONE'
  | 'TEXT_OVERLAY_ZONE'
  | 'NAV_OVERLAY_ZONE';

export type ExistingAssetDisposition = 'KEEP' | 'REUSE' | 'RE_CROP' | 'EXTEND' | 'REGENERATE' | 'REPLACE';

export type SceneLayer = {
  layer_id: string;
  label: string;
  ownership_type: LayerOwnershipType;
  z_index: number;
  bbox: { x: number; y: number; w: number; h: number };
  surface: ExperienceSurface;
  asset_slot_id: string | null;
  parent_layer_id: string | null;
  mask: string | null;
  clip: string | null;
  opacity: number;
  generated_or_live: 'GENERATED' | 'LIVE';
  notes: string;
};

export type SceneDecomposition = {
  authority_id: string;
  route: string;
  viewport: { w: number; h: number };
  layers: SceneLayer[];
  compiled_at: string;
};

export type LayerOwnershipEntry = {
  layer_id: string;
  ownership_type: LayerOwnershipType;
  bbox: { x: number; y: number; w: number; h: number };
  z_index: number;
  parent: string | null;
  mask: string | null;
  clip: string | null;
  opacity: number;
  surface: ExperienceSurface;
  asset_required: boolean;
  generated_or_live: 'GENERATED' | 'LIVE';
  overlaps: string[];
  depends_on: string[];
  excludes: string[];
  asset_slot_id: string | null;
};

export type LayerOwnershipManifest = {
  project_id: string;
  scenes: Record<string, LayerOwnershipEntry[]>;
  compiled_at: string;
};

export type NegativeSpaceSpec = {
  left_clear_percent: number;
  right_clear_percent: number;
  top_clear_percent: number;
  bottom_clear_percent: number;
  central_clear_region: { x: number; y: number; w: number; h: number } | null;
  custom_polygon_clear_region: number[][] | null;
};

export type ImageRequirement = {
  asset_id: string;
  canonical_name: string;
  authority_id: string;
  route: string;
  family: string;
  surface: ExperienceSurface;
  asset_type: LayerOwnershipType;
  source_bbox: { x: number; y: number; w: number; h: number };
  target_output_size: { w: number; h: number };
  aspect_ratio: string;
  crop_mode: string;
  anchor: string;
  z_index: number;
  transparency: boolean;
  mask: MaskOwnership;
  parent_layer: string | null;
  layers_above: string[];
  layers_below: string[];
  must_include: string[];
  must_exclude: string[];
  clear_zones: SafeZoneKind[];
  safe_zones: SafeZoneKind[];
  focus_region: { x: number; y: number; w: number; h: number } | null;
  perspective: string;
  camera: string;
  lighting: string;
  materials: string;
  depth: string;
  contrast: string;
  color_behavior: string;
  continuity_group: string;
  surface_derivation: SurfaceDerivationKind;
  source_reference: string;
  reference_crop: string | null;
  output_format: string;
  generation_required: boolean;
  grok_required: boolean;
  shadow_ownership: ShadowOwnership;
  reflection_ownership: ReflectionOwnership;
  negative_space: NegativeSpaceSpec;
  version: number;
  existing_disposition: ExistingAssetDisposition | null;
};

export type ImageRequirementManifest = {
  project_id: string;
  requirements: ImageRequirement[];
  compiled_at: string;
};

export type ImageExpression = {
  project_id: string;
  camera_language: string;
  lens_behavior: string;
  viewpoint: string;
  perspective: string;
  composition: string;
  lighting: string;
  material_palette: string;
  brand_color_behavior: string;
  neutral_color_behavior: string;
  depth: string;
  atmosphere: string;
  realism: string;
  contrast: string;
  texture: string;
  human_presence: string;
  object_scale: string;
  negative_space: string;
  motion_potential: string;
  crop_behavior: string;
  surface_relationship: string;
};

export type ImageFamily = {
  image_family_id: string;
  name: string;
  kind: ImageFamilyKind;
  expression: ImageExpression;
  member_asset_ids: string[];
  status: 'DRAFT' | 'APPROVED' | 'MASTER_APPROVED';
  version: number;
};

export type ContinuityGroup = {
  continuity_group_id: string;
  name: string;
  kind: ContinuityGroupKind;
  shared_rules: string[];
  variable_elements: string[];
  member_asset_ids: string[];
};

export type ImageSurfaceVariant = {
  asset_id: string;
  surface: ExperienceSurface;
  derivation: SurfaceDerivationKind;
  crop_box: { x: number; y: number; w: number; h: number } | null;
  extension_rules: string | null;
  master_asset_id: string | null;
};

export type ReferenceCrop = {
  asset_id: string;
  authority_id: string;
  relative_path: string;
  source_bbox: { x: number; y: number; w: number; h: number };
  purpose: string;
};

export type SafeZoneRegion = {
  kind: SafeZoneKind;
  bbox: { x: number; y: number; w: number; h: number };
  label: string;
};

export type SafeZoneMap = {
  asset_id: string;
  regions: SafeZoneRegion[];
  overlay_relative_path: string;
};

export type AssetDependency = {
  parent_asset: string;
  child_asset: string;
  dependency_type: 'MASTER_VARIANT' | 'PATH_VARIANT' | 'SURFACE_CROP' | 'CONTINUITY_LINEAGE';
  continuity_requirement: string;
  generation_order: number;
};

export type AssetFabricationSpec = {
  asset_id: string;
  purpose: string;
  family_id: string;
  continuity_group_id: string;
  surface: ExperienceSurface;
  dimensions: { w: number; h: number };
  aspect: string;
  reference_crop: string | null;
  scene_decomposition_sheet: string;
  safe_zone_map: string | null;
  must_include: string[];
  must_exclude: string[];
  camera: string;
  lighting: string;
  materials: string;
  perspective: string;
  negative_space: NegativeSpaceSpec;
  crop_behavior: string;
  transparency: boolean;
  shadow_ownership: ShadowOwnership;
  reflection_ownership: ReflectionOwnership;
  mask_ownership: MaskOwnership;
  asset_dependencies: string[];
  output_format: string;
  version: number;
};

export type GrokAssetPack = {
  project_id: string;
  pack_version: string;
  root: string;
  files: string[];
  image_asset_manifest: ImageRequirementManifest;
  continuity_groups: ContinuityGroup[];
  surface_variants: ImageSurfaceVariant[];
  layer_ownership: LayerOwnershipManifest;
  fabrication_specs: AssetFabricationSpec[];
};

export type AssetQACheck =
  | 'ASSET_ID'
  | 'FAMILY'
  | 'CONTINUITY'
  | 'DIMENSIONS'
  | 'ASPECT'
  | 'TRANSPARENCY'
  | 'CROP_SAFETY'
  | 'NEGATIVE_SPACE'
  | 'MUST_INCLUDE'
  | 'MUST_EXCLUDE'
  | 'NO_BAKED_UI'
  | 'NO_TEXT'
  | 'NO_ICON_CONTAMINATION'
  | 'NO_ENVIRONMENT_DRIFT'
  | 'NO_MATERIAL_DRIFT'
  | 'NO_CAMERA_DRIFT';

export type AssetQAResult = {
  asset_id: string;
  passed: boolean;
  checks: { check: AssetQACheck; passed: boolean; detail: string }[];
};

export type VisualFamilyPack = {
  pack_id: string;
  experience_family: string;
  image_family_ids: string[];
  continuity_group_ids: string[];
  master_asset_ids: string[];
  surface_derivation_guide: string;
  icon_family_reference: string | null;
};

export type VisualSurgeryPipelineSlice = {
  scene_decompositions: SceneDecomposition[];
  layer_ownership: LayerOwnershipManifest;
  image_requirements: ImageRequirementManifest;
  image_expression: ImageExpression;
  image_families: ImageFamily[];
  continuity_groups: ContinuityGroup[];
  surface_variants: ImageSurfaceVariant[];
  reference_crops: ReferenceCrop[];
  safe_zone_maps: SafeZoneMap[];
  asset_dependencies: AssetDependency[];
  fabrication_specs: AssetFabricationSpec[];
  grok_asset_pack: GrokAssetPack;
  visual_family_packs: VisualFamilyPack[];
  asset_qa_preview: AssetQAResult[];
  screens_analyzed: number;
  layers_discovered: number;
};
