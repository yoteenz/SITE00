/**
 * P0.VR.REPLICATION.3D — Debug-only authority vs rendered bounds overlay.
 */

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { normToPx } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication3d/normalize.js';
import '../../styles/site00-geometry-grid-overlay.css';

type Props = {
  session?: ReconstructionTwinSession;
};

export function GeometryGridOverlay({ session }: Props) {
  const [params] = useSearchParams();
  const debug = params.get('geometryDebug') === '1';
  const map = session?.authorityCoordinateMap;
  const receipt = session?.geometryFidelityReceipts?.[0];

  const heroElements = useMemo(() => {
    if (!map) return [];
    return map.elements.filter(
      (e) => e.regionId === 'hero-editorial' && !e.elementId.startsWith('band:'),
    );
  }, [map]);

  if (!debug || !map) return null;

  const w = map.authorityWidthPx;
  const h = map.authorityHeightPx;

  return (
    <div className="site00-geo-overlay" aria-hidden="true">
      <p className="site00-geo-overlay__label">
        GEOMETRY DEBUG · {receipt?.withinToleranceCount ?? 0}/{receipt?.targetCount ?? 0} within tolerance · max err{' '}
        {receipt?.maxPositionError?.toFixed(1) ?? '—'}px
      </p>
      {heroElements.map((el) => {
        const left = normToPx(el.x, w);
        const top = normToPx(el.y, h);
        const width = normToPx(el.width, w);
        const height = normToPx(el.height, h);
        return (
          <div
            key={el.elementId}
            className="site00-geo-overlay__rect"
            style={{ left, top, width, height }}
            title={el.elementId}
          />
        );
      })}
    </div>
  );
}
