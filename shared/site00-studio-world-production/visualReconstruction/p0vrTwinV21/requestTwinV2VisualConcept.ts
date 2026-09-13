import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
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
  const url = input.apiBase
    ? `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v2-visual-concept`
    : site00ClientApiUrl('/api/site00/twin-v2-visual-concept');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify({
      action: input.action,
      session: input.session,
      refineInstruction: input.refineInstruction ?? null,
      refineRegion: input.refineRegion ?? null,
      founderConfirmedSpend: true,
      }),
    });
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : 'Network error';
    throw new Error(
      `${msg} — could not reach ${url}. Check mobile network or API host (api.site00.com).`,
    );
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    const hint =
      res.status === 404
        ? ` — endpoint missing on ${url.split('/api/')[0] || 'API host'}; redeploy Railway API from main if using api.site00.com`
        : '';
    throw new Error(err.error ?? `Visual concept request failed (${res.status})${hint}`);
  }
  return res.json() as Promise<TwinV2VisualConceptResponse>;
}
