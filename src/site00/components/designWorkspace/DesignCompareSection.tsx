/**
 * P0.VR.2B — Compare section with slider + phone frames.
 */

import { useState } from 'react';
import { DesignVisualMatchPanel } from './DesignVisualMatchPanel';
import type { VisualMatchResult } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';

type Props = {
  referenceUrl: string | null;
  referenceVersion: number | null;
  livePreviewUrl: string;
  viewportWidth: number;
  viewportHeight: number;
  visualMatch: VisualMatchResult;
  onViewDetails?: () => void;
};

export function DesignCompareSection({
  referenceUrl,
  referenceVersion,
  livePreviewUrl,
  viewportWidth,
  viewportHeight,
  visualMatch,
  onViewDetails,
}: Props) {
  const [slider, setSlider] = useState(50);
  const frameHeight = Math.min(viewportHeight, 520);

  return (
    <section className="site00-dw-compare" data-visual-reconstruction="p0vr2b-compare">
      <div className="site00-dw-compare__head">
        <h2>COMPARE</h2>
        <label className="site00-dw-compare__slider-label">
          Slide to compare
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            className="site00-dw-compare__slider-input"
          />
        </label>
      </div>

      <div className="site00-dw-compare__grid">
        <figure className="site00-dw-compare__phone">
          <figcaption>
            REFERENCE{referenceVersion ? ` · CANONICAL v${referenceVersion}` : ''}
          </figcaption>
          <div className="site00-dw-compare__device" style={{ width: viewportWidth, height: frameHeight }}>
            {referenceUrl ? (
              <img src={referenceUrl} alt="Canonical reference" className="site00-dw-compare__shot" />
            ) : (
              <div className="site00-dw-compare__empty">No reference</div>
            )}
          </div>
        </figure>

        <figure className="site00-dw-compare__phone">
          <figcaption>LIVE IMPLEMENTATION · {viewportWidth}×{viewportHeight}</figcaption>
          <div
            className="site00-dw-compare__device site00-dw-compare__device--live"
            style={{ width: viewportWidth, height: frameHeight }}
          >
            <iframe title="Live implementation" src={livePreviewUrl} className="site00-dw-compare__iframe" />
            {referenceUrl ? (
              <div
                className="site00-dw-compare__reveal"
                style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
              >
                <img src={referenceUrl} alt="" className="site00-dw-compare__shot" aria-hidden />
              </div>
            ) : null}
            <div className="site00-dw-compare__slider-handle" style={{ left: `${slider}%` }} aria-hidden />
          </div>
        </figure>

        <DesignVisualMatchPanel match={visualMatch} onViewDetails={onViewDetails} />
      </div>
    </section>
  );
}
