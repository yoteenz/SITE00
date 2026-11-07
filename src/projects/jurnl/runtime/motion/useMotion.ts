/**
 * React wiring for the motion director (OPUS4). `useMotionRuntime` connects one runtime root to the page; the other hooks
 * let a surface declare its ambient channels and answer committed state changes with a material response.
 */
import { useEffect, useRef, type RefObject } from 'react';
import { motionDirector, type AmbientChannel, type MotionMode } from './director';
import { respond, type ResponseName } from './materials';
import { observeOverlayHost } from './overlayMotion';

const TYPING = 'input, textarea, select, [contenteditable="true"]';

/** Data saver or very low device memory (where the browser reports it): SUBTLE. No other device assumption is made. */
function constrained(): boolean {
  if (typeof navigator === 'undefined') return false;
  const n = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return !!n.connection?.saveData || (typeof n.deviceMemory === 'number' && n.deviceMemory <= 2);
}

/**
 * Attach the director to the runtime: reduced-motion preference, page visibility, pointer and typing activity, the overlay
 * host (open count, closing ghosts), and route changes. `override` is the design-preview `?motion=full|subtle|off`.
 */
export function useMotionRuntime(root: HTMLElement | null, overlayHost: HTMLElement | null, routeKey: string, override: MotionMode | null) {
  useEffect(() => {
    if (!root || typeof window === 'undefined') return;
    const d = motionDirector;
    d.attachRoot(root);
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    d.setReduced(!!mq?.matches);
    d.setConstrained(constrained());
    d.setHidden(document.visibilityState === 'hidden');
    const onMq = (e: MediaQueryListEvent) => d.setReduced(e.matches);
    mq?.addEventListener?.('change', onMq);
    const onVis = () => d.setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVis);
    // pointer activity: one interaction per active pointer
    const ends = new Map<number, () => void>();
    const down = (e: PointerEvent) => {
      ends.get(e.pointerId)?.();
      ends.set(e.pointerId, d.beginInteraction());
    };
    const up = (e: PointerEvent) => {
      ends.get(e.pointerId)?.();
      ends.delete(e.pointerId);
    };
    root.addEventListener('pointerdown', down, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    // typing pauses ambience
    const fin = (e: FocusEvent) => d.setTyping(!!(e.target as Element | null)?.closest?.(TYPING));
    const fout = () => window.setTimeout(() => d.setTyping(!!document.activeElement?.closest?.(TYPING)), 0);
    root.addEventListener('focusin', fin);
    root.addEventListener('focusout', fout);
    return () => {
      mq?.removeEventListener?.('change', onMq);
      document.removeEventListener('visibilitychange', onVis);
      root.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
      root.removeEventListener('focusin', fin);
      root.removeEventListener('focusout', fout);
      for (const end of ends.values()) end();
      d.cancelAll();
      d.attachRoot(null);
    };
  }, [root]);

  useEffect(() => motionDirector.setOverride(override), [override]);

  useEffect(() => (overlayHost ? observeOverlayHost(overlayHost) : undefined), [overlayHost]);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    motionDirector.cancelAll();
    motionDirector.navigate(700);
  }, [routeKey]);
}

/** Declare the ambient channels this surface offers while mounted (only for independently mounted art). */
export function useAmbientChannels(owner: string, channels: readonly AmbientChannel[], enabled = true) {
  const key = channels.join('');
  useEffect(() => {
    if (!enabled || !key) return;
    return motionDirector.declareAmbient(owner, key.split('') as AmbientChannel[]);
  }, [owner, key, enabled]);
}

/**
 * Answer a committed state change with one material response on `ref`. Never on mount, never on a rerender with the same
 * value: only when `value` actually changes, and only if `pick(prev, next)` names a response.
 */
export function useStateResponse<T>(value: T, ref: RefObject<Element | null>, pick: (prev: T, next: T) => ResponseName | null) {
  const memo = useRef<ResponseMemo<T> | null>(null);
  const pickRef = useRef(pick);
  pickRef.current = pick;
  useEffect(() => {
    const step = stateResponseStep(memo.current, value, pickRef.current);
    memo.current = step.memo;
    if (step.name) respond(ref.current, step.name);
  }, [value, ref]);
}

export type ResponseMemo<T> = { prev: T };
/**
 * The decision behind `useStateResponse` (pure): the first value only records itself (mount, or a remount after a route
 * change); the same value again names nothing (a re-render); a changed value asks `pick`.
 */
export function stateResponseStep<T>(memo: ResponseMemo<T> | null, value: T, pick: (prev: T, next: T) => ResponseName | null): { memo: ResponseMemo<T>; name: ResponseName | null } {
  if (!memo) return { memo: { prev: value }, name: null };
  if (Object.is(memo.prev, value)) return { memo, name: null };
  return { memo: { prev: value }, name: pick(memo.prev, value) };
}
