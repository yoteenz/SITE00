/**
 * B5.9R9 — Red account identity eyebrow above Projects page title.
 */

import type { AccountDisplayIdentity } from '../../../../shared/site00-projects/accountDisplayIdentity.js';
import { accountEyebrowIsSafe } from '../../../../shared/site00-projects/accountDisplayIdentity.js';

export type AccountIdentityEyebrowProps = {
  identity: AccountDisplayIdentity;
  eyebrow: string;
};

export function AccountIdentityEyebrow({ identity, eyebrow }: AccountIdentityEyebrowProps) {
  const label = accountEyebrowIsSafe(eyebrow) ? eyebrow : identity.viewMode === 'CLIENT' ? 'CLIENT /' : 'ACCOUNT /';

  return (
    <p className="site00-pidx-hero__kicker">
      <span className="site00-pidx-hero__kicker-red">{label}</span>
    </p>
  );
}
