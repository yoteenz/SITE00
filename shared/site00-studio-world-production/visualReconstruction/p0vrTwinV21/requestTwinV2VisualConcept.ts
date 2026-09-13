import type { ConceptDirectedTwinSession } from './types.js';

export type TwinV2VisualConceptResponse = {
  ok: boolean;
  provider: string;
  model: string;
  promptDigest: string;
  imageUrl: string;
  imageStorageRef: string | null;
};

export async function requestTwinV2VisualConcept(input: {
  action: 'generate' | 'regenerate' | 'refine';
  session: ConceptDirectedTwinSession;
  refineInstruction?: string | null;
  refineRegion?: string | null;
  apiBase?: string;
}): Promise<TwinV2VisualConceptResponse> {
  const base = input.apiBase ?? import.meta.env.VITE_API_BASE ?? '';
  const url = `${base.replace(/\/$/, '')}/api/site00/twin-v2-visual-concept`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      action: input.action,
      session: input.session,
      refineInstruction: input.refineInstruction ?? null,
      refineRegion: input.refineRegion ?? null,
      founderConfirmedSpend: true,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Visual concept request failed (${res.status})`);
  }
  return res.json() as Promise<TwinV2VisualConceptResponse>;
}
