/**
 * P0.VR.6 — Compact viewport segmented control.
 */

import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';

const VIEWPORTS: DesignViewportClass[] = ['mobile', 'tablet', 'desktop'];

type Props = {
  viewport: DesignViewportClass;
  onViewportChange: (vp: DesignViewportClass) => void;
  pipelineLabel?: boolean;
};

export function DesignWorkspaceViewportRail({ viewport, onViewportChange, pipelineLabel }: Props) {
  return (
    <div className="site00-dw-v3-viewport-rail">
      <div className="site00-dw-v3-viewport-rail__left">
        <span className="site00-dw-v3-viewport-rail__label">VIEWPORT</span>
        <div className="site00-dw-v3-viewport-segment" role="group" aria-label="Viewport">
          {VIEWPORTS.map((vp) => (
            <button
              key={vp}
              type="button"
              className={`site00-dw-v3-viewport-segment__btn${viewport === vp ? ' is-active' : ''}`}
              onClick={() => onViewportChange(vp)}
              aria-pressed={viewport === vp}
            >
              {vp.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {pipelineLabel ? (
        <div className="site00-dw-v3-viewport-rail__pipeline">
          <span>ASSET PIPELINE</span>
          <small>TURN REFERENCES INTO REALITY.</small>
        </div>
      ) : null}
    </div>
  );
}
