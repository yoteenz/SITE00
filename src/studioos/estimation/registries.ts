import type {
  BuildLevel,
  FeatureId,
  ResponsiveMode,
  RiskFlagId,
  StructuralArchetypeId,
  VisualComplexity,
  VisualSystemId,
  WorldArchetypeId,
} from './types';

export type FeatureModifier = {
  modifierId: FeatureId;
  label: string;
  description: string;
  productionFu: number;
  /** Null until a published price card exists. Investment uses family units, not this field. */
  priceModifier: null;
  dependencyNotes: string;
  complexityEffect: 'RAISE';
  allowedBuildTypes: BuildLevel[];
};

const ALL: BuildLevel[] = ['SIMPLE', 'ADVANCED', 'CUSTOM'];
const DEEPER: BuildLevel[] = ['ADVANCED', 'CUSTOM'];

export const FEATURE_MODIFIERS: readonly FeatureModifier[] = [
  { modifierId: 'CUSTOM_INTERACTIONS', label: 'Custom interactions', description: 'Behavior that is not a standard component.', productionFu: 0.4, priceModifier: null, dependencyNotes: 'Depends on the parent authority.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'AUTH_ACCOUNT', label: 'Auth and account', description: 'Sign-in, account, and session.', productionFu: 0.6, priceModifier: null, dependencyNotes: 'Auth precedes any account family.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'ECOMMERCE', label: 'Commerce', description: 'Catalog, cart, and checkout flow.', productionFu: 1.2, priceModifier: null, dependencyNotes: 'Depends on payments and product data.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'PAYMENTS', label: 'Payments', description: 'Payment capture and receipts.', productionFu: 0.5, priceModifier: null, dependencyNotes: 'Provider approval can hold launch.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'DATABASE', label: 'Database', description: 'Persistent product data and contracts.', productionFu: 0.8, priceModifier: null, dependencyNotes: 'Database precedes dashboards.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'DASHBOARDS', label: 'Dashboards', description: 'Operational views over live data.', productionFu: 0.9, priceModifier: null, dependencyNotes: 'Depends on the data model.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'USER_ROLES', label: 'User roles', description: 'Permissions and role-specific surfaces.', productionFu: 0.6, priceModifier: null, dependencyNotes: 'Depends on auth.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'THIRD_PARTY_INTEGRATION', label: 'Third-party integration', description: 'An external system the product must speak to.', productionFu: 0.5, priceModifier: null, dependencyNotes: 'External approval is serial.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'GENERATED_ASSET_SYSTEM', label: 'Generated asset system', description: 'A repeatable image or asset pipeline.', productionFu: 0.8, priceModifier: null, dependencyNotes: 'Follows the visual system lock.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'ADVANCED_MOTION', label: 'Advanced motion', description: 'Motion that is part of the product, not a default transition.', productionFu: 0.4, priceModifier: null, dependencyNotes: 'Follows authority.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: '3D', label: '3D', description: 'Dimensional assets or a dimensional scene.', productionFu: 1.5, priceModifier: null, dependencyNotes: 'Asset load is serial with the world master.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'WORLD_SPATIAL', label: 'World spatial', description: 'Spatial navigation beyond a page site.', productionFu: 1.2, priceModifier: null, dependencyNotes: 'World master precedes zones.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'MULTILINGUAL', label: 'Multilingual', description: 'More than one language in the product.', productionFu: 0.5, priceModifier: null, dependencyNotes: 'Copy lock precedes translation.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'DATA_MIGRATION', label: 'Data migration', description: 'Moving an existing body of data in.', productionFu: 0.8, priceModifier: null, dependencyNotes: 'Source data must be known.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'COMPLEX_RESPONSIVE', label: 'Complex responsive', description: 'Layouts that are not a simple restack.', productionFu: 0.4, priceModifier: null, dependencyNotes: 'Follows the structural grammar.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'CUSTOM_SEARCH', label: 'Custom search', description: 'Search beyond a simple filter.', productionFu: 0.35, priceModifier: null, dependencyNotes: 'Depends on the data model.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'NOTIFICATIONS', label: 'Notifications', description: 'In-product alerts.', productionFu: 0.3, priceModifier: null, dependencyNotes: 'Depends on account when messages are personal.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'EMAIL_ENGINE', label: 'Email engine', description: 'Transactional or lifecycle email.', productionFu: 0.4, priceModifier: null, dependencyNotes: 'Copy and provider setup are serial.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'FILE_UPLOADS', label: 'File uploads', description: 'Client or operator file intake.', productionFu: 0.25, priceModifier: null, dependencyNotes: 'Depends on storage.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'DOCUMENT_MANAGEMENT', label: 'Document management', description: 'Documents as a product surface.', productionFu: 0.6, priceModifier: null, dependencyNotes: 'Depends on storage and permissions.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'REAL_TIME', label: 'Real time', description: 'Live updates across sessions.', productionFu: 0.7, priceModifier: null, dependencyNotes: 'Depends on the data contract.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'ANALYTICS', label: 'Analytics', description: 'Product measurement.', productionFu: 0.25, priceModifier: null, dependencyNotes: 'Can follow launch, but the hooks land in production.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'CMS', label: 'CMS', description: 'Operator-editable content.', productionFu: 0.5, priceModifier: null, dependencyNotes: 'Follows the content model.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'BOOKING', label: 'Booking', description: 'Reservations or appointments.', productionFu: 0.6, priceModifier: null, dependencyNotes: 'Depends on calendar rules and payments when money is taken.', complexityEffect: 'RAISE', allowedBuildTypes: ALL },
  { modifierId: 'MEMBERSHIP', label: 'Membership', description: 'Ongoing access tied to an account.', productionFu: 0.7, priceModifier: null, dependencyNotes: 'Depends on auth.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'COMMUNITY', label: 'Community', description: 'People interacting with each other in the product.', productionFu: 0.8, priceModifier: null, dependencyNotes: 'Depends on auth and moderation rules.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
  { modifierId: 'MARKETPLACE', label: 'Marketplace', description: 'Multiple parties exchanging through the product.', productionFu: 1.5, priceModifier: null, dependencyNotes: 'Depends on payments, roles, and trust rules.', complexityEffect: 'RAISE', allowedBuildTypes: ['CUSTOM'] },
  { modifierId: 'AI_ASSISTED_FEATURES', label: 'AI-assisted features', description: 'A model in the product path.', productionFu: 0.9, priceModifier: null, dependencyNotes: 'Provider capacity and review are serial.', complexityEffect: 'RAISE', allowedBuildTypes: DEEPER },
];

export const FEATURE_BY_ID: Record<FeatureId, FeatureModifier> = Object.fromEntries(
  FEATURE_MODIFIERS.map((item) => [item.modifierId, item]),
) as Record<FeatureId, FeatureModifier>;

export type StructuralArchetype = {
  id: StructuralArchetypeId;
  label: string;
  summary: string;
  typicalClass: 'LIGHT' | 'STANDARD' | 'ADVANCED' | 'SYSTEM';
  previewAsset: null;
  compatibleVisualSystems: VisualSystemId[];
};

export const STRUCTURAL_ARCHETYPES: readonly StructuralArchetype[] = [
  { id: 'EDITORIAL', label: 'Editorial', summary: 'A reading structure. Parent stories, supporting pages, a quiet system.', typicalClass: 'STANDARD', previewAsset: null, compatibleVisualSystems: ['EDITORIAL_OBJECT', 'CINEMATIC_LUXURY', 'POP_EDITORIAL'] },
  { id: 'GALLERY', label: 'Gallery', summary: 'Work presented as a sequence of rooms or plates.', typicalClass: 'STANDARD', previewAsset: null, compatibleVisualSystems: ['ARCHITECTURAL_MINIMAL', 'CINEMATIC_LUXURY', 'SOFT_ORGANIC'] },
  { id: 'COMMERCE', label: 'Commerce', summary: 'A place that sells. Catalog, product, and checkout are structural.', typicalClass: 'ADVANCED', previewAsset: null, compatibleVisualSystems: ['EDITORIAL_OBJECT', 'POP_EDITORIAL', 'CINEMATIC_LUXURY'] },
  { id: 'SERVICE', label: 'Service', summary: 'A practice. Offer, proof, and a way to begin.', typicalClass: 'LIGHT', previewAsset: null, compatibleVisualSystems: ['ARCHITECTURAL_MINIMAL', 'SOFT_ORGANIC', 'EDITORIAL_OBJECT'] },
  { id: 'PORTAL', label: 'Portal', summary: 'A signed-in system with jobs to do.', typicalClass: 'SYSTEM', previewAsset: null, compatibleVisualSystems: ['INDUSTRIAL_COMMAND', 'ARCHITECTURAL_MINIMAL'] },
  { id: 'HOSPITALITY', label: 'Hospitality', summary: 'A stay, a table, or a visit. Place and booking lead.', typicalClass: 'STANDARD', previewAsset: null, compatibleVisualSystems: ['SOFT_ORGANIC', 'CINEMATIC_LUXURY', 'ARCHITECTURAL_MINIMAL'] },
  { id: 'COMMUNITY', label: 'Community', summary: 'People return. Membership and shared surfaces lead.', typicalClass: 'ADVANCED', previewAsset: null, compatibleVisualSystems: ['SOFT_ORGANIC', 'POP_EDITORIAL', 'EDITORIAL_OBJECT'] },
  { id: 'HYBRID', label: 'Hybrid', summary: 'More than one grammar in one build.', typicalClass: 'ADVANCED', previewAsset: null, compatibleVisualSystems: ['EDITORIAL_OBJECT', 'ARCHITECTURAL_MINIMAL', 'CINEMATIC_LUXURY', 'SOFT_ORGANIC', 'INDUSTRIAL_COMMAND', 'POP_EDITORIAL'] },
];

export type WorldArchetype = {
  id: WorldArchetypeId;
  label: string;
  summary: string;
  baseFu: number;
  calibrationNeeded: true;
  previewAsset: null;
};

export const WORLD_ARCHETYPES: readonly WorldArchetype[] = [
  { id: 'ESTATE', label: 'Estate', summary: 'A held ground with a few distinct places.', baseFu: 3.2, calibrationNeeded: true, previewAsset: null },
  { id: 'PROMENADE', label: 'Promenade', summary: 'A linear visit. Movement is the structure.', baseFu: 3, calibrationNeeded: true, previewAsset: null },
  { id: 'HUB', label: 'Hub', summary: 'A center with spokes.', baseFu: 3.4, calibrationNeeded: true, previewAsset: null },
  { id: 'DISTRICT', label: 'District', summary: 'Several neighborhoods in one world.', baseFu: 3.8, calibrationNeeded: true, previewAsset: null },
  { id: 'SANCTUARY', label: 'Sanctuary', summary: 'A quiet, enclosed world.', baseFu: 3.2, calibrationNeeded: true, previewAsset: null },
  { id: 'SHOWROOM', label: 'Showroom', summary: 'Objects presented in space.', baseFu: 3, calibrationNeeded: true, previewAsset: null },
  { id: 'SOCIAL', label: 'Social', summary: 'Presence of other people is part of the place.', baseFu: 3.6, calibrationNeeded: true, previewAsset: null },
  { id: 'STORY', label: 'Story', summary: 'The world is sequenced.', baseFu: 3.3, calibrationNeeded: true, previewAsset: null },
  { id: 'HYBRID_WORLD', label: 'Hybrid world', summary: 'More than one world grammar.', baseFu: 4.2, calibrationNeeded: true, previewAsset: null },
];

export const WORLD_BY_ID: Record<WorldArchetypeId, WorldArchetype> = Object.fromEntries(
  WORLD_ARCHETYPES.map((item) => [item.id, item]),
) as Record<WorldArchetypeId, WorldArchetype>;

export type VisualSystemRecord = {
  id: VisualSystemId;
  label: string;
  summary: string;
  complexity: VisualComplexity;
  complexityWeight: number;
  previewAsset: null;
  mobilePreview: null;
  desktopPreview: null;
  worldPreview: null;
  visualTags: string[];
  moodTags: string[];
  compatibleArchetypes: StructuralArchetypeId[];
  brandTraits: string[];
};

export const VISUAL_SYSTEMS: readonly VisualSystemRecord[] = [
  { id: 'EDITORIAL_OBJECT', label: 'Editorial object', summary: 'Type-led pages with a few physical objects.', complexity: 'BESPOKE_EDITORIAL', complexityWeight: 0.18, previewAsset: null, mobilePreview: null, desktopPreview: null, worldPreview: null, visualTags: ['type', 'object'], moodTags: ['measured'], compatibleArchetypes: ['EDITORIAL', 'COMMERCE', 'SERVICE', 'HYBRID'], brandTraits: ['editorial'] },
  { id: 'ARCHITECTURAL_MINIMAL', label: 'Architectural minimal', summary: 'Structure, light, and very little ornament.', complexity: 'CUSTOMIZED_TEMPLATE', complexityWeight: 0.08, previewAsset: null, mobilePreview: null, desktopPreview: null, worldPreview: null, visualTags: ['architecture'], moodTags: ['quiet'], compatibleArchetypes: ['GALLERY', 'SERVICE', 'HOSPITALITY', 'PORTAL'], brandTraits: ['minimal'] },
  { id: 'CINEMATIC_LUXURY', label: 'Cinematic luxury', summary: 'Wide frames, slow reveals, a controlled palette.', complexity: 'CINEMATIC', complexityWeight: 0.28, previewAsset: null, mobilePreview: null, desktopPreview: null, worldPreview: null, visualTags: ['cinematic'], moodTags: ['luxurious'], compatibleArchetypes: ['EDITORIAL', 'GALLERY', 'HOSPITALITY', 'COMMERCE'], brandTraits: ['cinematic'] },
  { id: 'SOFT_ORGANIC', label: 'Soft organic', summary: 'Material, plant, and warmth.', complexity: 'CUSTOMIZED_TEMPLATE', complexityWeight: 0.08, previewAsset: null, mobilePreview: null, desktopPreview: null, worldPreview: null, visualTags: ['organic'], moodTags: ['warm'], compatibleArchetypes: ['SERVICE', 'HOSPITALITY', 'COMMUNITY'], brandTraits: ['organic'] },
  { id: 'INDUSTRIAL_COMMAND', label: 'Industrial command', summary: 'A working system. Dense, legible, operational.', complexity: 'BESPOKE_EDITORIAL', complexityWeight: 0.18, previewAsset: null, mobilePreview: null, desktopPreview: null, worldPreview: null, visualTags: ['system'], moodTags: ['precise'], compatibleArchetypes: ['PORTAL', 'HYBRID'], brandTraits: ['operational'] },
  { id: 'POP_EDITORIAL', label: 'Pop editorial', summary: 'Editorial structure with a louder graphic voice.', complexity: 'BESPOKE_EDITORIAL', complexityWeight: 0.18, previewAsset: null, mobilePreview: null, desktopPreview: null, worldPreview: null, visualTags: ['graphic'], moodTags: ['bright'], compatibleArchetypes: ['EDITORIAL', 'COMMERCE', 'COMMUNITY'], brandTraits: ['graphic'] },
];

export const VISUAL_SYSTEM_BY_ID: Record<VisualSystemId, VisualSystemRecord> = Object.fromEntries(
  VISUAL_SYSTEMS.map((item) => [item.id, item]),
) as Record<VisualSystemId, VisualSystemRecord>;

export const RESPONSIVE_MODES: readonly { id: ResponsiveMode; label: string; summary: string }[] = [
  { id: 'MOBILE_ONLY', label: 'Mobile only', summary: 'One viewport. Phone is the product.' },
  { id: 'MOBILE_DESKTOP', label: 'Mobile and desktop', summary: 'Two viewports. Tablet follows the nearer one.' },
  { id: 'MOBILE_TABLET_DESKTOP', label: 'Mobile, tablet, and desktop', summary: 'Three considered viewports.' },
  { id: 'MULTI_VIEWPORT_ADVANCED', label: 'Advanced multi-viewport', summary: 'Layouts that change role by viewport, not only scale.' },
  { id: 'SPATIAL_RESPONSIVE', label: 'Spatial responsive', summary: 'The world itself changes with the viewport or the room.' },
];

export const VISUAL_COMPLEXITY_LEVELS: readonly { id: VisualComplexity; label: string; summary: string }[] = [
  { id: 'TEMPLATE_LED', label: 'Template led', summary: 'An approved system used closely.' },
  { id: 'CUSTOMIZED_TEMPLATE', label: 'Customized template', summary: 'An approved system with real composition changes.' },
  { id: 'BESPOKE_EDITORIAL', label: 'Bespoke editorial', summary: 'The page grammar is designed for this project.' },
  { id: 'CINEMATIC', label: 'Cinematic', summary: 'Frame, motion, and sequence carry the product.' },
  { id: 'GENERATIVE_ASSET_HEAVY', label: 'Generative asset heavy', summary: 'Many original generated assets, with QA on each.' },
  { id: 'SPATIAL_WORLD', label: 'Spatial world', summary: 'The visual system is a place.' },
];

export const RISK_FLAGS: readonly { id: RiskFlagId; label: string; note: string }[] = [
  { id: 'CLIENT_CONTENT_PENDING', label: 'Client content pending', note: 'Copy or assets are not in hand.' },
  { id: 'BRAND_NOT_FINAL', label: 'Brand not final', note: 'Visual system can still move.' },
  { id: 'THIRD_PARTY_APPROVAL', label: 'Third-party approval', note: 'An outside party can hold a phase.' },
  { id: 'MIGRATION_COMPLEXITY', label: 'Migration complexity', note: 'Incoming data is not fully known.' },
  { id: 'UNKNOWN_DATA_MODEL', label: 'Unknown data model', note: 'The objects the product stores are not settled.' },
  { id: 'CUSTOM_INTEGRATION', label: 'Custom integration', note: 'The other system is not a known adapter.' },
  { id: 'HEAVY_GENERATIVE_ASSETS', label: 'Heavy generative assets', note: 'Asset production can dominate the schedule.' },
  { id: 'WORLD_COMPLEXITY', label: 'World complexity', note: 'Spatial scope is still being calibrated.' },
  { id: 'MULTI_ROLE_PERMISSIONS', label: 'Multi-role permissions', note: 'Several actors see different products.' },
  { id: 'REGULATED_WORKFLOW', label: 'Regulated workflow', note: 'Compliance review is part of the path.' },
  { id: 'LARGE_DESCENDANT_TREE', label: 'Large descendant tree', note: 'A family is past the closed modifier bands.' },
];

export const REFERENCE_BANDS: readonly { id: string; label: string; window: string; match: string }[] = [
  { id: 'SIMPLE_TEMPLATE_SITE', label: 'Simple template-led site', window: '6–10 weeks', match: 'SIMPLE_SITE' },
  { id: 'STANDARD_CUSTOM_SITE', label: 'Standard custom site', window: '12–18 weeks', match: 'STANDARD_SITE' },
  { id: 'ADVANCED_LOCATION', label: 'Advanced digital location', window: '4–6 months', match: 'ADVANCED_SITE' },
  { id: 'LARGE_PORTAL', label: 'Large product or portal', window: '5–8 months', match: 'LARGE_PRODUCT' },
  { id: 'WORLD', label: 'World or spatial experience', window: '6–12+ months', match: 'WORLD' },
  { id: 'SITE_WORLD_SYSTEMS', label: 'Site, world, and systems', window: '9–18+ months', match: 'HYBRID' },
];
