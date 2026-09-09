/**
 * SKINS multi-asset reconstruction dispatch client.
 */

import { apiFetch } from '../../../utils/api.js';

export type SkinsDispatchResult = {
  ok: boolean;
  outputUrl: string | null;
  error?: string;
  retryAvailable?: boolean;
};

export async function dispatchSkinsCandidateGeneration(input: {
  candidateId: string;
  sourceCropUrl: string;
  prompt: string;
  brandKey: string;
}): Promise<SkinsDispatchResult> {
  try {
    const res = await apiFetch('/api/site00/design-asset-reconstruction?action=dispatch_skins_candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'dispatch_skins_candidate',
        ...input,
        explicitFounderAction: true,
      }),
    });
    const data = (await res.json()) as SkinsDispatchResult;
    return data;
  } catch (err) {
    return {
      ok: false,
      outputUrl: null,
      error: err instanceof Error ? err.message : 'DISPATCH_FAILED',
      retryAvailable: true,
    };
  }
}
