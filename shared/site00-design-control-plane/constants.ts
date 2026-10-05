/**
 * P0.BRIDGE.1 — Control plane constants and blocked operations.
 */

export const FORBIDDEN_OPERATION_TYPES = [
  'EXECUTE_CODE',
  'EVAL',
  'RUN_SCRIPT_FROM_DB',
  'REPLACE_FILE_WITH_DB_STRING',
] as const;

export const RUNTIME_SAFE_CHANGE_TYPES = [
  'CONTENT_BINDING',
  'ASSET_BINDING',
  'DESIGN_TOKEN_OVERRIDE',
  'SAFE_THEME_VALUE',
  'PAGE_METADATA',
  'SECTION_ORDER',
  'ALLOWED_COMPONENT_VARIANT',
  'FEATURE_FLAG',
  'SAFE_LAYOUT_CONFIG',
] as const;

export const SOURCE_CODE_CHANGE_TYPES = [
  'ADD_PAGE',
  'ADD_ROUTE',
  'ADD_TAB',
  'ADD_COMPONENT',
  'MODIFY_COMPONENT_STRUCTURE',
  'MODIFY_SHARED_SHELL',
  'ADD_SECTION_COMPONENT',
  'REMOVE_SECTION_COMPONENT',
  'RESPONSIVE_ARCHITECTURE_CHANGE',
  'INTERACTION_CHANGE',
  'REFACTOR_TO_SHARED_SHELL',
  'BUSINESS_LOGIC_ADJACENT_UI_CHANGE',
] as const;

export const ALLOWED_RUNTIME_COMPONENT_KEYS = [
  'HERO',
  'FEATURE_GRID',
  'TESTIMONIALS',
  'FAQ',
  'CTA',
  'MEDIA_BLOCK',
  'PRODUCT_GRID',
] as const;

export const STUDIO_WORLD_NATIVE_ROUTE_PREFIXES = [
  '/studio/',
  '/admin/site00',
  '/control',
  'asset-pipeline',
  'character-pipeline',
  'campaign-pipeline',
  'film-production',
] as const;

export const BRIDGE_MIGRATION_HINT =
  'Run supabase migration 20260826123000_site00_design_control_plane_bridge.sql';

export const BRIDGE_SCHEMA_TABLES = [
  'site00_managed_projects',
  'site00_repo_bindings',
  'site00_change_requests',
  'site00_change_operations',
  'site00_change_approvals',
  'site00_change_receipts',
  'site00_shell_propagation_changes',
  'site00_shell_propagation_members',
] as const;
