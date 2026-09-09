/**
 * MasterSkinCatalog — experience grammars (not color-only templates).
 */

import { MASTER_SKIN_CATALOG_IDS } from './constants.js';
import type {
  MasterSkin,
  MasterSkinModuleVariant,
  MasterSkinTokens,
  SkinCompositionGrammar,
  SkinIconSystem,
  SkinImageTreatment,
  SkinMotionProfile,
  SkinSurfaceSystem,
} from './types.js';

const now = () => new Date().toISOString();

function moduleVariants(
  masterSkinId: string,
  base: Partial<MasterSkinModuleVariant>,
): MasterSkinModuleVariant[] {
  const modules = ['IDENTITY', 'BUILDER', 'EVOLVE', 'PRODUCTION', 'REVIEWS', 'LIBRARY'];
  return modules.map((moduleId) => ({
    masterSkinId,
    moduleId,
    layoutGrammar: base.layoutGrammar ?? 'STANDARD',
    density: base.density ?? 'MEDIUM',
    panelSystem: base.panelSystem ?? 'CARD',
    cardSystem: base.cardSystem ?? 'STANDARD',
    imageTreatment: base.imageTreatment ?? 'CONTAINED_EDITORIAL',
    accentBehavior: base.accentBehavior ?? 'MODERATE',
    decorativeSystem: base.decorativeSystem ?? 'MINIMAL',
    motionBehavior: base.motionBehavior ?? 'CALM',
    iconBehavior: base.iconBehavior ?? 'OUTLINE',
    statusBehavior: base.statusBehavior ?? 'PILL',
    surfaceTreatment: base.surfaceTreatment ?? 'SOFT_CARD',
    contentHierarchy: base.contentHierarchy ?? 'SECTION_LED',
    allowedOverrides: base.allowedOverrides ?? ['panelDensity', 'accentCoverage'],
  }));
}

function skinBase(input: {
  id: string;
  name: string;
  skinFamily: MasterSkin['skinFamily'];
  description: string;
  supportedFields: MasterSkin['supportedFields'];
  expressionTags: MasterSkin['expressionTags'];
  tokens: MasterSkinTokens;
  compositionGrammar: SkinCompositionGrammar;
  surfaceSystem: SkinSurfaceSystem;
  imageTreatment: SkinImageTreatment;
  iconSystem: SkinIconSystem;
  motionProfile: SkinMotionProfile;
  moduleVariantBase: Partial<MasterSkinModuleVariant>;
}): MasterSkin {
  return {
    id: input.id,
    name: input.name,
    skinFamily: input.skinFamily,
    description: input.description,
    supportedFields: input.supportedFields,
    expressionTags: input.expressionTags,
    densityProfile: input.tokens.density,
    compositionGrammar: input.compositionGrammar,
    surfaceSystem: input.surfaceSystem,
    imageTreatment: input.imageTreatment,
    iconSystem: input.iconSystem,
    motionProfile: input.motionProfile,
    typographyBehavior: 'PROJECT_EXPRESSION_TYPOGRAPHY',
    accentBehavior: 'PROJECT_PRIMARY_WHERE_APPROPRIATE',
    spacingSystem: 'SKIN_RHYTHM',
    tokens: input.tokens,
    moduleVariants: moduleVariants(input.id, input.moduleVariantBase),
    status: 'ACTIVE',
    version: '1.0',
    createdAt: now(),
    updatedAt: now(),
  };
}

export const CULTURAL_EDITORIAL_SKIN: MasterSkin = skinBase({
  id: MASTER_SKIN_CATALOG_IDS.CULTURAL_EDITORIAL,
  name: 'Cultural Editorial',
  skinFamily: 'CULTURAL',
  description: 'Investigative newsroom grammar — layered evidence, editorial framing, cinematic interruptions.',
  supportedFields: ['CREATIVE', 'MEDIA'],
  expressionTags: ['INVESTIGATIVE', 'DENSE', 'EDITORIAL', 'CINEMATIC', 'ARCHIVAL'],
  tokens: {
    density: 'HIGH',
    surfaceRadius: 4,
    borderWeight: 1,
    surfaceElevation: 'SOFT',
    contentMaxWidth: 1120,
    sectionSpacing: 28,
    cardSpacing: 12,
    imageRadius: 2,
    imageTreatment: 'CINEMATIC',
    statusShape: 'SQUARE',
    buttonShape: 'SQUARE',
    panelTreatment: 'EDITORIAL_PAPER',
    decorativeLineSystem: 'EDITORIAL_RULE',
    iconWeight: 'REGULAR',
    motionSpeed: 'MEDIUM',
    motionCharacter: 'CINEMATIC',
    accentCoverage: 'MODERATE',
  },
  compositionGrammar: {
    mode: 'CULTURAL',
    splitLayouts: true,
    headlineLedHierarchy: true,
    structuredGrids: false,
    diagnosticCues: false,
    timelineBehavior: true,
    operationalGrids: false,
    archivalFraming: true,
    cinematicInterruptions: true,
  },
  surfaceSystem: { mode: 'EDITORIAL_PAPER' },
  imageTreatment: { mode: 'CINEMATIC' },
  iconSystem: { outlineVsSolid: 'OUTLINE', weight: 'REGULAR', rounding: 'SHARP', decorativeUse: true },
  motionProfile: { character: 'CINEMATIC', fadeDurationMs: 420, expansionEasing: 'ease-out' },
  moduleVariantBase: {
    layoutGrammar: 'SPLIT_EDITORIAL',
    density: 'HIGH',
    panelSystem: 'EVIDENCE_PANEL',
    cardSystem: 'ANNOTATED_MEDIA',
    imageTreatment: 'CINEMATIC',
    decorativeSystem: 'ARCHIVAL_MARGIN',
    contentHierarchy: 'HEADLINE_EVIDENCE',
  },
});

