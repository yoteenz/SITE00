/**
 * P0.VR.6R8 — Direct-manipulation crop bounding box with 8 resize handles.
 */

import { useCallback, useRef } from 'react';
import type { NormalizedBbox } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/types.js';
import {
  applySnapAssist,
  moveBbox,
  normalizedBboxToPercentStyle,
  resizeBboxFromHandle,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderCropIntelligence/cropCoordinateTransform.js';

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'move';

type Props = {
  bbox: NormalizedBbox;
  snapTargets?: NormalizedBbox[];
  manualDrawMode?: boolean;
  onChange: (bbox: NormalizedBbox, action: 'FOUNDER_DRAG' | 'FOUNDER_RESIZE' | 'MANUAL_CROP') => void;
  onDrawStart?: () => void;
  pointerToNormalized: (clientX: number, clientY: number) => { x: number; y: number };
};

const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export function CropBoxOverlay({ bbox, snapTargets = [], manualDrawMode, onChange, onDrawStart, pointerToNormalized }: Props) {
  const dragRef = useRef<{
    mode: Handle;
    startBbox: NormalizedBbox;
    startPointer: { x: number; y: number };
    drawOrigin: { x: number; y: number } | null;
  } | null>(null);

  const pointerToNorm = useCallback(
    (clientX: number, clientY: number) => pointerToNormalized(clientX, clientY),
    [pointerToNormalized],
  );

  const onPointerDown = (mode: Handle) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pointer = pointerToNorm(e.clientX, e.clientY);
    dragRef.current = { mode, startBbox: bbox, startPointer: pointer, drawOrigin: null };
  };

  const onDrawPointerDown = (e: React.PointerEvent) => {
    if (!manualDrawMode) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const origin = pointerToNorm(e.clientX, e.clientY);
    onDrawStart?.();
    dragRef.current = { mode: 'se', startBbox: bbox, startPointer: origin, drawOrigin: origin };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const pointer = pointerToNorm(e.clientX, e.clientY);

    if (drag.drawOrigin) {
      const x = Math.min(drag.drawOrigin.x, pointer.x);
      const y = Math.min(drag.drawOrigin.y, pointer.y);
      const width = Math.abs(pointer.x - drag.drawOrigin.x);
      const height = Math.abs(pointer.y - drag.drawOrigin.y);
      onChange({ x, y, width: Math.max(0.02, width), height: Math.max(0.02, height) }, 'MANUAL_CROP');
      return;
    }

    let next: NormalizedBbox;
    if (drag.mode === 'move') {
      const dx = pointer.x - drag.startPointer.x;
      const dy = pointer.y - drag.startPointer.y;
      next = moveBbox(drag.startBbox, dx, dy);
      onChange(applySnapAssist(next, snapTargets), 'FOUNDER_DRAG');
      return;
    }

    next = resizeBboxFromHandle(drag.startBbox, drag.mode, pointer);
    onChange(applySnapAssist(next, snapTargets), 'FOUNDER_RESIZE');
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

  const style = normalizedBboxToPercentStyle(bbox);

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
