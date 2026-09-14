import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';
import type { MobileImplementationRender } from './types.js';

export type ReferenceTranslationEvidenceResult = 'PASS' | 'FAIL' | 'REVIEW_REQUIRED';

export type ReferenceTranslationEvidenceReceipt = {
  id: string;
  renderId: string;
  referenceAuthorityId: string;
  compositionStateId: string;
  compositionHash: string;
  featureManifestReconciled: boolean;
  compositionStatePrioritized: boolean;
  projectTruthIntegrated: boolean;
  hostProjectContractPresent: boolean;
  pageStateResolutionClaimed: boolean;
  implementationRoleDistinct: boolean;
  signals: string[];
  result: ReferenceTranslationEvidenceResult;
  createdAt: string;
};

export function buildReferenceTranslationEvidenceReceipt(input: {
  receiptId: string;
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  render: Pick<MobileImplementationRender, 'id' | 'compositionStateId' | 'compositionHash' | 'referenceAuthorityId'>;
  promptIncludesAntiClone: boolean;
}): ReferenceTranslationEvidenceReceipt {
  const featureManifestReconciled = input.composition.featureBindings.length >= 8;
  const compositionStatePrioritized =
    input.render.compositionStateId === input.composition.id &&
    input.render.compositionHash === input.composition.compositionHash;
  const projectTruthIntegrated = Boolean(input.composition.projectCreativeContextVersion?.includes('ndxbook'));
  const hostProjectContractPresent = Boolean(input.composition.hostProjectContractVersion);
  const pageStateResolutionClaimed = input.promptIncludesAntiClone;
  const implementationRoleDistinct = input.render.referenceAuthorityId === input.reference.id;

  const signals: string[] = [];
  if (featureManifestReconciled) signals.push('FEATURE_MANIFEST_RECONCILED');
  if (compositionStatePrioritized) signals.push('COMPOSITION_STATE_BOUND');
  if (projectTruthIntegrated) signals.push('PROJECT_TRUTH_INTEGRATED');
  if (hostProjectContractPresent) signals.push('HOST_PROJECT_CONTRACT');
  if (pageStateResolutionClaimed) signals.push('PAGE_STATE_RESOLUTION_CONTRACT');
  if (implementationRoleDistinct) signals.push('IMPLEMENTATION_ROLE_DISTINCT_FROM_REFERENCE');

  const passCount =
    Number(featureManifestReconciled) +
    Number(compositionStatePrioritized) +
    Number(projectTruthIntegrated) +
    Number(hostProjectContractPresent) +
    Number(pageStateResolutionClaimed) +
    Number(implementationRoleDistinct);

  const result: ReferenceTranslationEvidenceResult =
    passCount >= 5 ? 'PASS'
    : passCount >= 3 ? 'REVIEW_REQUIRED'
    : 'FAIL';

  return {
    id: input.receiptId,
    renderId: input.render.id,
    referenceAuthorityId: input.reference.id,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    featureManifestReconciled,
    compositionStatePrioritized,
    projectTruthIntegrated,
    hostProjectContractPresent,
    pageStateResolutionClaimed,
    implementationRoleDistinct,
    signals,
    result,
    createdAt: new Date().toISOString(),
  };
}
