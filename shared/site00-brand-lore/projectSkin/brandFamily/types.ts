/**
 * Brand Family Skin System — per-brand skin families (not industry templates).
 * Field ≠ skin. Color ≠ skin. Approved screen references define final visuals.
 */

import type { FieldIndustryTag } from '../types.js';

export const BRAND_FAMILY_SKIN_LINEAGE = 'BRAND_FAMILY_SKIN' as const;

export const BRAND_FAMILY_KEYS = {
  NDXBOOK: 'NDXBOOK',
  FRONTAL_SLAYER: 'FRONTAL_SLAYER',
  AIO: 'AIO',
  ASTRAL_WORLD: 'ASTRAL_WORLD',
  STUDIO_WORLD: 'STUDIO_WORLD',
} as const;
export type BrandFamilyKey = (typeof BRAND_FAMILY_KEYS)[keyof typeof BRAND_FAMILY_KEYS];

export const SKIN_VISUAL_AUTHORITY_STATUSES = [
  'NOT_STARTED',
  'SCREEN_DESIGN_IN_PROGRESS',
  'PARTIAL_AUTHORITY',
  'FULL_AUTHORITY',
  'IMPLEMENTATION_READY',
  'IMPLEMENTED',
  'VERIFIED',
] as const;
export type SkinVisualAuthorityStatus = (typeof SKIN_VISUAL_AUTHORITY_STATUSES)[number];

export const BRAND_FAMILY_SKIN_STATUSES = [
  'EXISTING_SKIN_TO_REFINE',
  'NEW_SKIN_TO_DESIGN',
  'ACTIVE',
  'DEPRECATED',
] as const;
export type BrandFamilySkinStatus = (typeof BRAND_FAMILY_SKIN_STATUSES)[number];

export const SKIN_INTENTS = [
  'EDITORIAL_INTELLIGENCE_DOSSIER',
  'LUXURY_BEAUTY_EDITORIAL',
  'OPERATIONAL_COMMAND',
  'ETHEREAL_PORTAL',
  'CREATIVE_COMMAND',
] as const;
export type SkinIntent = (typeof SKIN_INTENTS)[number];

export const STANDARD_SCREEN_PACK = [
  'PROJECT_OVERVIEW',
  'IDENTITY',
  'BUILDER',
  'EVOLVE',
  'PRODUCTION',
  'REVIEWS',
  'LIBRARY',
  'CONTROL_ROOM',
] as const;
export type StandardScreenType = (typeof STANDARD_SCREEN_PACK)[number];

export const SCREEN_AUTHORITY_VIEWPORTS = ['MOBILE', 'DESKTOP', 'TABLET'] as const;
export type ScreenAuthorityViewport = (typeof SCREEN_AUTHORITY_VIEWPORTS)[number];

export const SCREEN_AUTHORITY_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'APPROVED',
  'IMPLEMENTED',
  'VERIFIED',
] as const;
export type ScreenAuthorityStatus = (typeof SCREEN_AUTHORITY_STATUSES)[number];

export const SKIN_COMPOSITION_FREEDOM = 'HIGH' as const;

export type BrandFamilyModuleVariant = {
  brandFamilySkinId: string;
  moduleId: string;
  authorityStatus: SkinVisualAuthorityStatus;
  implementationStatus: ScreenAuthorityStatus;
  continuityRules: string[];
  screenAuthorities: string[];
  version: string;
};

