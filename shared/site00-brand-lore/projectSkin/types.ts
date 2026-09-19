/**
 * Master Skin System — field classification, experience grammars, project binding.
 * Field ≠ skin. Host shell ≠ module expression.
 */

export const MASTER_SKIN_LINEAGE = 'MASTER_SKIN' as const;

export const FIELD_INDUSTRY_TAGS = [
  'HEALTH',
  'MEDICAL',
  'WELLNESS',
  'BEAUTY',
  'HAIR',
  'FASHION',
  'FINANCE',
  'LEGAL',
  'HOSPITALITY',
  'REAL_ESTATE',
  'CREATIVE',
  'MEDIA',
  'TECH',
  'EDUCATION',
  'LOGISTICS',
  'AUTOMOTIVE',
  'RETAIL',
  'FOOD_BEVERAGE',
  'NONPROFIT',
  'PROFESSIONAL_SERVICES',
  'OTHER',
] as const;
export type FieldIndustryTag = (typeof FIELD_INDUSTRY_TAGS)[number];

export const MASTER_SKIN_FAMILIES = [
  'EDITORIAL',
  'CLINICAL',
  'LUXURY',
  'ARCHIVAL',
  'TECHNICAL',
  'HOSPITALITY',
  'RETAIL',
  'CULTURAL',
  'INSTITUTIONAL',
  'PLAYFUL',
  'MINIMAL',
  'CINEMATIC',
  'SOFT_LUXURY',
  'INDUSTRIAL',
  'DATA_DRIVEN',
] as const;
export type MasterSkinFamily = (typeof MASTER_SKIN_FAMILIES)[number];

export const EXPRESSION_PROFILE_TAGS = [
  'CALM',
  'PRECISE',
  'HUMAN',
  'TRUSTED',
  'EDUCATIONAL',
  'ASPIRATIONAL',
  'INVESTIGATIVE',
  'DENSE',
  'EDITORIAL',
  'CINEMATIC',
  'ARCHIVAL',
  'POLISHED',
  'SOFT',
  'LUXURY',
  'TECHNICAL',
  'FAST',
  'WARM',
  'INSTITUTIONAL',
  'PLAYFUL',
  'OPERATIONAL',
  'DIRECT',
  'EFFICIENT',
] as const;
export type ExpressionProfileTag = (typeof EXPRESSION_PROFILE_TAGS)[number];

export type ExpressionProfile = {
  profileId: string;
  density: 'LOW' | 'MEDIUM' | 'HIGH';
  formality: 'CASUAL' | 'PROFESSIONAL' | 'FORMAL';
  energy: 'CALM' | 'MODERATE' | 'DYNAMIC';
  warmth: 'COOL' | 'NEUTRAL' | 'WARM';
  visualWeight: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  imageLedVsDataLed: 'IMAGE_LED' | 'BALANCED' | 'DATA_LED';
  editorialVsOperational: 'EDITORIAL' | 'BALANCED' | 'OPERATIONAL';
  softVsSharp: 'SOFT' | 'BALANCED' | 'SHARP';
  tags: ExpressionProfileTag[];
};

export type ProjectBrandPalette = {
  primaryColor: string;
  secondaryColor?: string | null;
  neutralPalette?: string[];
  successColor?: string | null;
  warningColor?: string | null;
};

export type MasterSkinTokens = {
  density: 'LOW' | 'MEDIUM' | 'HIGH';
  surfaceRadius: number;
  borderWeight: number;
  surfaceElevation: 'FLAT' | 'SOFT' | 'RAISED';
  contentMaxWidth: number;
  sectionSpacing: number;
  cardSpacing: number;
  imageRadius: number;
  imageTreatment: SkinImageTreatment['mode'];
  statusShape: 'PILL' | 'SQUARE' | 'DOT';
  buttonShape: 'PILL' | 'SQUARE' | 'SOFT';
  panelTreatment: SkinSurfaceSystem['mode'];
  decorativeLineSystem: 'NONE' | 'HAIRLINE' | 'EDITORIAL_RULE' | 'TECH_GRID';
  iconWeight: 'LIGHT' | 'REGULAR' | 'BOLD';
  motionSpeed: 'SLOW' | 'MEDIUM' | 'FAST';
  motionCharacter: SkinMotionProfile['character'];
  accentCoverage: 'MINIMAL' | 'MODERATE' | 'BOLD';
};

export type SkinCompositionGrammar = {
  mode: 'EDITORIAL' | 'CLINICAL' | 'LUXURY' | 'TECHNICAL' | 'CULTURAL' | 'INSTITUTIONAL';
  splitLayouts: boolean;
  headlineLedHierarchy: boolean;
  structuredGrids: boolean;
  diagnosticCues: boolean;
  timelineBehavior: boolean;
  operationalGrids: boolean;
  archivalFraming: boolean;
  cinematicInterruptions: boolean;
};

export type SkinSurfaceSystem = {
  mode: 'FLAT' | 'SOFT_CARD' | 'GLASS' | 'EDITORIAL_PAPER' | 'CLINICAL_PANEL' | 'TECHNICAL_GRID' | 'PREMIUM_IMAGE_LED' | 'ARCHIVAL_FRAME';
};

export type SkinImageTreatment = {
  mode: 'FULL_BLEED' | 'CONTAINED_EDITORIAL' | 'CLINICAL_CLEAN' | 'ARCHIVAL_CROP' | 'CINEMATIC' | 'SOFT_LUXURY' | 'TECHNICAL_DIAGRAM' | 'MINIMAL_PRODUCT';
};