export const CLINICAL_EDITORIAL_SKIN: MasterSkin = skinBase({
  id: MASTER_SKIN_CATALOG_IDS.CLINICAL_EDITORIAL,
  name: 'Clinical Editorial',
  skinFamily: 'CLINICAL',
  description: 'High-trust health grammar — calm whitespace, structured grids, human editorial clarity.',
  supportedFields: ['HEALTH', 'MEDICAL', 'WELLNESS', 'PROFESSIONAL_SERVICES'],
  expressionTags: ['CALM', 'PRECISE', 'HUMAN', 'TRUSTED', 'EDUCATIONAL'],
  tokens: {
    density: 'MEDIUM',
    surfaceRadius: 12,
    borderWeight: 1,
    surfaceElevation: 'FLAT',
    contentMaxWidth: 960,
    sectionSpacing: 32,
    cardSpacing: 16,
    imageRadius: 12,
    imageTreatment: 'CLINICAL_CLEAN',
    statusShape: 'PILL',
    buttonShape: 'SOFT',
    panelTreatment: 'CLINICAL_PANEL',
    decorativeLineSystem: 'HAIRLINE',
    iconWeight: 'LIGHT',
    motionSpeed: 'SLOW',
    motionCharacter: 'CALM',
    accentCoverage: 'MINIMAL',
  },
  compositionGrammar: {
    mode: 'CLINICAL',
    splitLayouts: false,
    headlineLedHierarchy: true,
    structuredGrids: true,
    diagnosticCues: true,
    timelineBehavior: false,
    operationalGrids: false,
    archivalFraming: false,
    cinematicInterruptions: false,
  },
  surfaceSystem: { mode: 'CLINICAL_PANEL' },
  imageTreatment: { mode: 'CLINICAL_CLEAN' },
  iconSystem: { outlineVsSolid: 'OUTLINE', weight: 'LIGHT', rounding: 'SOFT', decorativeUse: false },
  motionProfile: { character: 'CALM', fadeDurationMs: 280, expansionEasing: 'ease-in-out' },
  moduleVariantBase: {
    layoutGrammar: 'STRUCTURED_GRID',
    density: 'MEDIUM',
    panelSystem: 'DIAGNOSTIC_SECTION',
    cardSystem: 'TRUST_CARD',
    imageTreatment: 'CLINICAL_CLEAN',
    decorativeSystem: 'NONE',
    contentHierarchy: 'SECTION_DIAGNOSTIC',
  },
});

export const TECHNICAL_OPERATIONS_SKIN: MasterSkin = skinBase({
  id: MASTER_SKIN_CATALOG_IDS.TECHNICAL_OPERATIONS,
  name: 'Technical Operations',
  skinFamily: 'TECHNICAL',
  description: 'Operational systems grammar — dense status panels, direct hierarchy, technical grids.',
  supportedFields: ['LOGISTICS', 'PROFESSIONAL_SERVICES', 'TECH'],
  expressionTags: ['TECHNICAL', 'OPERATIONAL', 'DIRECT', 'EFFICIENT', 'TRUSTED'],
  tokens: {
    density: 'HIGH',
    surfaceRadius: 6,
    borderWeight: 1,
    surfaceElevation: 'RAISED',
    contentMaxWidth: 1280,
    sectionSpacing: 16,
    cardSpacing: 8,
    imageRadius: 4,
    imageTreatment: 'TECHNICAL_DIAGRAM',
    statusShape: 'DOT',
    buttonShape: 'SQUARE',
    panelTreatment: 'TECHNICAL_GRID',
    decorativeLineSystem: 'TECH_GRID',
    iconWeight: 'BOLD',
    motionSpeed: 'FAST',
    motionCharacter: 'TECHNICAL',
    accentCoverage: 'MODERATE',
  },
  compositionGrammar: {
    mode: 'TECHNICAL',
    splitLayouts: false,
    headlineLedHierarchy: false,
    structuredGrids: true,
    diagnosticCues: false,
    timelineBehavior: false,
    operationalGrids: true,
    archivalFraming: false,
    cinematicInterruptions: false,
  },
  surfaceSystem: { mode: 'TECHNICAL_GRID' },
  imageTreatment: { mode: 'TECHNICAL_DIAGRAM' },
  iconSystem: { outlineVsSolid: 'SOLID', weight: 'BOLD', rounding: 'SHARP', decorativeUse: false },
  motionProfile: { character: 'TECHNICAL', fadeDurationMs: 120, expansionEasing: 'linear' },
  moduleVariantBase: {
    layoutGrammar: 'OPERATIONAL_GRID',
    density: 'HIGH',
    panelSystem: 'STATUS_PANEL',
    cardSystem: 'METRIC_TILE',
    imageTreatment: 'TECHNICAL_DIAGRAM',
    decorativeSystem: 'GRID_LINES',
    contentHierarchy: 'STATUS_LED',
  },
});

