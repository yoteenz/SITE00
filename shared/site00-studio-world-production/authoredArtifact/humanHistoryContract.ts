/**
 * P0.5C.6A — ArtifactHumanHistoryContract builder (generic).
 */

import { createHash } from 'node:crypto';
import type { ArtifactHumanHistoryContract } from './types.js';
import type { AuthoredArtifactAdapterOutput } from './types.js';

export function buildArtifactHumanHistoryContract(params: {
  artifactId: string;
  adapter: AuthoredArtifactAdapterOutput;
}): ArtifactHumanHistoryContract {
  const h = params.adapter.humanHistory;
  const contract: ArtifactHumanHistoryContract = {
    contractId: `ahh-${params.artifactId}`,
    artifactId: params.artifactId,
    whatExistedFirst: h.whatExistedFirst,
    whatAuthorDid: h.whatAuthorDid,
    whatChangedAfterReview: h.whatChangedAfterReview,
    survivingProcessTrace: h.survivingProcessTrace,
    traceType: h.traceType,
    causalReason: h.causalReason,
    fingerprint: '',
  };
  contract.fingerprint = createHash('sha256').update(JSON.stringify(contract)).digest('hex').slice(0, 16);
  return contract;
}

export function humanHistoryHasCausalMeaning(contract: ArtifactHumanHistoryContract): boolean {
  return Boolean(contract.causalReason && contract.survivingProcessTrace);
}
