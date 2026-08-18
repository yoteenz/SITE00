import { useEffect, useRef, type RefObject } from 'react';
import { useCompositionStage } from './EnvironmentalStage';
import type { ViewportRect } from './types';

/** Register a document-flow element for protected-zone collision diagnostics. */
export function useCompositionOverlayRef(
  overlayId: string,
  persistent = true,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null!);
  const { registerOverlay } = useCompositionStage();

  useEffect(() => {
    if (!persistent) return;
    const el = ref.current;
    if (!el) return;

    let cleanup: (() => void) | undefined;

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
      return registerOverlay({ id: overlayId, rect: overlayRect, persistent: true });
    };

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
  }, [overlayId, persistent, registerOverlay]);

  return ref;
}
