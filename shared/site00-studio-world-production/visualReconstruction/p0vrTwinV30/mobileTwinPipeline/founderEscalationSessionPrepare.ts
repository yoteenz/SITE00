import type { DesignPageAuthorityReviewSession } from '../types.js';
import { applyOneTimeFounderAuthorityInjection } from '../founderAuthorityInjection.js';
import { ensureMobileDesignReferenceAuthority } from './mobileDesignReferenceAuthority.js';

/** Inject founder authority when mobile design reference is missing (escalation / autobuild). */
export function ensureSessionReadyForFounderEscalation(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  try {
    return ensureMobileDesignReferenceAuthority(session);
  } catch {
    return ensureMobileDesignReferenceAuthority(applyOneTimeFounderAuthorityInjection(session));
  }
}
