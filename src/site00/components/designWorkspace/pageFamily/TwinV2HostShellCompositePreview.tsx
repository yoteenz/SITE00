/**
 * P0.VR.TWINV2.2R2 + 2R2R2 — Real host shell + trimmed execution client canvas.
 */

import { TwinSite00HostBottomNav } from '../../reconstruction/TwinSite00HostBottomNav.js';
import type { ClientCanvasBoundary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/computeClientCanvasBoundary.js';
import { TwinV2ExecutionClientCanvasFrame } from './TwinV2ExecutionClientCanvasFrame.js';

type Props = {
  projectSlug: string;
  clientCanvasImageUrl: string | null;
  clientCanvasBoundary: ClientCanvasBoundary | null;
};

export function TwinV2HostShellCompositePreview({
  projectSlug,
  clientCanvasImageUrl,
  clientCanvasBoundary,
}: Props) {
  return (
    <div className="site00-twin-v2-host-composite" data-preview="host-shell-composite">
      <header className="site00-twin-v2-ndx__host">
        <span className="site00-twin-v2-ndx__host-label">SITE 00</span>
        <span className="site00-twin-v2-ndx__host-route">{projectSlug.toUpperCase()}</span>
      </header>
      <div className="site00-twin-v2-host-composite__canvas site00-twin-v2-host-composite__canvas--trimmed">
        {clientCanvasImageUrl && clientCanvasBoundary ? (
          <TwinV2ExecutionClientCanvasFrame imageUrl={clientCanvasImageUrl} boundary={clientCanvasBoundary} />
        ) : clientCanvasImageUrl ? (
          <p className="site00-twin-v2-host-composite__empty">Client canvas boundary missing — reload gallery</p>
        ) : (
          <p className="site00-twin-v2-host-composite__empty">No client canvas image</p>
        )}
      </div>
      <TwinSite00HostBottomNav />
    </div>
  );
}
