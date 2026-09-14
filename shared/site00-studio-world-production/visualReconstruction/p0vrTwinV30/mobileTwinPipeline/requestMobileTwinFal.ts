import type { DesignPageAuthorityReviewSession } from '../types.js';
import { site00ClientApiUrl } from '../../../site00ClientApiBase.js';
import type { MobileTwinFalAction } from './runMobileTwinFalPipeline.js';

export async function requestMobileTwinFal(input: {
  session: DesignPageAuthorityReviewSession;
  action: MobileTwinFalAction;
  apiBase?: string;
  founderConfirmedSpend?: boolean;
  refineNotes?: string[];
}): Promise<DesignPageAuthorityReviewSession> {
  const url =
    input.apiBase ?
      `${input.apiBase.replace(/\/$/, '')}/api/site00/twin-v3-mobile-twin-pipeline`
    : site00ClientApiUrl('/api/site00/twin-v3-mobile-twin-pipeline');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      session: input.session,
      action: input.action,
      founderConfirmedSpend: input.founderConfirmedSpend ?? true,
      refineNotes: input.refineNotes,
    }),
  });

  const data = (await res.json()) as { session?: DesignPageAuthorityReviewSession; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? 'MOBILE_RENDER_PROVIDER_FAILED');
  }
  if (!data.session) throw new Error('MOBILE_RENDER_PROVIDER_FAILED');
  return data.session;
}
