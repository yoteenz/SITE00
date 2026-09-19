/**
 * P0.VR.TWINV3.0R5F2 — derivation entrypoint (does not auto-run full compiler).
 */

import { loadActiveDesignWorkspaceFeatureManifest } from './designWorkspaceFeatureAuthority/designWorkspaceFeatureManifestV1.js';
import { assertDerivationAllowed } from './designWorkspaceAuthorityPipeline.js';
import { loadProjectCreativeContextPackage } from './projectCreativeGrounding/loadProjectCreativeContextPackage.js';
import type { DesignPageAuthorityReviewSession } from './types.js';

export type DeriveDesignWorkspacePackageInput = {
  session: DesignPageAuthorityReviewSession;
  authorityPairId: string;
};

export type DeriveDesignWorkspacePackagePlan = {
  authorityPairId: string;
  mobileAuthorityId: string;
  desktopAuthorityId: string;
  mobileAuthorityUri: string;
  desktopAuthorityUri: string;
  designWorkspaceFeatureManifestVersion: string;
  projectCreativeContextVersion: string;
  executionIntent: 'TRANSLATION';
  inventionBudget: 'NONE';
  /** Explicit founder action required before dispatching derivation jobs. */
  dispatchAllowed: false;
  expectedArtifacts: readonly string[];
};

const EXPECTED_DERIVATION_ARTIFACTS = [
  'StructuralBlueprint',
  'SurgicalObjectMap',
  'MasterFeatureBinding',
  'CanonicalAssetManifest',
  'FunctionBindingMap',
  'HostProjectOwnershipMap',
  'ResponsiveRelationshipContract',
  'ImplementationPrimitiveContract',
  'CompilerReadinessReceipt',
  'ReverseTraceabilityMap',
] as const;

/**
 * Validates locked pair and returns the derivation input plan.
 * @see runDesignWorkspaceDerivation — R6 live GENERATE DERIVATIVES execution.
 */
export function deriveDesignWorkspacePackage(input: DeriveDesignWorkspacePackageInput): DeriveDesignWorkspacePackagePlan {
  const { session, authorityPairId } = input;
  assertDerivationAllowed(session);
  const pair = session.authorityPipeline?.authorityPair;
  if (!pair || pair.id !== authorityPairId) {
    throw new Error('DESIGN_AUTHORITY_PAIR_ID_MISMATCH');
  }
  const mobile = session.authorityPipeline?.mobileMaster;
  const desktop = session.authorityPipeline?.desktopMaster;
  if (!mobile || !desktop) {
    throw new Error('DESIGN_AUTHORITY_PAIR_NOT_READY');
  }
  loadActiveDesignWorkspaceFeatureManifest();
  loadProjectCreativeContextPackage(session.projectId);

  return {
    authorityPairId: pair.id,
    mobileAuthorityId: mobile.id,
    desktopAuthorityId: desktop.id,
    mobileAuthorityUri: mobile.authorityImageUri,
    desktopAuthorityUri: desktop.authorityImageUri,
    designWorkspaceFeatureManifestVersion: mobile.designWorkspaceFeatureManifestVersion,
    projectCreativeContextVersion: mobile.projectCreativeContextVersion,
    executionIntent: 'TRANSLATION',
    inventionBudget: 'NONE',
    dispatchAllowed: false,
    expectedArtifacts: EXPECTED_DERIVATION_ARTIFACTS,
  };
}
