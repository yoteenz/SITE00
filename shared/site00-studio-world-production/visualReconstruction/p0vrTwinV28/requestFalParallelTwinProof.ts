import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { FalParallelTwinProofBundle } from './types.js';

export type FalParallelTwinProofResponse = {
  ok: boolean;
  bundle: FalParallelTwinProofBundle;
  falKeyConfigured: boolean;
};

export async function requestFalParallelTwinProof(input: {
  session: ConceptDirectedTwinSession;
  conceptId: string;
  conceptVersionId: string;
  runAssetProof?: boolean;
  apiBase?: string;
}): Promise<FalParallelTwinProofResponse> {
  const url = input.apiBase
    ? `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v2-fal-parallel-twin-proof`
    : site00ClientApiUrl('/api/site00/twin-v2-fal-parallel-twin-proof');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({
      session: input.session,
      conceptId: input.conceptId,
      conceptVersionId: input.conceptVersionId,
      runAssetProof: input.runAssetProof ?? true,
      founderConfirmedSpend: true,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `FAL parallel twin proof failed (${res.status})`);
  }
  return res.json() as Promise<FalParallelTwinProofResponse>;
}
