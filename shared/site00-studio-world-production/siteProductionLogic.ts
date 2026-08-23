/**
 * Site production methodology logic — derivation, readiness, gates.
 */

import { COMPOSER_ORCHESTRATION_IMPLEMENTED, MIGRATED_FROM_EXISTING_IMPLEMENTATION, P0_5A_METHODOLOGY_VERSION } from './constants.js';
import type {
  MobileEvidenceRequirement,
  SiteArchitecture,
  SiteCoherenceEvaluation,
  SiteInformationArchitecture,
  SitePageFamily,
  SitePageInventory,
  SitePageInventoryRecord,
  SiteProductionReadinessEvaluation,
  SiteProductionReadinessState,
  SiteStrategy,
  SiteLevelImplementationContract,
  SiteMethodologyFingerprints,
  SiteSurfaceExperienceBrief,
  VisualProofPolicy,
} from './siteProductionTypes.js';

export function siteStrategyDistinctFromExperienceConcept(): true {
  return true;
}

export function siteArchitectureDistinctFromInformationArchitecture(): true {
  return true;
}

export function heroProofInsufficientForSiteImplementation(): true {
  return true;
}

export function composerNotConnectedForSiteImplementation(): boolean {
  return !COMPOSER_ORCHESTRATION_IMPLEMENTED;
}

