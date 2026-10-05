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
  action?: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'REGENERATE_TERRITORY';
  territoryScope?: 'ALL' | 'A' | 'B' | 'C';
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
      territoryScope: input.territoryScope ?? 'ALL',
      founderConfirmedSpend: input.founderConfirmedSpend ?? true,
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Design page authority generation failed (${res.status})`);
  }
  const data = (await res.json()) as DesignPageAuthorityApiResponse;
  if (!data.ok || !data.result) {
    throw new Error('DESIGN_PAGE_AUTHORITY_BAD_RESPONSE: missing result payload');
  }
  if (!Array.isArray(data.result.territories) || data.result.territories.length === 0) {
    throw new Error(
      'DESIGN_PAGE_AUTHORITY_EMPTY_TERRITORIES: FAL batch returned no territory frames — check Railway deploy and FAL_KEY',
    );
  }
  return data;
}
