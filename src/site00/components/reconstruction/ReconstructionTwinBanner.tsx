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
      <strong>RECONSTRUCTION TWIN</strong>
      <span>NOT LIVE</span>
      <span>{session.pageId.split(':').pop() ?? session.pageId}</span>
      <span>{session.viewport.toUpperCase()}</span>
      <span>{session.sessionId.slice(-8).toUpperCase()}</span>
      <span>{session.status.replace(/_/g, ' ')}</span>
    </div>
  );
}
