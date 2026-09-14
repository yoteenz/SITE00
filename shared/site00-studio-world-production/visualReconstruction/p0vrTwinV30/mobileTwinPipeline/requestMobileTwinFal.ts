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

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Match twin-v3-design-page-authority — `include` breaks CORS on Safari (Load failed).
      credentials: 'omit',
      body: JSON.stringify({
        session: input.session,
        action: input.action,
        founderConfirmedSpend: input.founderConfirmedSpend ?? true,
        refineNotes: input.refineNotes,
      }),
    });
  } catch {
    throw new Error(
      'MOBILE_RENDER_PROVIDER_FAILED: network — check api.site00.com is reachable (Railway redeploy v418+).',
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    session?: DesignPageAuthorityReviewSession;
    error?: string;
    falKeyConfigured?: boolean;
  };
  if (!res.ok) {
    const detail = data.error ?? `HTTP ${res.status}`;
    if (detail.includes('FAL_KEY_MISSING') || data.falKeyConfigured === false) {
      throw new Error('FAL_KEY_MISSING: set FAL_KEY on Railway (api.site00.com) and redeploy.');
    }
    throw new Error(detail);
  }
  if (!data.session) throw new Error('MOBILE_RENDER_PROVIDER_FAILED');
  return data.session;
}
