import type { FamilyInput, ProjectEstimateConfig } from './types';

function family(id: string, label: string, familyClass: FamilyInput['familyClass'], descendantCount: number): FamilyInput {
  return { id, label, familyClass, descendantCount };
}

function base(partial: Partial<ProjectEstimateConfig> & Pick<ProjectEstimateConfig, 'projectType' | 'buildLevel' | 'families'>): ProjectEstimateConfig {
  return {
    structuralArchetype: null,
    visualSystemId: null,
    visualComplexity: 'TEMPLATE_LED',
    systems: [],
    featureIds: [],
    responsiveMode: 'MOBILE_DESKTOP',
    worldScopes: [],
    identityScope: 'NONE',
    deliveryMode: 'STANDARD',
    reviewRounds: 2,
    clientReviewSlaDays: 2,
    confidenceLevel: 'BLUEPRINT',
    documentKind: 'ESTIMATE',
    riskFlags: [],
    manualModifiers: [],
    ...partial,
  };
}

/** Small service site. Three light families. */
export const FIXTURE_SIMPLE_SERVICE: ProjectEstimateConfig = base({
  projectType: 'SITE',
  buildLevel: 'SIMPLE',
  structuralArchetype: 'SERVICE',
  visualSystemId: 'ARCHITECTURAL_MINIMAL',
  visualComplexity: 'CUSTOMIZED_TEMPLATE',
  responsiveMode: 'MOBILE_DESKTOP',
  families: [
    family('offer', 'Offer', 'LIGHT', 3),
    family('proof', 'Proof', 'LIGHT', 2),
    family('visit', 'Visit', 'LIGHT', 2),
  ],
});

/** Editorial site with a bespoke visual system. */
export const FIXTURE_STANDARD_EDITORIAL: ProjectEstimateConfig = base({
  projectType: 'SITE',
  buildLevel: 'ADVANCED',
  structuralArchetype: 'EDITORIAL',
  visualSystemId: 'EDITORIAL_OBJECT',
  visualComplexity: 'BESPOKE_EDITORIAL',
  responsiveMode: 'MOBILE_TABLET_DESKTOP',
  featureIds: ['CMS'],
  families: [
    family('index', 'Index', 'LIGHT', 4),
    family('essay', 'Essay', 'STANDARD', 8),
    family('archive', 'Archive', 'STANDARD', 8),
    family('issue', 'Issue', 'STANDARD', 6),
    family('about', 'About', 'LIGHT', 3),
    family('journal', 'Journal', 'STANDARD', 7),
  ],
});

/** Commerce site with payments. */
export const FIXTURE_ADVANCED_COMMERCE: ProjectEstimateConfig = base({
  projectType: 'SITE',
  buildLevel: 'CUSTOM',
  structuralArchetype: 'COMMERCE',
  visualSystemId: 'CINEMATIC_LUXURY',
  visualComplexity: 'CINEMATIC',
  responsiveMode: 'MOBILE_TABLET_DESKTOP',
  featureIds: ['ECOMMERCE', 'PAYMENTS', 'AUTH_ACCOUNT'],
  families: [
    family('shop', 'Shop', 'STANDARD', 8),
    family('product', 'Product', 'ADVANCED', 14),
    family('bag', 'Bag', 'STANDARD', 6),
    family('account', 'Account', 'ADVANCED', 12),
    family('story', 'Story', 'STANDARD', 5),
    family('care', 'Care', 'ADVANCED', 11),
  ],
});

