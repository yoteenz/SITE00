/**
 * P0.VR.6R9 — Direct-manipulation crop box derived from canonical source rect.
 */

import { useCallback, useRef } from 'react';
import type { CanonicalCropRect } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/canonicalCropRect.js';
import {
  applySnapAssistSource,
  moveCanonical,
  resizeCanonicalFromHandle,
  screenPointToSourcePoint,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';
import type { OverlayCssRect } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';
import type { RenderedImageGeometry } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/renderedImageGeometry.js';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'move';

type Props = {
  canonical: CanonicalCropRect;
  overlayCss: OverlayCssRect;
  geometry: RenderedImageGeometry;
  snapTargets?: CanonicalCropRect[];
  manualDrawMode?: boolean;
  onCanonicalChange: (crop: CanonicalCropRect, action: 'FOUNDER_DRAG' | 'FOUNDER_RESIZE' | 'MANUAL_CROP') => void;
  onDrawStart?: () => void;
};

const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export function CropBoxOverlay({
  canonical,
  overlayCss,
  geometry,
  snapTargets = [],
  manualDrawMode,
  onCanonicalChange,
  onDrawStart,
}: Props) {
  const dragRef = useRef<{
    mode: Handle;
    startCanonical: CanonicalCropRect;
    startSource: { sourceX: number; sourceY: number };
    drawOrigin: { sourceX: number; sourceY: number } | null;
  } | null>(null);

  const pointerToSource = useCallback(
    (clientX: number, clientY: number) => screenPointToSourcePoint(clientX, clientY, geometry),
    [geometry],
  );

  const onPointerDown = (mode: Handle) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pointer = pointerToSource(e.clientX, e.clientY);
    dragRef.current = { mode, startCanonical: canonical, startSource: pointer, drawOrigin: null };
  };

  const onDrawPointerDown = (e: React.PointerEvent) => {
    if (!manualDrawMode) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const origin = pointerToSource(e.clientX, e.clientY);
    onDrawStart?.();
    dragRef.current = { mode: 'se', startCanonical: canonical, startSource: origin, drawOrigin: origin };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pointer = pointerToSource(e.clientX, e.clientY);

    if (drag.drawOrigin) {
      const x = Math.min(drag.drawOrigin.sourceX, pointer.sourceX);
      const y = Math.min(drag.drawOrigin.sourceY, pointer.sourceY);
      const width = Math.abs(pointer.sourceX - drag.drawOrigin.sourceX);
      const height = Math.abs(pointer.sourceY - drag.drawOrigin.sourceY);
      onCanonicalChange(
        applySnapAssistSource(
          {
            ...canonical,
            x,
            y,
            width: Math.max(8, width),
            height: Math.max(8, height),
          },
          snapTargets,
        ),
        'MANUAL_CROP',
      );
      return;
    }

    if (drag.mode === 'move') {
      const dx = pointer.sourceX - drag.startSource.sourceX;
      const dy = pointer.sourceY - drag.startSource.sourceY;
      onCanonicalChange(applySnapAssistSource(moveCanonical(drag.startCanonical, dx, dy), snapTargets), 'FOUNDER_DRAG');
      return;
    }

    onCanonicalChange(
      applySnapAssistSource(resizeCanonicalFromHandle(drag.startCanonical, drag.mode, pointer), snapTargets),
      'FOUNDER_RESIZE',
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: overlayCss.left,
    top: overlayCss.top,
    width: overlayCss.width,
    height: overlayCss.height,
    border: '2px solid rgba(255, 70, 50, 0.95)',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.42)',
    cursor: 'move',
    touchAction: 'none',
  };

  return (
    <>
      {manualDrawMode ? (
        <div
          className="site00-dw-crop-box__draw-layer"
          onPointerDown={onDrawPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      ) : null}
      <div
        className="site00-dw-crop-box"
        style={style}
        onPointerDown={onPointerDown('move')}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {HANDLES.map((h) => (
          <span
            key={h}
            className={`site00-dw-crop-box__handle site00-dw-crop-box__handle--${h}`}
            onPointerDown={onPointerDown(h)}
          />
        ))}
      </div>
    </>
  );
}
