/**
 * Site production methodology types — Strategy through Page Families.
 */

import { MIGRATED_FROM_EXISTING_IMPLEMENTATION, P0_5A_METHODOLOGY_VERSION } from './constants.js';

export const SITE_PRODUCTION_LIFECYCLE_STATES = [
  'NOT_STARTED',
  'DRAFT',
  'READY',
  'STALE',
  'REVIEW_REQUIRED',
  'BLOCKED',
  'MIGRATED',
  'NOT_EVALUATED',
] as const;

export type SiteProductionLifecycleState = (typeof SITE_PRODUCTION_LIFECYCLE_STATES)[number];

export const PROJECT_PRODUCTION_DISCIPLINES = [
  'IDENTITY',
  'CONTENT',
  'SITE',
  'EXPERIENCE',
  'APPLICATION_PRODUCT',
  'MOTION',
  'PHYSICAL',
  'WORLD',
] as const;

export type ProjectProductionDiscipline = (typeof PROJECT_PRODUCTION_DISCIPLINES)[number];

export type SiteStrategy = {
  id: string;
  projectId: string;
  businessObjectives: string[];
  userObjectives: string[];
  conversionObjectives: string[];
  priorityActions: string[];
  audiencePaths: string[];
  contentPriorities: string[];
  commercialPriorities: string[];
  trustRequirements: string[];
  primaryJourneys: string[];
  devicePriorities: Array<'MOBILE' | 'DESKTOP' | 'TABLET'>;
  siteSuccessCriteria: string[];
  searchIntentNotes?: string[];
  metadataRequirements?: string[];
  structuredDataOpportunities?: string[];
  lifecycleState: SiteProductionLifecycleState;
  provenance: typeof MIGRATED_FROM_EXISTING_IMPLEMENTATION | 'FOUNDER_APPROVED' | 'COMPILED' | 'DRAFT';
  actor: 'DETERMINISTIC_CODE' | 'ANTHROPIC_REASONING';
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
  createdAt: string;
  updatedAt: string;
};

export type SiteArchitecture = {
  id: string;
  projectId: string;
  routeGroups: Array<{ groupId: string; label: string; routes: string[] }>;
  primaryJourneys: string[];
  navigationHierarchy: Array<{ nodeId: string; label: string; children?: string[] }>;
  entryPoints: string[];
  conversionPaths: string[];
  serviceDestinations: string[];
  productDestinations: string[];
  accountAreas: string[];
  supportAreas: string[];
  legalSystemPages: string[];
  lifecycleState: SiteProductionLifecycleState;
  functionalCanonFingerprint: string | null;
  provenance: typeof MIGRATED_FROM_EXISTING_IMPLEMENTATION | 'FOUNDER_APPROVED' | 'COMPILED' | 'DRAFT';
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
  createdAt: string;
  updatedAt: string;
};

export type SiteInformationArchitecture = {
  id: string;
  projectId: string;
  informationDomains: string[];
  hierarchy: Array<{ domainId: string; parentId: string | null; priority: number }>;
  crossLinks: Array<{ fromDomainId: string; toDomainId: string; purpose: string }>;
  progressiveDisclosureRules: string[];
  contentDependencies: Array<{ sourceId: string; dependsOnId: string; reason: string }>;
  navigationRelationships: Array<{ fromNodeId: string; toNodeId: string; relationship: string }>;
  lifecycleState: SiteProductionLifecycleState;
  provenance: typeof MIGRATED_FROM_EXISTING_IMPLEMENTATION | 'FOUNDER_APPROVED' | 'COMPILED' | 'DRAFT';
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
  createdAt: string;
  updatedAt: string;
};

export type SitePageInventoryRecord = {
  pageId: string;
  route: string;
  pagePurpose: string;
  primaryUserGoal: string;
  primaryBusinessGoal: string;
  functionalRequirements: string[];
  contentRequirements: string[];
  dataDependencies: string[];
  conversionRole: string | null;
  experienceIntensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMERSIVE';
  responsivePriority: 'MOBILE_FIRST' | 'DESKTOP_FIRST' | 'PARITY';
  pageFamilyCandidate: string | null;
  implementationCriticality: 'CRITICAL' | 'STANDARD' | 'OPTIONAL';
  metadataRequirements?: string[];
  searchIntent?: string | null;
};

export type SitePageInventory = {
  id: string;
  projectId: string;
  surfaces: SitePageInventoryRecord[];
  lifecycleState: SiteProductionLifecycleState;
  derivedFromArchitectureId: string | null;
  derivedFromFunctionalCanonFingerprint: string | null;
  provenance: typeof MIGRATED_FROM_EXISTING_IMPLEMENTATION | 'FOUNDER_APPROVED' | 'COMPILED' | 'DRAFT';
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
  createdAt: string;
  updatedAt: string;
};

export type LayoutGrammar = {
  dominantRegion: string;
  supportingRegions: string[];
  asymmetryBehavior: string;
  alignmentBehavior: string;
  density: 'COMPACT' | 'BALANCED' | 'EXPANSIVE';
  artifactScale: string;
  contentZones: string[];
  fixedVsFluidRegions: string[];
  navigationIntegration: string;
  responsiveTransformation: string;
};

export type ComponentGrammar = {
  functionalRoles: Array<{
    roleId: string;
    roleName: string;
    behaviorRules: string[];
    visualImplementationSeparate: true;
  }>;
};

