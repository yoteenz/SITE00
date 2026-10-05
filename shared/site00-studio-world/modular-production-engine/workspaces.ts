/**
 * Recommended UI / workspace module registry (Phase 1 spec — routes TBD).
 */

export const STUDIO_WORLD_WORKSPACE_MODULES = [
  {
    id: 'CASTING',
    label: 'Casting Workspace',
    capabilities: ['role_brief', 'candidate_generation', 'founder_approval', 'actor_library_insertion'],
    pipeline: 'CASTING' as const,
    status: 'PARTIAL',
    existingUi: 'ExpressionEngineCastPanel',
  },
  {
    id: 'WARDROBE',
    label: 'Wardrobe Workspace',
    capabilities: ['browse', 'tag', 'assign', 'role_styling'],
    pipeline: 'WARDROBE' as const,
    status: 'SPEC_ONLY',
    existingUi: null,
  },
  {
    id: 'ENVIRONMENT_SET',
    label: 'Environment / Set Workspace',
    capabilities: ['categories', 'set_view', 'zone_mapping', 'signage_anchors', 'prop_mapping'],
    pipeline: 'ENVIRONMENT_SET' as const,
    status: 'SPEC_ONLY',
    existingUi: null,
  },
  {
    id: 'PERFORMANCE_SKIN',
    label: 'Performance Skin Workspace',
    capabilities: ['personality', 'movement', 'animation_style', 'expression_presets'],
    pipeline: 'MOTION' as const,
    status: 'SPEC_ONLY',
    existingUi: null,
  },
  {
    id: 'SCENE_ASSEMBLY',
    label: 'Scene Assembly Workspace',
    capabilities: ['narrative_picks', 'layer_packet', 'pre_generation_review'],
    pipeline: 'SCENE_ASSEMBLY' as const,
    status: 'SPEC_ONLY',
    existingUi: null,
  },
  {
    id: 'CLIENT_USAGE_BILLING',
    label: 'Client Usage / Billing',
    capabilities: ['monthly_allowance', 'add_ons', 'scope_visibility', 'shared_vs_private'],
    pipeline: 'MONETIZATION' as const,
    status: 'SPEC_ONLY',
    existingUi: null,
  },
  {
    id: 'ACTING_CATALOGUE_HOME',
    label: 'Acting Catalogue',
    capabilities: ['roster', 'creative_search', 'actor_profile'],
    pipeline: 'CASTING' as const,
    status: 'PARTIAL',
    existingUi: 'StudioWorldActingCataloguePanel',
  },
] as const;

export type StudioWorldWorkspaceModuleId = (typeof STUDIO_WORLD_WORKSPACE_MODULES)[number]['id'];
