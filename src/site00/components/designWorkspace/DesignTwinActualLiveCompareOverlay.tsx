import { useState } from 'react';
import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';
import { MobileTwinCompiledImplementationRenderer } from './MobileTwinCompiledImplementationRenderer.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
  actualAuthorityUri: string | null | undefined;
};

export function DesignTwinActualLiveCompareOverlay({ document, actualAuthorityUri }: Props) {
  const [overlayOpacity, setOverlayOpacity] = useState(0.45);
  const [flicker, setFlicker] = useState(false);
  const [inspectRegion, setInspectRegion] = useState<string>('HERO_WORKSPACE');

  const drifts = document.actualToLiveRegionDrifts ?? [];

  return (
    <div
      className={`site00-twin-af-compare${flicker ? ' is-flicker' : ''}`}
      data-testid="twin-actual-live-compare"
    >
      <div className="site00-dw-v3-twin-impl-review__modes">
        <button type="button" data-testid="compare-side-by-side" onClick={() => setFlicker(false)}>
          SIDE BY SIDE
        </button>
        <button type="button" data-testid="compare-flicker" onClick={() => setFlicker((v) => !v)}>
          FLICKER {flicker ? 'ON' : 'OFF'}
        </button>
        <label>
          OVERLAY OPACITY
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={overlayOpacity}
            data-testid="compare-overlay-opacity"
            onChange={(e) => setOverlayOpacity(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="site00-twin-af-compare__panel">
        <div data-testid="compare-actual-panel">
          <p className="site00-dw-v3-authority__hint">ACTUAL AUTHORITY (QA reference — not runtime raster)</p>
          {actualAuthorityUri ?
            <img src={actualAuthorityUri} alt="Approved actual authority" style={{ width: '100%', display: 'block' }} />
          : <p>Actual URI unavailable in preview.</p>}
        </div>
        <div className="site00-twin-af-compare__overlay" data-testid="compare-live-panel">
          <p className="site00-dw-v3-authority__hint">LIVE IMPLEMENTATION</p>
          <MobileTwinCompiledImplementationRenderer document={document} />
          {actualAuthorityUri && overlayOpacity > 0 ?
            <div
              className="site00-twin-af-compare__overlay-live"
              data-testid="compare-overlay-layer"
              style={{
                opacity: flicker ? 1 : overlayOpacity,
                background: `url(${actualAuthorityUri}) center top / contain no-repeat`,
              }}
            />
          : null}
        </div>
      </div>
      <label>
        REGION INSPECTION
        <select
          data-testid="compare-region-inspect"
          value={inspectRegion}
          onChange={(e) => setInspectRegion(e.target.value)}
        >
          {drifts.map((d) => (
            <option key={d.regionId} value={d.regionId}>
              {d.regionId} ({d.severity})
            </option>
          ))}
        </select>
      </label>
      {drifts.find((d) => d.regionId === inspectRegion) ?
        <p data-testid="compare-region-drift-detail">
          {drifts.find((d) => d.regionId === inspectRegion)?.recommendedCorrection}
        </p>
      : null}
    </div>
  );
}