export type SiteDesignSystemContract = {
  id: string;
  spacingRules: string[];
  typeRoles: string[];
  colorRoles: string[];
  surfaceTreatments: string[];
  radiusRules: string[];
  depthRules: string[];
  motionTokens: string[];
  hostClientOwnership: Record<string, 'HOST' | 'CLIENT' | 'SHARED'>;
  interactiveStates: string[];
  responsiveTokens: string[];
  clientExpressionAlterationBoundaries: string[];
};

export const VISUAL_PROOF_POLICIES = [
  'NO_CUSTOM_PROOF',
  'HERO_ONLY',
  'ONE_PER_FAMILY',
  'REPRESENTATIVE_SURFACES',
  'ALL_CRITICAL_SURFACES',
] as const;

export type VisualProofPolicy = (typeof VISUAL_PROOF_POLICIES)[number];

export const MOBILE_EVIDENCE_REQUIREMENTS = [
  'DESKTOP_REFERENCE_ONLY',
  'DESKTOP_REFERENCE',
  'MOBILE_REFERENCE',
  'MOBILE_NOT_STACKED_DESKTOP',
] as const;

export type MobileEvidenceRequirement = (typeof MOBILE_EVIDENCE_REQUIREMENTS)[number];

export type SitePageFamily = {
  familyId: string;
  familyName: string;
  familyThesis: string;
  surfaceMembers: string[];
  layoutGrammar: LayoutGrammar;
  hierarchyGrammar: string[];
  interactionGrammar: string[];
  contentBehavior: string[];
  responsivePhilosophy: string;
  artworkBehavior: string[];
  assetFamilyRequirements: string[];
  hostBehavior: string[];
  clientExpressionBehavior: string[];
  visualProofPolicy: VisualProofPolicy;
  mobileEvidenceRequirement: MobileEvidenceRequirement;
  accessibilityRequirements: string[];
  implementationRequirements: string[];
  /** Shared grammar ≠ identical layout */
  sharedGrammarNotIdenticalLayout: true;
};

export type SiteSurfaceExperienceBrief = {
  id: string;
  projectId: string;
  pageId: string;
  route: string;
  siteStrategyId: string;
  pageInventoryRecordId: string;
  pageFamilyId: string;
  experienceDirectionId: string | null;
  functionalCanonFingerprint: string;
  hostCanonFingerprint: string | null;
  clientExpressionFingerprint: string | null;
  layoutGrammar: LayoutGrammar;
  contentRequirements: string[];
  assetRequirements: string[];
  responsiveBehavior: string[];
  accessibilityRequirements: string[];
  compiledAt: string;
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
};

export type SiteCoherenceEvaluation = {
  id: string;
  projectId: string;
  familyConsistency: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  siteWideHierarchy: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  hostContinuity: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  clientContinuity: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  navigationCoherence: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  assetContinuity: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  responsiveCoverage: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  functionalCoverage: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  pageDuplicationRisk: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  layoutCloningRisk: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  genericTemplateRisk: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  overallResult: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
  evaluatedAt: string | null;
};

export const SITE_PRODUCTION_READINESS_STATES = [
  'NOT_READY',
  'PARTIAL',
  'READY_WITH_WARNINGS',
  'READY',
  'BLOCKED',
  'NOT_EVALUATED',
] as const;

export type SiteProductionReadinessState = (typeof SITE_PRODUCTION_READINESS_STATES)[number];

export type SiteProductionReadinessEvaluation = {
  projectId: string;
  state: SiteProductionReadinessState;
  blockers: string[];
  evidence: Record<string, boolean>;
  evaluatedAt: string;
};

export type SiteMethodologyFingerprints = {
  siteStrategyFingerprint: string | null;
  siteArchitectureFingerprint: string | null;
  informationArchitectureFingerprint: string | null;
  pageInventoryFingerprint: string | null;
  pageFamiliesFingerprint: string | null;
  experienceDirectionFingerprint: string | null;
  approvedProofsFingerprint: string | null;
  functionalCanonFingerprint: string | null;
  hostCanonFingerprint: string | null;
  clientExpressionFingerprint: string | null;
  assetBindingsFingerprint: string | null;
};

export type PageFamilyImplementationContract = {
  id: string;
  projectId: string;
  familyId: string;
  familyPurpose: string;
  memberSurfaces: string[];
  layoutGrammar: LayoutGrammar;
  componentGrammar: ComponentGrammar;
  responsiveTranslation: string[];
  interactionRules: string[];
  contentBehavior: string[];
  designTokenOwnership: Record<string, 'HOST' | 'CLIENT' | 'SHARED'>;
  clientExpressionRules: string[];
  approvedFamilyProofIds: string[];
  assetBindings: string[];
  functionalRequirements: string[];
  doNotConstraints: string[];
  fingerprints: SiteMethodologyFingerprints;
  lifecycleState: 'DRAFT' | 'READY' | 'STALE' | 'BLOCKED';
  compiledAt: string;
};

export type SiteSurfaceImplementationContract = {
  id: string;
  projectId: string;
  pageId: string;
  route: string;
  pageFamilyContractId: string;
  surfaceExperienceBriefId: string;
  functionalRequirements: string[];
  contentDataRequirements: string[];
  fingerprints: SiteMethodologyFingerprints;
  lifecycleState: 'DRAFT' | 'READY' | 'STALE' | 'BLOCKED';
  compiledAt: string;
};

export type SiteLevelImplementationContract = {
  id: string;
  projectId: string;
  fingerprints: SiteMethodologyFingerprints;
  pageFamilyContracts: string[];
  surfaceContracts: string[];
  lifecycleState: 'DRAFT' | 'READY' | 'STALE' | 'BLOCKED';
  staleReason: string | null;
  compiledAt: string;
  /** Contract mutation in place forbidden — compile new version */
  version: number;
};