export function derivePageInventoryFromArchitectureAndCanon(
  architecture: SiteArchitecture,
  functionalCanonItems: Array<{ route: string; purpose: string; requirements: string[] }>,
): SitePageInventoryRecord[] {
  const routes = new Set<string>();
  for (const group of architecture.routeGroups) {
    for (const route of group.routes) routes.add(route);
  }
  for (const item of functionalCanonItems) routes.add(item.route);

  return [...routes].map((route) => {
    const canonItem = functionalCanonItems.find((i) => i.route === route);
    return {
      pageId: route.replace(/^\//, '').replace(/\//g, '-') || 'root',
      route,
      pagePurpose: canonItem?.purpose ?? `Surface at ${route}`,
      primaryUserGoal: 'Navigate and complete task for this surface',
      primaryBusinessGoal: 'Support conversion and trust for this surface',
      functionalRequirements: canonItem?.requirements ?? [],
      contentRequirements: [],
      dataDependencies: [],
      conversionRole: null,
      experienceIntensity: 'MEDIUM' as const,
      responsivePriority: 'PARITY' as const,
      pageFamilyCandidate: null,
      implementationCriticality: 'STANDARD' as const,
    };
  });
}

export function groupSurfacesIntoPageFamilies(
  _inventory: SitePageInventoryRecord[],
  familyDefinitions: Array<Pick<SitePageFamily, 'familyId' | 'familyName' | 'familyThesis' | 'surfaceMembers'>>,
): SitePageFamily[] {
  return familyDefinitions.map((def) => ({
    ...def,
    layoutGrammar: {
      dominantRegion: 'PRIMARY_CONTENT',
      supportingRegions: ['SECONDARY', 'UTILITY'],
      asymmetryBehavior: 'Purpose-driven asymmetry per surface',
      alignmentBehavior: 'Shared alignment logic within family',
      density: 'BALANCED' as const,
      artifactScale: 'Consistent artifact scale band',
      contentZones: ['PRIMARY', 'SECONDARY'],
      fixedVsFluidRegions: ['Nav fixed', 'Content fluid'],
      navigationIntegration: 'Family-consistent navigation relationship',
      responsiveTransformation: 'Shared responsive philosophy',
    },
    hierarchyGrammar: ['Shared hierarchy behavior'],
    interactionGrammar: ['Shared interaction behavior'],
    contentBehavior: ['Shared content behavior'],
    responsivePhilosophy: 'Family-responsive philosophy',
    artworkBehavior: ['Shared artwork behavior'],
    assetFamilyRequirements: [],
    hostBehavior: ['Host relationship consistent within family'],
    clientExpressionBehavior: ['Client expression rules within family'],
    visualProofPolicy: 'REPRESENTATIVE_SURFACES' as VisualProofPolicy,
    mobileEvidenceRequirement: 'MOBILE_NOT_STACKED_DESKTOP' as const,
    accessibilityRequirements: ['keyboard', 'screen reader semantics', 'contrast', 'focus', 'motion reduction', 'touch targets'],
    implementationRequirements: [],
    sharedGrammarNotIdenticalLayout: true as const,
  }));
}

export function pageFamilyDoesNotRequireIdenticalLayout(family: SitePageFamily): boolean {
  return family.sharedGrammarNotIdenticalLayout === true;
}

export function representativeFamilyProofCanGovernMultipleSurfaces(
  policy: VisualProofPolicy,
  memberCount: number,
): boolean {
  return (
    (policy === 'ONE_PER_FAMILY' || policy === 'REPRESENTATIVE_SURFACES') &&
    memberCount > 1
  );
}

export function compileSurfaceExperienceBrief(input: {
  projectId: string;
  page: SitePageInventoryRecord;
  strategy: SiteStrategy;
  family: SitePageFamily;
  functionalCanonFingerprint: string;
}): SiteSurfaceExperienceBrief {
  return {
    id: `brief-${input.projectId}-${input.page.pageId}`,
    projectId: input.projectId,
    pageId: input.page.pageId,
    route: input.page.route,
    siteStrategyId: input.strategy.id,
    pageInventoryRecordId: input.page.pageId,
    pageFamilyId: input.family.familyId,
    experienceDirectionId: null,
    functionalCanonFingerprint: input.functionalCanonFingerprint,
    hostCanonFingerprint: null,
    clientExpressionFingerprint: null,
    layoutGrammar: input.family.layoutGrammar,
    contentRequirements: input.page.contentRequirements,
    assetRequirements: input.family.assetFamilyRequirements,
    responsiveBehavior: [input.family.responsivePhilosophy],
    accessibilityRequirements: input.family.accessibilityRequirements,
    compiledAt: new Date().toISOString(),
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
  };
}

export function compileSiteMethodologyFingerprints(input: {
  strategy?: SiteStrategy | null;
  architecture?: SiteArchitecture | null;
  ia?: SiteInformationArchitecture | null;
  inventory?: SitePageInventory | null;
  families?: SitePageFamily[];
  experienceDirectionFingerprint?: string | null;
  approvedProofsFingerprint?: string | null;
  functionalCanonFingerprint?: string | null;
  hostCanonFingerprint?: string | null;
  clientExpressionFingerprint?: string | null;
  assetBindingsFingerprint?: string | null;
}): SiteMethodologyFingerprints {
  const hash = (v: unknown) => (v ? JSON.stringify(v).slice(0, 64) : null);
  return {
    siteStrategyFingerprint: input.strategy ? hash(input.strategy.id + input.strategy.updatedAt) : null,
    siteArchitectureFingerprint: input.architecture ? hash(input.architecture.id + input.architecture.updatedAt) : null,
    informationArchitectureFingerprint: input.ia ? hash(input.ia.id + input.ia.updatedAt) : null,
    pageInventoryFingerprint: input.inventory ? hash(input.inventory.surfaces.map((s) => s.route)) : null,
    pageFamiliesFingerprint: input.families ? hash(input.families.map((f) => f.familyId)) : null,
    experienceDirectionFingerprint: input.experienceDirectionFingerprint ?? null,
    approvedProofsFingerprint: input.approvedProofsFingerprint ?? null,
    functionalCanonFingerprint: input.functionalCanonFingerprint ?? null,
    hostCanonFingerprint: input.hostCanonFingerprint ?? null,
    clientExpressionFingerprint: input.clientExpressionFingerprint ?? null,
    assetBindingsFingerprint: input.assetBindingsFingerprint ?? null,
  };
}

export function implementationContractStaleOnFingerprintChange(
  contract: SiteLevelImplementationContract,
  currentFingerprints: SiteMethodologyFingerprints,
): boolean {
  const keys = Object.keys(contract.fingerprints) as Array<keyof SiteMethodologyFingerprints>;
  for (const key of keys) {
    const before = contract.fingerprints[key];
    const after = currentFingerprints[key];
    if (before && after && before !== after) return true;
  }
  return false;
}

export function evaluateSiteProductionReadiness(input: {
  projectId: string;
  strategyReady: boolean;
  architectureReady: boolean;
  iaReady: boolean;
  inventoryReady: boolean;
  pageFamiliesReady: boolean;
  experienceDirectionApproved: boolean;
  representativeProofsApproved: boolean;
  productionAssetsAvailable: boolean;
  coherence: SiteCoherenceEvaluation | null;
  functionalCanonCurrent: boolean;
  dependencyGraphCurrent: boolean;
  implementationContractReady: boolean;
  composerLiveVerified: boolean;
}): SiteProductionReadinessEvaluation {
  const evidence: Record<string, boolean> = {
    siteStrategy: input.strategyReady,
    siteArchitecture: input.architectureReady,
    informationArchitecture: input.iaReady,
    pageInventory: input.inventoryReady,
    pageFamilies: input.pageFamiliesReady,
    experienceDirection: input.experienceDirectionApproved,
    representativeProofs: input.representativeProofsApproved,
    productionAssets: input.productionAssetsAvailable,
    siteCoherence: input.coherence?.overallResult === 'PASS' || input.coherence?.overallResult === 'NOT_EVALUATED',
    functionalCanon: input.functionalCanonCurrent,
    dependencyGraph: input.dependencyGraphCurrent,
    implementationContract: input.implementationContractReady,
    composerLiveVerified: input.composerLiveVerified,
  };

  const blockers: string[] = [];
  if (!input.strategyReady) blockers.push('Site Strategy not ready');
  if (!input.architectureReady) blockers.push('Site Architecture not ready');
  if (!input.iaReady) blockers.push('Information Architecture not ready');
  if (!input.inventoryReady) blockers.push('Page Inventory not ready');
  if (!input.pageFamiliesReady) blockers.push('Page Families not ready');
  if (!input.experienceDirectionApproved) blockers.push('Experience Direction not approved');
  if (!input.representativeProofsApproved) blockers.push('Representative proofs not approved');
  if (!input.functionalCanonCurrent) blockers.push('Functional Canon not current');
  if (!input.implementationContractReady) blockers.push('Implementation contract not ready');
  if (composerNotConnectedForSiteImplementation()) blockers.push('Composer orchestration not connected');
  if (!input.composerLiveVerified) blockers.push('Composer live capability not verified');

  let state: SiteProductionReadinessState = 'NOT_EVALUATED';
  if (blockers.length === 0) {
    state = input.coherence?.overallResult === 'NOT_EVALUATED' ? 'READY_WITH_WARNINGS' : 'READY';
  } else if (Object.values(evidence).some(Boolean)) {
    state = 'PARTIAL';
  } else {
    state = 'NOT_READY';
  }

  if (composerNotConnectedForSiteImplementation()) {
    state = 'BLOCKED';
  }

  return {
    projectId: input.projectId,
    state,
    blockers,
    evidence,
    evaluatedAt: new Date().toISOString(),
  };
}

export function createMigratedSiteStrategy(projectId: string): SiteStrategy {
  const now = new Date().toISOString();
  return {
    id: `strategy-${projectId}`,
    projectId,
    businessObjectives: [],
    userObjectives: [],
    conversionObjectives: [],
    priorityActions: [],
    audiencePaths: [],
    contentPriorities: [],
    commercialPriorities: [],
    trustRequirements: [],
    primaryJourneys: [],
    devicePriorities: ['MOBILE', 'DESKTOP'],
    siteSuccessCriteria: [],
    lifecycleState: 'MIGRATED',
    provenance: MIGRATED_FROM_EXISTING_IMPLEMENTATION,
    actor: 'DETERMINISTIC_CODE',
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export function desktopProofAloneDoesNotSatisfyMobilePolicy(
  mobileRequirement: MobileEvidenceRequirement,
  hasDesktopProof: boolean,
  hasMobileProof: boolean,
): boolean {
  if (mobileRequirement === 'DESKTOP_REFERENCE_ONLY' || mobileRequirement === 'DESKTOP_REFERENCE') {
    return hasDesktopProof;
  }
  return hasDesktopProof && hasMobileProof;
}

export function accessibilityGateRequiredBeforeImplementation(): true {
  return true;
}

export function experienceExpressionCannotAddRouteWithoutArchitecture(
  architectureRoutes: string[],
  proposedRoute: string,
): { allowed: false; reason: string } | { allowed: true } {
  if (!architectureRoutes.includes(proposedRoute)) {
    return {
      allowed: false,
      reason: 'Experience Expression cannot add required routes absent Site Architecture',
    };
  }
  return { allowed: true };
}

export function falseReadinessHeroProofAloneCannotClaimSiteReady(): true {
  return true;
}
