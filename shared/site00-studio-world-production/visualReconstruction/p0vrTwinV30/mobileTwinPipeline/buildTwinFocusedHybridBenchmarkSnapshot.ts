import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../constants.js';
import {
  TWIN_FOCUSED_HYBRID_PROMPT_CONTRACT_VERSION,
  TWIN_FOCUSED_HYBRID_SPRINT_VERSION,
} from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import type { TwinCapabilityTestCompositionSnapshot } from './twinCapabilityTestTypes.js';
import type { TwinProviderBenchmarkSnapshot } from './twinProviderBenchmarkTypes.js';
import type { TwinFocusedHybridBenchmarkSnapshot } from './twinFocusedHybridBenchmarkTypes.js';

export function buildTwinFocusedHybridBenchmarkSnapshot(input: {
  benchmarkId: string;
  capabilitySnapshot: TwinCapabilityTestCompositionSnapshot;
  sourceBenchmarkSnapshot?: TwinProviderBenchmarkSnapshot | null;
}): TwinFocusedHybridBenchmarkSnapshot {
  return {
    id: `tfhbs-${input.benchmarkId}`,
    referenceAuthorityId: input.capabilitySnapshot.referenceAuthorityId,
    referenceHash: input.capabilitySnapshot.referenceHash,
    compositionStateId: input.capabilitySnapshot.compositionStateId,
    compositionHash: input.capabilitySnapshot.compositionHash,
    featureManifestVersion: input.capabilitySnapshot.featureManifestVersion,
    projectContextVersion: input.capabilitySnapshot.projectContextVersion,
    hostProjectContractVersion: input.capabilitySnapshot.hostProjectContractVersion,
    viewport: 'MOBILE',
    outputWidthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    outputHeightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    promptContractVersion: TWIN_FOCUSED_HYBRID_PROMPT_CONTRACT_VERSION,
    sprintVersion: TWIN_FOCUSED_HYBRID_SPRINT_VERSION,
    sourceBenchmarkSnapshotId: input.sourceBenchmarkSnapshot?.id ?? null,
    createdAt: new Date().toISOString(),
    status: 'FROZEN',
  };
}
