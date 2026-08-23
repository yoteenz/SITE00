/**
 * Site P1 preconditions — explicit gates before Composer can eventually implement.
 */

import { COMPOSER_ORCHESTRATION_IMPLEMENTED, P0_5A_METHODOLOGY_VERSION } from './constants.js';
import { composerNotConnectedForSiteImplementation } from './siteProductionLogic.js';

export type SiteP1Precondition = {
  id: string;
  label: string;
  required: true;
  satisfied: boolean;
  blockerReason: string | null;
};

export type SiteP1PreconditionsEvaluation = {
  projectId: string;
  preconditions: SiteP1Precondition[];
  allSatisfied: boolean;
  composerConnected: false;
  readyForP1: boolean;
  methodologyVersion: typeof P0_5A_METHODOLOGY_VERSION | string;
  evaluatedAt: string;
};

export function evaluateSiteP1Preconditions(input: {
  projectId: string;
  siteStrategyReady: boolean;
  siteArchitectureReady: boolean;
  iaReady: boolean;
  pageInventoryReady: boolean;
  pageFamiliesReady: boolean;
  experienceDirectionApproved: boolean;
  representativeProofsApproved: boolean;
  productionAssetsAvailable: boolean;
  siteCoherenceReady: boolean;
  functionalCanonCurrent: boolean;
  dependencyGraphCurrent: boolean;
  implementationContractCompiled: boolean;
  composerLiveVerified: boolean;
}): SiteP1PreconditionsEvaluation {
  const preconditions: SiteP1Precondition[] = [
    { id: 'SITE_STRATEGY', label: 'Site Strategy READY', required: true, satisfied: input.siteStrategyReady, blockerReason: input.siteStrategyReady ? null : 'Site Strategy not ready' },
    { id: 'SITE_ARCHITECTURE', label: 'Site Architecture READY', required: true, satisfied: input.siteArchitectureReady, blockerReason: input.siteArchitectureReady ? null : 'Site Architecture not ready' },
    { id: 'INFORMATION_ARCHITECTURE', label: 'Information Architecture READY', required: true, satisfied: input.iaReady, blockerReason: input.iaReady ? null : 'IA not ready' },
    { id: 'PAGE_INVENTORY', label: 'Page Inventory READY', required: true, satisfied: input.pageInventoryReady, blockerReason: input.pageInventoryReady ? null : 'Page Inventory not ready' },
    { id: 'PAGE_FAMILIES', label: 'Page Families READY', required: true, satisfied: input.pageFamiliesReady, blockerReason: input.pageFamiliesReady ? null : 'Page Families not ready' },
    { id: 'EXPERIENCE_DIRECTION', label: 'Experience Direction APPROVED', required: true, satisfied: input.experienceDirectionApproved, blockerReason: input.experienceDirectionApproved ? null : 'Experience Direction not approved' },
    { id: 'REPRESENTATIVE_PROOFS', label: 'Representative proofs APPROVED', required: true, satisfied: input.representativeProofsApproved, blockerReason: input.representativeProofsApproved ? null : 'Representative proofs not approved' },
    { id: 'PRODUCTION_ASSETS', label: 'Production assets AVAILABLE', required: true, satisfied: input.productionAssetsAvailable, blockerReason: input.productionAssetsAvailable ? null : 'Production assets not available' },
    { id: 'SITE_COHERENCE', label: 'Site Coherence READY or NOT_EVALUATED with override', required: true, satisfied: input.siteCoherenceReady, blockerReason: input.siteCoherenceReady ? null : 'Site coherence not ready' },
    { id: 'FUNCTIONAL_CANON', label: 'Functional Canon CURRENT', required: true, satisfied: input.functionalCanonCurrent, blockerReason: input.functionalCanonCurrent ? null : 'Functional Canon not current' },
    { id: 'DEPENDENCY_GRAPH', label: 'Dependency graph CURRENT', required: true, satisfied: input.dependencyGraphCurrent, blockerReason: input.dependencyGraphCurrent ? null : 'Dependency graph not current' },
    { id: 'IMPLEMENTATION_CONTRACT', label: 'Implementation contract COMPILED', required: true, satisfied: input.implementationContractCompiled, blockerReason: input.implementationContractCompiled ? null : 'Implementation contract not compiled' },
    { id: 'COMPOSER_LIVE', label: 'Composer capability VERIFIED', required: true, satisfied: input.composerLiveVerified, blockerReason: input.composerLiveVerified ? null : 'Composer live verification not passed' },
  ];

  const methodologyPreconditionsMet = preconditions.every((p) => p.satisfied);
  const composerBlocked = composerNotConnectedForSiteImplementation();

  return {
    projectId: input.projectId,
    preconditions,
    allSatisfied: methodologyPreconditionsMet && !composerBlocked && input.composerLiveVerified,
    composerConnected: COMPOSER_ORCHESTRATION_IMPLEMENTED,
    readyForP1: methodologyPreconditionsMet && !composerBlocked,
    methodologyVersion: P0_5A_METHODOLOGY_VERSION,
    evaluatedAt: new Date().toISOString(),
  };
}

export function productionMethodologyTrustworthyForP1(): boolean {
  return true;
}

export function readyForP1ImplementationAutomation(): boolean {
  return productionMethodologyTrustworthyForP1() && !composerNotConnectedForSiteImplementation();
}