export const LUXURY_CLINICAL_SKIN: MasterSkin = skinBase({
  id: MASTER_SKIN_CATALOG_IDS.LUXURY_CLINICAL,
  name: 'Luxury Clinical',
  skinFamily: 'SOFT_LUXURY',
  description: 'Polished wellness luxury — soft surfaces, aspirational imagery, restrained controls.',
  supportedFields: ['HEALTH', 'BEAUTY', 'WELLNESS'],
  expressionTags: ['POLISHED', 'SOFT', 'ASPIRATIONAL', 'LUXURY', 'CALM'],
  tokens: {
    density: 'LOW',
    surfaceRadius: 20,
    borderWeight: 1,
    surfaceElevation: 'SOFT',
    contentMaxWidth: 900,
    sectionSpacing: 40,
    cardSpacing: 20,
    imageRadius: 20,
    imageTreatment: 'SOFT_LUXURY',
    statusShape: 'PILL',
    buttonShape: 'PILL',
    panelTreatment: 'PREMIUM_IMAGE_LED',
    decorativeLineSystem: 'NONE',
    iconWeight: 'LIGHT',
    motionSpeed: 'SLOW',
    motionCharacter: 'CALM',
    accentCoverage: 'MINIMAL',
  },
  compositionGrammar: {
    mode: 'LUXURY',
    splitLayouts: true,
    headlineLedHierarchy: true,
    structuredGrids: false,
    diagnosticCues: false,
    timelineBehavior: false,
    operationalGrids: false,
    archivalFraming: false,
    cinematicInterruptions: false,
  },
  surfaceSystem: { mode: 'PREMIUM_IMAGE_LED' },
  imageTreatment: { mode: 'SOFT_LUXURY' },
  iconSystem: { outlineVsSolid: 'OUTLINE', weight: 'LIGHT', rounding: 'ROUND', decorativeUse: false },
  motionProfile: { character: 'CALM', fadeDurationMs: 360, expansionEasing: 'ease-out' },
  moduleVariantBase: {
    layoutGrammar: 'IMAGE_LED',
    density: 'LOW',
    panelSystem: 'PREMIUM_SURFACE',
    cardSystem: 'LUXURY_TILE',
    imageTreatment: 'SOFT_LUXURY',
  },
});

export const MASTER_SKIN_CATALOG: MasterSkin[] = [
  CULTURAL_EDITORIAL_SKIN,
  CLINICAL_EDITORIAL_SKIN,
  TECHNICAL_OPERATIONS_SKIN,
  LUXURY_CLINICAL_SKIN,
  skinBase({
    id: MASTER_SKIN_CATALOG_IDS.MINIMAL_INSTITUTIONAL,
    name: 'Minimal Institutional',
    skinFamily: 'INSTITUTIONAL',
    description: 'Restrained institutional clarity.',
    supportedFields: ['EDUCATION', 'NONPROFIT', 'FINANCE', 'LEGAL'],
    expressionTags: ['INSTITUTIONAL', 'PRECISE', 'TRUSTED'],
    tokens: CLINICAL_EDITORIAL_SKIN.tokens,
    compositionGrammar: { ...CLINICAL_EDITORIAL_SKIN.compositionGrammar, mode: 'INSTITUTIONAL' },
    surfaceSystem: { mode: 'FLAT' },
    imageTreatment: { mode: 'MINIMAL_PRODUCT' },
    iconSystem: CLINICAL_EDITORIAL_SKIN.iconSystem,
    motionProfile: CLINICAL_EDITORIAL_SKIN.motionProfile,
    moduleVariantBase: { layoutGrammar: 'MINIMAL_GRID', density: 'LOW' },
  }),
];

export function getMasterSkinById(skinId: string): MasterSkin | null {
  return MASTER_SKIN_CATALOG.find((s) => s.id === skinId) ?? null;
}

export function listMasterSkins(): MasterSkin[] {
  return [...MASTER_SKIN_CATALOG];
}
