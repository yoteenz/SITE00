import type { DesignPageAuthorityReviewSession } from '../types.js';
import { requestMobileTwinFal } from './requestMobileTwinFal.js';

/** Phase A — real FAL mobile implementation render (no LOCAL_COMPILER fallback). */
export async function runGenerateMobileImplementationRender(
  session: DesignPageAuthorityReviewSession,
  options?: { apiBase?: string; founderConfirmedSpend?: boolean },
): Promise<DesignPageAuthorityReviewSession> {
  return requestMobileTwinFal({
    session,
    action: 'GENERATE_MOBILE_RENDER',
    apiBase: options?.apiBase,
    founderConfirmedSpend: options?.founderConfirmedSpend ?? true,
  });
}
