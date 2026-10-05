import type { ExperienceSurface } from '../map2/map2Types';

export type IconCategory =
  | 'NAVIGATION'
  | 'ACTION'
  | 'STATUS'
  | 'DOMAIN'
  | 'COMMERCE'
  | 'AUTH_ACCOUNT'
  | 'CONTENT'
  | 'CONFIGURATION'
  | 'VERIFICATION'
  | 'DIAGNOSTIC'
  | 'INTEGRATION'
  | 'CAPABILITY'
  | 'CUSTOM_EXPERIENCE'
  | 'APP_NAVIGATION'
  | 'SYSTEM_UTILITY'
  | 'SOCIAL_SHARE'
  | 'MEDIA'
  | 'FILE_ASSET';

export type IconImplementationClass =
  | 'LIVE_CODE_SVG'
  | 'BRAND_ICON'
  | 'ILLUSTRATIVE_MICRO_ASSET'
  | 'EXISTING_BRAND_ASSET'
  | 'EXTERNAL_PLATFORM_ICON';

export type IconSemanticId = string;

export type GlobalIconSemantic = {
  semantic_id: IconSemanticId;
  canonical_name: string;
  meaning: string;
  default_category: IconCategory;
};

export type IconRequirement = {
  icon_semantic_id: IconSemanticId;
  canonical_name: string;
  meaning: string;
  category: IconCategory;
  usage_context: string;
  experience_units: string[];
  families: string[];
  routes: string[];
  surfaces: ExperienceSurface[];
  required_sizes: number[];
  interaction_states: ('DEFAULT' | 'ACTIVE' | 'SELECTED' | 'DISABLED' | 'ALERT' | 'SUCCESS')[];
  frequency: 'HIGH' | 'MEDIUM' | 'LOW';
  prominence: 'PRIMARY' | 'SECONDARY' | 'UTILITY';
  accessibility_label_requirement: string;
  can_use_live_svg: boolean;
  brand_expression_required: boolean;
  micro_asset_candidate: boolean;
  app_nav_variant_required: boolean;
  compact_variant_required: boolean;
  display_variant_required: boolean;
  implementation_class: IconImplementationClass;
  notes: string;
};

export type IconRequirementManifest = {
  project_id: string;
  requirements: IconRequirement[];
  compiled_at: string;
};

export type IconExpression = {
  project_id: string;
  dimensionality: '2D' | '2.5D' | '3D' | 'MIXED';
  structure: 'LINE' | 'SOLID' | 'OBJECT' | 'HYBRID';
  stroke_weight: string;
  corner_language: string;
  geometric_language: string;
  depth: string;
  materials: string;
  brand_color_use: string;
  active_state: string;
  selected_state: string;
  disabled_state: string;
  alert_state: string;
  app_nav_expression: string;
  small_size_simplification: string;
  derived_from_brand: string;
};

export type IconFamily = {
  icon_family_id: string;
  name: string;
  expression: IconExpression;
  representative_semantic_ids: IconSemanticId[];
  status: 'DRAFT' | 'APPROVED' | 'SUPERSEDED';
  version: number;
  lineage_parent_id: string | null;
};

export type IconSurfaceVariant = {
  semantic_id: IconSemanticId;
  icon_family_id: string;
  surface: ExperienceSurface;
  variant_type: 'MASTER' | 'WEB_DISPLAY' | 'COMPACT' | 'MOBILE_NAV' | 'APP_NAV' | 'APP_ACTIVE' | 'MICRO_ASSET';
  size: number;
  visual_complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  simplification_level: number;
  derivable: boolean;
  unique_authority_required: boolean;
};

export type IconFamilyAuthority = {
  authority_id: string;
  authority_type: 'ICON_FAMILY_AUTHORITY';
  icon_family_id: string;
  version: number;
  representative_semantics: IconSemanticId[];
  surfaces_demonstrated: ExperienceSurface[];
  generation_prompt: string;
  approval_status: 'PLANNED' | 'APPROVED' | 'DEFERRED';
};

export type IconReview = {
  icon_family_id: string;
  version: number;
  status: string;
  feedback: string | null;
  parent_version: number | null;
  superseded_by: number | null;
};

export type MicroAssetExpression = {
  materials: string;
  lighting: string;
  perspective: string;
  depth: string;
  render_realism: string;
  brand_accents: string;
};

export type MicroAssetRequirement = {
  semantic_id: IconSemanticId;
  name: string;
  family_id: string;
  surfaces: ExperienceSurface[];
  expression: MicroAssetExpression;
};

export type MicroAssetFamily = {
  micro_asset_family_id: string;
  name: string;
  requirements: MicroAssetRequirement[];
};

export type IconManifestEntry = {
  semantic_id: IconSemanticId;
  canonical_name: string;
  family_id: string;
  implementation_class: IconImplementationClass;
  surfaces: ExperienceSurface[];
  variants: string[];
  sizes: number[];
  states: string[];
  output_format: 'svg' | 'webp' | 'png';
  transparency: boolean;
  live_code_or_asset: 'LIVE_CODE' | 'ASSET';
  source_authority: string;
  grok_required: boolean;
  filename: string;
  usage_locations: string[];
  accessibility_semantics: string;
};

export type IconManifest = {
  project_id: string;
  entries: IconManifestEntry[];
};

export type IconGenerationManifest = {
  project_id: string;
  grok_handoff: GrokIconHandoff;
};

export type GrokIconHandoff = {
  icon_family_authority_id: string;
  micro_asset_family_authority_id: string | null;
  icon_manifest: IconManifest;
  rules_summary: string;
  assets: {
    semantic_id: string;
    family_id: string;
    surface: string;
    variant: string;
    state: string;
    filename: string;
    grok_required: boolean;
  }[];
};

export type IconCoverageReport = {
  complete: boolean;
  missing: string[];
  counts: {
    total: number;
    live_svg: number;
    brand_icon: number;
    micro_asset: number;
    external: number;
    existing: number;
  };
};

export type IconPipelineSlice = {
  icon_requirements: IconRequirementManifest;
  icon_expression: IconExpression;
  icon_family: IconFamily;
  icon_surface_variants: IconSurfaceVariant[];
  icon_family_authority: IconFamilyAuthority;
  micro_asset_family: MicroAssetFamily | null;
  icon_manifest: IconManifest;
  grok_handoff: GrokIconHandoff;
  icon_coverage: IconCoverageReport;
  icon_expression_approved: boolean;
};
