import type { MobileDesignReferenceAuthority, MobileTwinCompositionState } from './types.js';
import type { TwinCapabilityTestCompositionSnapshot } from './twinCapabilityTestTypes.js';

export function buildTwinCapabilityTestCompositionSnapshot(input: {
  testId: string;
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
}): TwinCapabilityTestCompositionSnapshot {
  return {
    id: `tcts-${input.testId}`,
    referenceAuthorityId: input.reference.id,
    referenceHash: input.reference.sourceImageHash,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    featureManifestVersion: input.composition.featureManifestVersion,
    projectContextVersion: input.composition.projectCreativeContextVersion,
    hostProjectContractVersion: input.composition.hostProjectContractVersion,
    createdAt: new Date().toISOString(),
    status: 'FROZEN',
  };
}
