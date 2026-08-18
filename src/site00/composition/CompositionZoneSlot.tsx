import { useEffect, useRef, type ReactNode } from 'react';
import { useCompositionStage } from './EnvironmentalStage';
import type { ViewportRect } from './types';

type CompositionZoneSlotProps = {
  zoneId: string;
  overlayId: string;
  persistent?: boolean;
  className?: string;
  children: ReactNode;
};

/** Absolutely positions children within a composition zone; registers for collision checks. */
export function CompositionZoneSlot({
  zoneId,
  overlayId,
  persistent = true,
  className = '',
  children,
}: CompositionZoneSlotProps) {
  const { zoneRects, registerOverlay } = useCompositionStage();
  const ref = useRef<HTMLDivElement>(null);
  const rect = zoneRects.get(zoneId);

  useEffect(() => {
    if (!persistent) return;
    const el = ref.current;
    if (!el) return;

    const report = () => {
      const stage = el.closest('.environmental-stage');
      if (!stage) return;
      const stageRect = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const overlayRect: ViewportRect = {
        left: r.left - stageRect.left,
        top: r.top - stageRect.top,
        width: r.width,
        height: r.height,
      };
      return registerOverlay({ id: overlayId, zoneId, rect: overlayRect, persistent: true });
    };

    let cleanup: (() => void) | undefined;
    const ro = new ResizeObserver(() => {
      cleanup?.();
      cleanup = report();
    });
    ro.observe(el);
    cleanup = report();
    return () => {
      cleanup?.();
      ro.disconnect();
    };
  }, [overlayId, zoneId, persistent, registerOverlay, rect]);

  if (!rect) return null;

  return (
    <div
      ref={ref}
      className={`composition-zone-slot ${className}`.trim()}
      data-composition-zone={zoneId}
      style={{
        position: 'absolute',
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        pointerEvents: 'none',
      }}
    >
      <div className="composition-zone-slot__content">{children}</div>
    </div>
  );
}

export { useCompositionStage, useCompositionZone } from './EnvironmentalStage';
