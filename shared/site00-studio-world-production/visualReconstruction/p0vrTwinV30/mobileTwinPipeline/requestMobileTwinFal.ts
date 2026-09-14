import type { DesignPageAuthorityReviewSession } from '../types.js';
import { site00ClientApiUrl } from '../../../site00ClientApiBase.js';
import type { MobileTwinPipelineState } from './types.js';
import {
  mergeMobileTwinFalApiResponse,
  stripSessionForMobileTwinFalRequest,
} from './mergeMobileTwinFalApiResponse.js';
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
        session: stripSessionForMobileTwinFalRequest(input.session),
        action: input.action,
        founderConfirmedSpend: input.founderConfirmedSpend ?? true,
        refineNotes: input.refineNotes,
      }),
    });
  } catch (cause) {
    const msg = cause instanceof Error ? cause.message : String(cause);
    if (msg.includes('Load failed') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error(
        'MOBILE_RENDER_PROVIDER_FAILED: network or timeout — keep this tab open and retry once (each strategy ~60–90s on Railway).',
      );
    }
    throw new Error(
      'MOBILE_RENDER_PROVIDER_FAILED: network — check api.site00.com is reachable (Railway redeploy v418+).',
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    session?: DesignPageAuthorityReviewSession;
    mobileTwinPipeline?: MobileTwinPipelineState | null;
    updatedAt?: string;
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
  if (data.mobileTwinPipeline) {
    return mergeMobileTwinFalApiResponse(input.session, data.mobileTwinPipeline, data.updatedAt);
  }
  if (data.session) {
    return mergeMobileTwinFalApiResponse(
      input.session,
      data.session.mobileTwinPipeline ?? null,
      data.session.updatedAt,
    );
  }
  throw new Error('MOBILE_RENDER_PROVIDER_FAILED: empty API response (retry or hard refresh Design tab).');
}