export type SkinIconSystem = {
  outlineVsSolid: 'OUTLINE' | 'SOLID' | 'MIXED';
  weight: 'LIGHT' | 'REGULAR' | 'BOLD';
  rounding: 'SHARP' | 'SOFT' | 'ROUND';
  decorativeUse: boolean;
};

export type SkinMotionProfile = {
  character: 'CALM' | 'EDITORIAL' | 'TECHNICAL' | 'CINEMATIC';
  fadeDurationMs: number;
  expansionEasing: string;
};

export type MasterSkinModuleVariant = {
  masterSkinId: string;
  moduleId: string;
  layoutGrammar: string;
  density: MasterSkinTokens['density'];
  panelSystem: string;
  cardSystem: string;
  imageTreatment: SkinImageTreatment['mode'];
  accentBehavior: string;
  decorativeSystem: string;
  motionBehavior: string;
  iconBehavior: string;
  statusBehavior: string;
  surfaceTreatment: SkinSurfaceSystem['mode'];
  contentHierarchy: string;
  allowedOverrides: string[];
};

export type MasterSkin = {
  id: string;
  name: string;
  skinFamily: MasterSkinFamily;
  description: string;
  supportedFields: FieldIndustryTag[];
  expressionTags: ExpressionProfileTag[];
  densityProfile: MasterSkinTokens['density'];
  compositionGrammar: SkinCompositionGrammar;
  surfaceSystem: SkinSurfaceSystem;
  imageTreatment: SkinImageTreatment;
  iconSystem: SkinIconSystem;
  motionProfile: SkinMotionProfile;
  typographyBehavior: string;
  accentBehavior: string;
  spacingSystem: string;
  tokens: MasterSkinTokens;
  moduleVariants: MasterSkinModuleVariant[];
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  version: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectSkinOverride = {
  overrideId: string;
  projectId: string;
  moduleId?: string | null;
  panelDensity?: MasterSkinTokens['density'];
  heroTreatment?: string;
  imageRadius?: number;
  motionIntensity?: SkinMotionProfile['character'];
  accentCoverage?: MasterSkinTokens['accentCoverage'];
};

export type ProjectExperienceSkin = {
  projectId: string;
  /** Brand family skin (canonical when set). */
  brandFamilySkinId?: string | null;
  masterSkinId: string;
  activeSkinVersion: string;
  fieldTags: FieldIndustryTag[];
  expressionProfileId: string;
  expressionProfile: ExpressionProfile;
  primaryColor: string;
  secondaryColor?: string | null;
  brandPalette: ProjectBrandPalette;
  moduleVariants: Record<string, string>;
  brandOverrides: ProjectSkinOverride[];
  selectedAtOnboarding: boolean;
  selectedBy: string | null;
  founderApproved: boolean;
  recommendedBySystem: boolean;
  recommendedSkinId: string | null;
  recommendationConfidence: number;
  recommendationSource: 'IDENTITY' | 'FIELD' | 'MANUAL' | 'MIGRATION';
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SkinPreviewMode = {
  previewId: string;
  projectId: string;
  candidateSkinId: string;
  candidateVersion: string;
  modules: string[];
  status: 'DRAFT' | 'ACTIVE' | 'DISCARDED';
};

export type ProjectSkinMigration = {
  migrationId: string;
  projectId: string;
  fromSkinId: string;
  fromVersion: string;
  toSkinId: string;
  toVersion: string;
  previewAvailable: boolean;
  approved: boolean;
  rolledBack: boolean;
  createdAt: string;
};

export type MasterSkinRecommendation = {
  skinId: string;
  skinName: string;
  confidence: number;
  reasoningSummary: string;
  matchedFields: FieldIndustryTag[];
  matchedExpressionTags: ExpressionProfileTag[];
};

export type MasterSkinRecommendationResult = {
  rankedSkins: MasterSkinRecommendation[];
  confidence: number;
  reasoningSummary: string;
  recommendedSkinId: string;
};

export const HOST_FIREWALL_PROTECTED = [
  'GLOBAL_SITE00_NAV',
  'PROJECT_SHELL_LOGIC',
  'MODULE_SWITCHER',
  'AUTH',
  'VIEW_MODE',
  'PERMISSION_MODEL',
  'ROUTING_SEMANTICS',
  'MODULE_ENTITLEMENTS',
  'CLIENT_FIREWALL',
] as const;

export type HostExpressionBoundary = {
  hostControls: readonly string[];
  skinControls: readonly string[];
};

export const MASTER_SKIN_FAILURE_CODES = [
  'MASTER_SKIN_MISSING',
  'MASTER_SKIN_FIELD_OVERFITTING',
  'MASTER_SKIN_COLOR_ONLY_VARIATION',
  'MASTER_SKIN_HOST_FIREWALL_BREACH',
  'MASTER_SKIN_MODULE_VARIANT_MISSING',
  'MASTER_SKIN_EXPRESSION_PROFILE_MISSING',
  'MASTER_SKIN_RECOMMENDATION_UNGROUNDED',
  'MASTER_SKIN_CLIENT_CONFIG_LEAK',
  'MASTER_SKIN_VERSION_MISSING',
  'MASTER_SKIN_MIGRATION_UNSAFE',
  'MASTER_SKIN_TEMPLATE_DRIFT',
] as const;
export type MasterSkinFailureCode = (typeof MASTER_SKIN_FAILURE_CODES)[number];