/** Sixteen mixed families. The large-product analogue. */
export const FIXTURE_LARGE_PRODUCT: ProjectEstimateConfig = base({
  projectType: 'SITE',
  buildLevel: 'CUSTOM',
  structuralArchetype: 'HYBRID',
  visualSystemId: 'EDITORIAL_OBJECT',
  visualComplexity: 'CUSTOMIZED_TEMPLATE',
  responsiveMode: 'MOBILE_DESKTOP',
  featureIds: ['AUTH_ACCOUNT', 'DATABASE'],
  confidenceLevel: 'BLUEPRINT',
  families: [
    family('f01', 'Entry', 'LIGHT', 3),
    family('f02', 'Home', 'LIGHT', 4),
    family('f03', 'Today', 'LIGHT', 5),
    family('f04', 'Activity', 'LIGHT', 4),
    family('f05', 'Notes', 'LIGHT', 3),
    family('f06', 'Search', 'LIGHT', 2),
    family('f07', 'Profile', 'LIGHT', 4),
    family('f08', 'Settings', 'LIGHT', 5),
    family('f09', 'Ledger', 'STANDARD', 8),
    family('f10', 'Plan', 'STANDARD', 8),
    family('f11', 'Money', 'STANDARD', 7),
    family('f12', 'Credit', 'STANDARD', 9),
    family('f13', 'Ask', 'STANDARD', 6),
    family('f14', 'Check', 'ADVANCED', 12),
    family('f15', 'Outcomes', 'ADVANCED', 14),
    family('f16', 'Account', 'ADVANCED', 16),
  ],
});

/** System-heavy portal analogue. */
export const FIXTURE_PORTAL_SYSTEM: ProjectEstimateConfig = base({
  projectType: 'SYSTEM',
  buildLevel: 'CUSTOM',
  structuralArchetype: 'PORTAL',
  visualSystemId: 'INDUSTRIAL_COMMAND',
  visualComplexity: 'BESPOKE_EDITORIAL',
  responsiveMode: 'MOBILE_TABLET_DESKTOP',
  featureIds: ['AUTH_ACCOUNT', 'DATABASE', 'DASHBOARDS', 'USER_ROLES', 'NOTIFICATIONS', 'REAL_TIME', 'DOCUMENT_MANAGEMENT'],
  systems: ['billing', 'audit'],
  families: [
    family('ops', 'Operations', 'SYSTEM', 12),
    family('roles', 'Roles', 'SYSTEM', 8),
    family('work', 'Workflow', 'SYSTEM', 18),
    family('files', 'Files', 'SYSTEM', 10),
    family('reports', 'Reports', 'SYSTEM', 14),
    family('admin', 'Admin', 'SYSTEM', 11),
  ],
});

/** Spatial world analogue. No page-count logic. */
export const FIXTURE_SPATIAL_WORLD: ProjectEstimateConfig = base({
  projectType: 'WORLD',
  buildLevel: 'CUSTOM',
  structuralArchetype: null,
  visualSystemId: null,
  visualComplexity: 'SPATIAL_WORLD',
  responsiveMode: 'SPATIAL_RESPONSIVE',
  featureIds: ['WORLD_SPATIAL', '3D'],
  families: [],
  worldScopes: [
    {
      archetypeId: 'HYBRID_WORLD',
      zoneCount: 14,
      sceneCount: 24,
      interactionCount: 30,
      inhabitantComplexity: 'HEAVY',
      stateCount: 10,
      threeDAssetLoad: 'HEAVY',
      navigationComplexity: 'ADVANCED',
    },
  ],
});

export const FIXTURE_ZERO_FAMILIES: ProjectEstimateConfig = base({
  projectType: 'SITE',
  buildLevel: 'SIMPLE',
  structuralArchetype: 'SERVICE',
  families: [],
  confidenceLevel: 'EARLY',
});

export const FIXTURES = {
  SIMPLE_SERVICE: FIXTURE_SIMPLE_SERVICE,
  STANDARD_EDITORIAL: FIXTURE_STANDARD_EDITORIAL,
  ADVANCED_COMMERCE: FIXTURE_ADVANCED_COMMERCE,
  LARGE_PRODUCT: FIXTURE_LARGE_PRODUCT,
  PORTAL_SYSTEM: FIXTURE_PORTAL_SYSTEM,
  SPATIAL_WORLD: FIXTURE_SPATIAL_WORLD,
  ZERO_FAMILIES: FIXTURE_ZERO_FAMILIES,
} as const;
