import type { DesignPageAuthorityReviewSession } from '../types.js';
import { requestMobileTwinFal } from './requestMobileTwinFal.js';
import { assertMobileTwinPackagePreconditions } from './runGenerateMobileTwinPackageCore.js';

/** Phase B — FAL blueprint twin + structured package (browser/API). */
export async function runGenerateMobileTwinPackage(
  session: DesignPageAuthorityReviewSession,
  options?: { apiBase?: string; founderConfirmedSpend?: boolean },
): Promise<DesignPageAuthorityReviewSession> {
  assertMobileTwinPackagePreconditions(session);
  return requestMobileTwinFal({
    session,
    action: 'GENERATE_MOBILE_TWIN_PACKAGE',
    apiBase: options?.apiBase,
    founderConfirmedSpend: options?.founderConfirmedSpend ?? true,
  });
}

export function canGenerateMobileTwinPackage(session: DesignPageAuthorityReviewSession): boolean {
  const p = session.mobileTwinPipeline;
  const render = p?.activeRenderId ? p.renders.find((r) => r.id === p.activeRenderId) : null;
  const realRender = render?.renderMode === 'REAL_PROVIDER_RENDER' || render?.provider === 'FAL';
  return (
    Boolean(p?.renderGate === 'FROZEN' || p?.renderGate === 'APPROVED') &&
    Boolean(p?.implementationVisualAuthority) &&
    Boolean(realRender)
  );
}
