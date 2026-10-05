import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';
import type { AtomicCreativeGenerationResult } from './types.js';

export async function requestAtomicConceptGeneration(input: {
  session: ConceptDirectedTwinSession;
  conceptId: string;
  conceptVersionId: string;
  apiBase?: string;
}): Promise<{ ok: boolean; result: AtomicCreativeGenerationResult }> {
  const url = input.apiBase
    ? `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v2-atomic-concept-generation`
    : site00ClientApiUrl('/api/site00/twin-v2-atomic-concept-generation');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({
      session: input.session,
      conceptId: input.conceptId,
      conceptVersionId: input.conceptVersionId,
      founderConfirmedSpend: true,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Atomic generation failed (${res.status})`);
  }
  return res.json() as Promise<{ ok: boolean; result: AtomicCreativeGenerationResult }>;
}
