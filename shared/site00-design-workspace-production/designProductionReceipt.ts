import type { DesignProductionState } from './types.js';
import { computeDesignReadiness } from './designReadinessEngine.js';
import { NDXBOOK_DESIGN_CHILD_INHERITANCE } from './childInheritanceContract.js';

export type DesignProductionizationReceipt = {
  contractVersion: string;
  contractHash: string;
  authorityVersion: string;
  readiness: ReturnType<typeof computeDesignReadiness>;
  buildEligibility: boolean;
  implementedInteractions: string[];
  persistedState: 'localStorage_project_scoped' | 'memory_only';
  eventTaxonomy: string[];
  permissions: 'founder_only_mutations';
  assetManifestVersion: string;
  childInheritanceContractVersion: string;
  composerMinorDesignTweakPolicy: 'DEFINED';
  knownGaps: string[];
};

export function buildDesignProductionizationReceipt(
  state: DesignProductionState,
): DesignProductionizationReceipt {
  const readiness = computeDesignReadiness(state);
  return {
    contractVersion: state.contractFreeze.contractVersion,
    contractHash: state.contractFreeze.contractHash,
    authorityVersion: state.designAuthorityVersion,
    readiness,
    buildEligibility: readiness.buildEligible,
    implementedInteractions: [
      'FD-01 overflow readiness + contract versions',
      'FD-02 hamburger host module nav',
      'FD-03 creative context drawer',
      'FD-04 readonly target',
      'FD-05 tablet derived + override',
      'FD-06 pair review / review authority / lock',
      'FD-07 deterministic readiness',
      'FD-08 move to build',
      'FD-09 provenance drawer',
      'refine/regenerate with spend guard',
    ],
    persistedState: typeof localStorage !== 'undefined' ? 'localStorage_project_scoped' : 'memory_only',
    eventTaxonomy: [
      'VIEWPORT_SELECTED',
      'VIEWPORT_UNSELECTED',
      'VIEWPORT_MASTER_PROMOTED',
      'VIEWPORT_MASTER_SUPERSEDED',
      'PAIR_LOCKED',
      'PAIR_SUPERSEDED',
      'DERIVATION_MARKED_STALE',
      'FOUNDER_AUTHORITY_INJECTION',
      'MOVED_TO_BUILD',
      'CANDIDATE_REFINED',
      'CANDIDATE_REGENERATED',
    ],
    permissions: 'founder_only_mutations',
    assetManifestVersion: 'twin-opus-direct-assets-v1',
    childInheritanceContractVersion: NDXBOOK_DESIGN_CHILD_INHERITANCE.version,
    composerMinorDesignTweakPolicy: 'DEFINED',
    knownGaps: [
      'Supabase server row for DesignWorkspaceAuthoritySession not wired in this sprint — localStorage is optimistic cache per persistenceContract',
    ],
  };
}
