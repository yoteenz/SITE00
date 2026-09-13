import { site00ClientApiUrl } from '../../site00ClientApiBase.js';
import type { DesignPageAuthorityGenerationResult, DesignPageAuthorityReviewSession } from './types.js';

export type DesignPageAuthorityApiResponse = {
  ok: boolean;
  result: DesignPageAuthorityGenerationResult;
  session: DesignPageAuthorityReviewSession;
  falKeyConfigured: boolean;
};

export async function requestDesignPageAuthorityGeneration(input: {
  session: DesignPageAuthorityReviewSession;
  action?: 'GENERATE' | 'REFINE' | 'REGENERATE';
  founderConfirmedSpend?: boolean;
  apiBase?: string;
}): Promise<DesignPageAuthorityApiResponse> {
  const url = input.apiBase
    ? `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v3-design-page-authority`
    : site00ClientApiUrl('/api/site00/twin-v3-design-page-authority');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({
      session: input.session,
      action: input.action ?? 'GENERATE',
      founderConfirmedSpend: input.founderConfirmedSpend ?? true,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Design page authority generation failed (${res.status})`);
  }
  return res.json() as Promise<DesignPageAuthorityApiResponse>;
}
