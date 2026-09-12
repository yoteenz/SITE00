/**
 * P0.VR.UPGRADE.2 — Internal twin banner (NOT LIVE).
 */

import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';

type Props = {
  session: ReconstructionTwinSession;
};

export function ReconstructionTwinBanner({ session }: Props) {
  return (
    <div className="site00-reconstruction-twin-banner" role="status" aria-live="polite">
      <strong>NOT LIVE</strong>
      <span>TWIN</span>
      <span>{session.sessionId.slice(-6).toUpperCase()}</span>
      {session.visualAuthorityStatus === 'FAILED_VISUAL_AUTHORITY' ||
      session.visualAuthorityStatus === 'VISUAL_AUTHORITY_FAILED' ? (
        <span className="site00-reconstruction-twin-banner__fail">FAILED VISUAL AUTHORITY</span>
      ) : null}
      {session.reconstructionStrategy ? <span>{session.reconstructionStrategy.replace(/_/g, ' ')}</span> : null}
    </div>
  );
}
