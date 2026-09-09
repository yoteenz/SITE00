/**
 * B5.9R9 / B5.9R9R1 — Red account identity eyebrow above Projects page title.
 */

import type { AccountDisplayIdentity } from '../../../../shared/site00-projects/accountDisplayIdentity.js';
import { accountEyebrowIsSafe } from '../../../../shared/site00-projects/accountDisplayIdentity.js';

export type AccountIdentityEyebrowProps = {
  identity: AccountDisplayIdentity;
  eyebrow: string | null;
};

export function AccountIdentityEyebrow({ identity, eyebrow }: AccountIdentityEyebrowProps) {
  const isLoading = identity.resolutionStatus === 'LOADING';
  const fallback = identity.viewMode === 'CLIENT' ? 'CLIENT /' : 'ACCOUNT /';
  const label = isLoading ? '\u00A0\u00A0\u00A0 /' : accountEyebrowIsSafe(eyebrow ?? '') ? eyebrow! : fallback;

  return (
    <p className="site00-pidx-hero__kicker" aria-busy={isLoading}>
      <span className={`site00-pidx-hero__kicker-red${isLoading ? ' is-hydrating' : ''}`}>{label}</span>
    </p>
  );
}
