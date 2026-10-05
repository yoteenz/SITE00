import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER } from '../constants.js';
import {
  TWIN_BENCHMARK_PROMPT_CONTRACT_VERSION,
  TWIN_BENCHMARK_VERSION,
} from '../../../../site00-visual-generation/twinProviderBenchmarkCatalog.js';
import type { TwinCapabilityTestCompositionSnapshot } from './twinCapabilityTestTypes.js';
import type { TwinProviderBenchmarkSnapshot } from './twinProviderBenchmarkTypes.js';

export function buildTwinProviderBenchmarkSnapshot(input: {
  benchmarkId: string;
  capabilitySnapshot: TwinCapabilityTestCompositionSnapshot;
}): TwinProviderBenchmarkSnapshot {
  return {
    id: `tpbs-${input.benchmarkId}`,
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
    promptContractVersion: TWIN_BENCHMARK_PROMPT_CONTRACT_VERSION,
    benchmarkVersion: TWIN_BENCHMARK_VERSION,
    createdAt: new Date().toISOString(),
    status: 'FROZEN',
  };
}

export function providerBenchmarkIdempotencyKey(
  snapshotId: string,
  model: string,
  benchmarkVersion: string,
): string {
  return `provider-benchmark:${snapshotId}:${model}:${benchmarkVersion}`;
}
