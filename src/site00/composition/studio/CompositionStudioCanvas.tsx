import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EnvironmentalStage } from '../EnvironmentalStage';
import { normalizedRectToViewport } from '../engine';
import type { ViewportRect } from '../types';
import {
  computeSnapGuides,
  viewportRectToNormalized,
} from './coordinates';
import { getDisplayedBounds, objectToViewportRect, resolveObjectRect } from './objectLayout';
import type { CompositionStudioController } from './useCompositionStudio';
import { documentToEnvironmentMap, isCompositionEditable, type CompositionStudioObject } from './types';

type CompositionStudioCanvasProps = {
  controller: CompositionStudioController;
  backgroundUrl?: string | null;
};

type DragKind = 'move' | 'resize-se' | 'recompose-target';

export function CompositionStudioCanvas({ controller, backgroundUrl }: CompositionStudioCanvasProps) {
  const { doc, selectedId, mode, viewport, dispatch, dragSessionRef } = controller;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 390, h: 844 });
  const [guides, setGuides] = useState<{ axis: 'x' | 'y'; value: number; label: string }[]>([]);
  const [drag, setDrag] = useState<{
    id: string;
    kind: DragKind;
    startX: number;
    startY: number;
    startRect: ViewportRect;
  } | null>(null);

  const compositionMap = useMemo(() => documentToEnvironmentMap(doc), [doc]);
  const displayed = useMemo(
    () => getDisplayedBounds(doc.baseMap, size.w, size.h),
    [doc.baseMap, size.w, size.h],
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const objectViewportRects = useMemo(() => {
    const map = new Map<string, ViewportRect>();
    for (const obj of doc.objects) {
      map.set(obj.id, objectToViewportRect(obj, displayed, viewport));
    }
    return map;
  }, [doc.objects, displayed, viewport]);

  const zoneViewportRects = useMemo(() => {
    const map = new Map<string, ViewportRect>();
    for (const zone of doc.zones) {
      map.set(zone.id, normalizedRectToViewport(zone.rect, displayed));
    }
    return map;
  }, [doc.zones, displayed]);

  const showChrome = mode === 'edit' || mode === 'zones';
  const showZones = mode === 'zones' || mode === 'edit';
  const editable = isCompositionEditable(doc);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, obj: CompositionStudioObject, kind: DragKind = 'move') => {
      if (!editable || mode === 'preview' || mode === 'review') return;
      if (obj.positionLocked && kind === 'move') return;
      let dragKind = kind;
      if (obj.sourceType === 'environment-baked' && kind === 'move') {
        dragKind = 'recompose-target';
      }
      if (obj.sourceType !== 'environment-baked' && !obj.editableProperties.includes('position') && kind === 'move') {
        return;
      }
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = objectViewportRects.get(obj.id);
      if (!rect) return;
      dispatch({ type: 'SELECT', id: obj.id });
      dragSessionRef.current = { id: obj.id, startRect: resolveObjectRect(obj, viewport) };
      setDrag({ id: obj.id, kind: dragKind, startX: e.clientX, startY: e.clientY, startRect: { ...rect } });
      document.body.classList.add('composition-studio--manipulating');
    },
    [dispatch, dragSessionRef, editable, mode, objectViewportRects, viewport],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return;
      const obj = doc.objects.find((o) => o.id === drag.id);
      if (!obj) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      let nextViewport: ViewportRect = { ...drag.startRect };

      if (drag.kind === 'move') {
        nextViewport = { ...drag.startRect, left: drag.startRect.left + dx, top: drag.startRect.top + dy };
        const others = [...objectViewportRects.entries()]
          .filter(([id]) => id !== drag.id)
          .map(([, r]) => r);
        const snapped = computeSnapGuides(
          nextViewport,
          size.w,
          size.h,
          others,
          doc.focalPoints,
          displayed,
        );
        nextViewport = snapped.rect;
        setGuides(snapped.guides);
      } else if (drag.kind === 'resize-se') {
        nextViewport = {
          ...drag.startRect,
          width: Math.max(24, drag.startRect.width + dx),
          height: Math.max(16, drag.startRect.height + dy),
        };
      } else if (drag.kind === 'recompose-target') {
        nextViewport = { ...drag.startRect, left: drag.startRect.left + dx, top: drag.startRect.top + dy };
      }

      const normalized = viewportRectToNormalized(nextViewport, displayed);
      if (drag.kind === 'recompose-target') {
        dispatch({ type: 'REQUEST_RECOMPOSE', id: drag.id, targetBounds: normalized });
      } else {
        dispatch({ type: 'UPDATE_OBJECT_RECT', id: drag.id, rect: normalized, commit: false });
      }
    },
    [dispatch, doc.focalPoints, doc.objects, drag, displayed, objectViewportRects, size.h, size.w],
  );

  const onPointerUp = useCallback(() => {
    if (!drag) return;
    const obj = doc.objects.find((o) => o.id === drag.id);
    if (obj && drag.kind !== 'recompose-target') {
      dispatch({ type: 'UPDATE_OBJECT_RECT', id: drag.id, rect: obj.rect, commit: true });
    }
    setDrag(null);
    setGuides([]);
    dragSessionRef.current = null;
    document.body.classList.remove('composition-studio--manipulating');
  }, [dispatch, doc.objects, drag, dragSessionRef]);

  const onCanvasClick = useCallback(() => {
    dispatch({ type: 'SELECT', id: null });
  }, [dispatch]);

  const renderObject = (obj: CompositionStudioObject) => {
    const rect = objectViewportRects.get(obj.id);
    if (!rect || !obj.visible) return null;
    const isSelected = selectedId === obj.id;
    const isBaked = obj.sourceType === 'environment-baked';
    const isInterface = obj.objectClass === 'interface';

    return (
      <div
        key={obj.id}
        className={[
          'composition-studio__object',
          isInterface ? 'composition-studio__object--interface' : 'composition-studio__object--environment',
          isBaked ? 'composition-studio__object--baked' : '',
          isSelected ? 'composition-studio__object--selected' : '',
          obj.positionLocked ? 'composition-studio__object--locked' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          zIndex: obj.zIndex + 100,
        }}
        onPointerDown={(e) => onPointerDown(e, obj, 'move')}
        onClick={(e) => e.stopPropagation()}
        role="button"
        tabIndex={0}
        aria-label={obj.label}
      >
        {obj.text ? (
          <span
            className="composition-studio__object-text"
            style={{
              textAlign: obj.text.align,
              transform: obj.text.scale ? `scale(${obj.text.scale})` : undefined,
              transformOrigin: obj.text.align === 'center' ? 'center top' : 'left top',
            }}
          >
            {obj.text.content}
          </span>
        ) : (
          <span className="composition-studio__object-label">{obj.label}</span>
        )}
        {isBaked && obj.recompositionRequest ? (
          <span className="composition-studio__recompose-badge">RECOMPOSE PENDING</span>
        ) : null}
        {showChrome && isSelected && editable && !obj.positionLocked && !isBaked ? (
          <span
            className="composition-studio__resize-handle"
            onPointerDown={(e) => onPointerDown(e, obj, 'resize-se')}
          />
        ) : null}
        {showChrome && isSelected && isBaked ? (
          <span className="composition-studio__recompose-hint">Drag to set recompose target</span>
        ) : null}
      </div>
    );
  };

  const vanishingY =
    displayed.offsetY + (doc.focalPoints[0]?.y ?? 0.34) * displayed.height;

  return (
    <div
      ref={canvasRef}
      className="composition-studio__canvas-host"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onCanvasClick}
    >
      <EnvironmentalStage
        composition={compositionMap}
        backgroundUrl={backgroundUrl}
        fallbackClass="site00-assts-env-fallback--library"
        className="composition-studio__stage"
        showCompositionDebug={false}
      >
        <div className="composition-studio__canvas" aria-label="Composition canvas">
          {showZones
            ? doc.zones.map((zone) => {
                const zr = zoneViewportRects.get(zone.id);
                if (!zr) return null;
                return (
                  <div
                    key={zone.id}
                    className={`composition-studio__zone composition-studio__zone--${zone.type}`}
                    style={{ left: zr.left, top: zr.top, width: zr.width, height: zr.height }}
                  >
                    <span className="composition-studio__zone-label">{zone.label}</span>
                  </div>
                );
              })
            : null}

          {mode !== 'preview' && mode !== 'review'
            ? doc.architecturalGuides.map((g) => {
                const left = displayed.offsetX + g.x * displayed.width;
                const top = displayed.offsetY + g.y * displayed.height;
                return (
                  <span
                    key={g.id}
                    className={`composition-studio__guide composition-studio__guide--${g.kind}`}
                    style={{ left, top }}
                    title={g.label}
                  />
                );
              })
            : null}

          {guides.map((g, i) =>
            g.axis === 'x' ? (
              <span key={`g-${i}`} className="composition-studio__snap-guide composition-studio__snap-guide--x" style={{ left: g.value }} />
            ) : (
              <span key={`g-${i}`} className="composition-studio__snap-guide composition-studio__snap-guide--y" style={{ top: g.value }} />
            ),
          )}

          {[...doc.objects].sort((a, b) => a.zIndex - b.zIndex).map(renderObject)}

          {showChrome ? (
            <>
              <span
                className="composition-studio__axis composition-studio__axis--vertical"
                style={{ left: size.w / 2 }}
              />
              <span className="composition-studio__axis composition-studio__axis--horizontal" style={{ top: vanishingY }} />
            </>
          ) : null}
        </div>
      </EnvironmentalStage>
    </div>
  );
}

export function viewportPresetSize(viewport: 'mobile' | 'tablet' | 'desktop'): { w: number; h: number } {
  switch (viewport) {
    case 'tablet':
      return { w: 768, h: 1024 };
    case 'desktop':
      return { w: 1280, h: 800 };
    default:
      return { w: 390, h: 844 };
  }
}
