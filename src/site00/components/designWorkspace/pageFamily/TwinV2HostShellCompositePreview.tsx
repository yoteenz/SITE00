/**
 * P0.VR.TWINV2.2R2 — Product composite: real SITE 00 host + generated client canvas (not a new GPT image).
 */

import { TwinSite00HostBottomNav } from '../../reconstruction/TwinSite00HostBottomNav.js';

type Props = {
  projectSlug: string;
  clientCanvasImageUrl: string | null;
};

export function TwinV2HostShellCompositePreview({ projectSlug, clientCanvasImageUrl }: Props) {
  return (
    <div className="site00-twin-v2-host-composite" data-preview="host-shell-composite">
      <header className="site00-twin-v2-ndx__host">
        <span className="site00-twin-v2-ndx__host-label">SITE 00</span>
        <span className="site00-twin-v2-ndx__host-route">{projectSlug.toUpperCase()}</span>
      </header>
      <div className="site00-twin-v2-ndx__client-canvas site00-twin-v2-host-composite__canvas">
        {clientCanvasImageUrl ? (
          <img src={clientCanvasImageUrl} alt="NDXBOOK client canvas authority" draggable={false} />
        ) : (
          <p className="site00-twin-v2-host-composite__empty">No client canvas image</p>
        )}
      </div>
      <TwinSite00HostBottomNav />
    </div>
  );
}