export type BrandFamilySkin = {
  id: string;
  brandKey: BrandFamilyKey;
  name: string;
  slug: string;
  description: string;
  fieldTags: FieldIndustryTag[];
  primaryColor: string | null;
  primaryColorFamily: string | null;
  skinIntent: SkinIntent;
  status: BrandFamilySkinStatus;
  version: string;
  visualAuthorityStatus: SkinVisualAuthorityStatus;
  moduleVariants: BrandFamilyModuleVariant[];
  approvedScreenAuthorities: string[];
  skinCompositionFreedom: typeof SKIN_COMPOSITION_FREEDOM;
  legacyMasterSkinId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkinScreenAuthority = {
  id: string;
  brandFamilySkinId: string;
  moduleId: string;
  screenType: StandardScreenType | string;
  viewport: ScreenAuthorityViewport;
  referenceAssetId: string | null;
  authorityMode: 'DESIGN_AUTHORITY';
  fidelityMode: 'EXACT';
  status: ScreenAuthorityStatus;
  approvedByFounder: boolean;
  approvedAt: string | null;
  version: string;
  visualConvergenceRequired: boolean;
};

export type BrandFamilySkinPack = {
  brandFamilySkinId: string;
  skinVersion: string;
  screenAuthorities: SkinScreenAuthority[];
  completionStatus: 'NOT_STARTED' | 'PARTIAL' | 'COMPLETE';
  consistencyStatus: 'NOT_EVALUATED' | 'PASS' | 'FAIL';
  implementationStatus: 'NOT_STARTED' | 'PARTIAL' | 'COMPLETE';
  founderApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BrandSkinColorBinding = {
  brandFamilySkinId: string;
  hostAccentBehavior: 'HOST_RED_ONLY' | 'PROJECT_PRIMARY_INTERNAL';
  projectPrimaryColor: string;
  projectSecondaryColor?: string | null;
  successColor?: string | null;
  warningColor?: string | null;
  surfaceNeutrals?: string[];
  accentCoveragePolicy: 'MINIMAL' | 'MODERATE' | 'BOLD';
};

export type SkinContinuityRecord = {
  brandFamilySkinId: string;
  version: string;
  lockedDecisions: string[];
  allowedVariation: string[];
  moduleSpecificRules: Record<string, string[]>;
  prohibitedPatterns: string[];
  founderNotes: string | null;
  updatedAt: string;
};

export type ModuleFunctionalContract = {
  moduleId: string;
  screenType: StandardScreenType | string;
  mustPreserve: string[];
  canVary: string[];
  moduleSpecificFreedom: string[];
};

export type SkinScreenImplementationJob = {
  jobId: string;
  brandFamilySkinId: string;
  moduleId: string;
  screenType: string;
  viewport: ScreenAuthorityViewport;
  referenceId: string;
  functionalContract: ModuleFunctionalContract;
  continuityRecord: SkinContinuityRecord | null;
  fidelityEnvelope: {
    authorityMode: 'DESIGN_AUTHORITY';
    fidelityMode: 'EXACT';
    visualConvergenceRequired: boolean;
  };
  status: 'READY' | 'IN_PROGRESS' | 'COMPLETE';
  createdAt: string;
};

export type DerivedBrandFamilySkin = {
  sourceSkinId: string;
  derivedSkinId: string;
  inherit: string[];
  override: Record<string, unknown>;
  founderApproved: boolean;
};

export type BrandFamilySkinMigration = {
  migrationId: string;
  projectId: string;
  fromBrandFamilySkinId: string;
  fromVersion: string;
  toBrandFamilySkinId: string;
  toVersion: string;
  previewAvailable: boolean;
  approved: boolean;
  rolledBack: boolean;
  createdAt: string;
};

export type SkinVisualDistanceProfile = {
  brandFamilySkinId: string;
  composition: number;
  density: number;
  panelGrammar: number;
  heroBehavior: number;
  imageIntegration: number;
  statusSystem: number;
  activitySystem: number;
  ctaBehavior: number;
  spacingRhythm: number;
  motionCharacter: number;
};

export type BrandFamilyProjectExperienceSkin = {
  projectId: string;
  brandFamilySkinId: string;
  skinVersion: string;
  fieldTags: FieldIndustryTag[];
  primaryColor: string;
  secondaryColor?: string | null;
  moduleVariantOverrides: Record<string, string>;
  selectedAtOnboarding: boolean;
  selectedBy: string | null;
  founderApproved: boolean;
  active: boolean;
  masterSkinId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const BRAND_FAMILY_SKIN_FAILURE_CODES = [
  'BRAND_FAMILY_SKIN_MISSING',
  'BRAND_FAMILY_SKIN_COLOR_ONLY',
  'BRAND_FAMILY_SKIN_AUTHORITY_MISSING',
  'BRAND_FAMILY_SKIN_UNAPPROVED_AUTO_DESIGN',
  'BRAND_FAMILY_SKIN_HOST_FIREWALL_BREACH',
  'BRAND_FAMILY_SKIN_MODULE_LOGIC_REGRESSION',
  'BRAND_FAMILY_SKIN_TYPOGRAPHY_BREACH',
  'BRAND_FAMILY_SKIN_SCREEN_PACK_INCONSISTENT',
  'BRAND_FAMILY_SKIN_SCREEN_TOO_SIMILAR',
  'BRAND_FAMILY_SKIN_VERSION_MISSING',
  'BRAND_FAMILY_SKIN_CLIENT_CONFIG_LEAK',
  'SKIN_SCREEN_AUTHORITY_REQUIRED',
] as const;
export type BrandFamilySkinFailureCode = (typeof BRAND_FAMILY_SKIN_FAILURE_CODES)[number];

export type ResolvedBrandFamilySkin = {
  projectId: string;
  brandFamilySkinId: string;
  brandKey: BrandFamilyKey;
  skinVersion: string;
  skinIntent: SkinIntent;
  primaryColor: string;
  visualAuthorityStatus: SkinVisualAuthorityStatus;
  renderMode: 'GENERIC_FALLBACK' | 'EXISTING_IMPLEMENTATION' | 'AUTHORITY_DRIVEN';
  screenAuthority: SkinScreenAuthority | null;
  failureCode: BrandFamilySkinFailureCode | null;
  cssClass: string | null;
  hostFirewallStatus: 'INTACT';
};
