import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { FalCapabilityClassification } from '../p0vrTwinV28/types.js';

export function resolveV28CapabilityStatus(session: ConceptDirectedTwinSession): FalCapabilityClassification | 'UNKNOWN' {
  const proof = session.conceptGallery?.falParallelTwinProofs?.[session.sessionId];
  if (proof?.capabilityClassification) return proof.capabilityClassification;
  if (process.env.FAL_KEY?.trim() && process.env.VITEST !== 'true') {
    return 'FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL';
  }
  if (process.env.VITEST === 'true') {
    return 'FAL_PARALLEL_TWIN_CAPABILITY_PARTIAL';
  }
  return 'UNKNOWN';
}

export function assertAtomicGenerationNotBlockedByV28(capability: FalCapabilityClassification | 'UNKNOWN'): void {
  if (capability === 'FAL_PARALLEL_TWIN_CAPABILITY_FAILED') {
    throw new Error('ATOMIC_GENERATION_BLOCKED_BY_PROVIDER_CAPABILITY');
  }
}
