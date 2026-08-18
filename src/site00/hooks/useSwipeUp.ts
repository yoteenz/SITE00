import { useCallback, useRef } from 'react';

type SwipeUpOptions = {
  thresholdPx?: number;
  maxAngleDeg?: number;
  onSwipeUp: () => void;
  disabled?: boolean;
};

function isInteractiveSwipeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('button, a, input, textarea, select, [role="button"], [data-swipe-ignore]'));
}

function detectSwipeUp(
  start: { x: number; y: number },
  end: { x: number; y: number },
  thresholdPx: number,
  maxAngleDeg: number,
): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dy >= -thresholdPx) return false;

  const angle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);
  return angle >= 90 - maxAngleDeg && angle <= 90 + maxAngleDeg;
}

/**
 * Touch/pointer swipe-up recognition for Screen 00 → Screen 01 transition.
 * Respects prefers-reduced-motion via caller (instant navigate).
 */
export function useSwipeUp({ thresholdPx = 56, maxAngleDeg = 40, onSwipeUp, disabled = false }: SwipeUpOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    startRef.current = null;
    pointerIdRef.current = null;
  }, []);

  const completeSwipe = useCallback(
    (end: { x: number; y: number }) => {
      if (disabled || !startRef.current) return;
      const start = startRef.current;
      reset();
      if (detectSwipeUp(start, end, thresholdPx, maxAngleDeg)) onSwipeUp();
    },
    [disabled, maxAngleDeg, onSwipeUp, reset, thresholdPx],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (disabled || isInteractiveSwipeTarget(event.target)) return;
      startRef.current = { x: event.clientX, y: event.clientY };
      pointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [disabled],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      if (disabled || pointerIdRef.current !== event.pointerId) return;
      completeSwipe({ x: event.clientX, y: event.clientY });
    },
    [completeSwipe, disabled],
  );

  const onPointerCancel = useCallback(() => {
    reset();
  }, [reset]);

  /** iOS Safari fallback — pointer events can miss on fixed layers. */
  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || isInteractiveSwipeTarget(event.target)) return;
      const touch = event.changedTouches[0] ?? event.touches[0];
      if (!touch) return;
      startRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [disabled],
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || !startRef.current) return;
      const touch = event.changedTouches[0];
      if (!touch) return;
      completeSwipe({ x: touch.clientX, y: touch.clientY });
    },
    [completeSwipe, disabled],
  );

  return { onPointerDown, onPointerUp, onPointerCancel, onTouchStart, onTouchEnd };
}

export function prefersReducedSite00Motion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
