/**
 * F05 MONEY carousel controller.
 *
 * - The active collection lives in the URL (`?c=accounts|transfers|commitments|outlook`, replace navigation), so a
 *   child route + back, a reload, or an overlay open / close all return to the same collection.
 * - Horizontal drag only inside the papers region (`touch-action: pan-y`); a drag past 56 px or a quick flick
 *   commits, anything less settles back. A drag never becomes a tap on a paper.
 * - Trackpad: a deliberate horizontal two-finger swipe over the carousel steps once (then rests 600 ms).
 * - A touch that starts within 20 px of the screen edge is left to the system (back / forward gestures).
 * - Keyboard: ← / → inside the carousel; dots and previous / next buttons select directly.
 * - No auto-rotation. Changing collection never writes data.
 * - Motion (OPUS4): a committed swipe leaves at the finger's own speed (exit 180–300 ms from where the drag left the
 *   papers); a cancelled drag settles back in a time that follows its distance (140–280 ms). A change tells the motion
 *   director it is navigating, so ambience waits until the new collection has landed.
 */

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { COLLECTIONS, type CollectionId } from '../../../data/f05/moneyCarousel';
import { patchF05Nav, readF05Nav } from './f05NavPersistence';
import { motionDirector } from '../../motion/director';

export type CarouselTransition = { from: CollectionId; to: CollectionId; dir: 'next' | 'prev'; drag: number; exitMs: number } | null;

const IDS = COLLECTIONS.map((c) => c.id);
const THRESHOLD = 56;
const FLICK = 0.45; // px per ms
const EXIT_MS = 520;
const EDGE = 20; // px: system back / forward gesture zone
const WHEEL_STEP = 60; // accumulated horizontal px for one trackpad step
const WHEEL_REST = 600; // ms
/** The exit keyframes travel to ±170 board px; a committed swipe continues at its release speed, inside these bounds. */
const EXIT_TRAVEL = 170;
export const EXIT_RANGE = [180, 300] as const;
export const SETTLE_RANGE = [140, 280] as const;
const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));
/** Exit duration for a change: a tap / key / dot uses the full 300 ms; a swipe keeps the speed of the finger. */
export function exitMsFor(fromDrag: number, releaseV: number): number {
  if (!fromDrag || !(releaseV > 0)) return EXIT_RANGE[1];
  return Math.round(clamp((EXIT_TRAVEL - Math.min(EXIT_TRAVEL, Math.abs(fromDrag))) / releaseV, EXIT_RANGE));
}
/** Settle-back duration for a cancelled drag: longer for a longer pull, never springy. */
export function settleMsFor(px: number): number {
  return Math.round(clamp(SETTLE_RANGE[0] + Math.abs(px) * 1.4, SETTLE_RANGE));
}

export function useMoneyCarousel(reduced: boolean) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('c') as CollectionId | null;
  const savedC = readF05Nav().c;
  const active: CollectionId =
    raw && IDS.includes(raw) ? raw
    : savedC && IDS.includes(savedC) ? savedC
    : 'accounts';
  const [transition, setTransition] = useState<CarouselTransition>(null);
  const timer = useRef<number | null>(null);
  const drag = useRef<{ x: number; y: number; t: number; dx: number; on: boolean; moved: boolean; id: number; lx: number; lt: number; vx: number } | null>(null);
  const suppressClick = useRef(false);
  /** The active collection element: drag writes straight to its style (no React render per pointer move). */
  const surface = useRef<HTMLElement | null>(null);
  const dragPxRef = useRef(0);
  const paint = (px: number, dragging: boolean, settling = false) => {
    dragPxRef.current = px;
    const el = surface.current;
    if (!el) return;
    el.style.setProperty('--f05m-drag', `${px}px`);
    el.style.setProperty('--f05m-drag-sign', String(Math.sign(px)));
    el.dataset.dragging = dragging ? 'true' : 'false';
    el.dataset.settling = settling ? 'true' : 'false';
  };
  const setDragPx = (px: number) => {
    if (px === 0 && surface.current) surface.current.style.setProperty('--f05m-settle-ms', `${settleMsFor(dragPxRef.current)}ms`);
    paint(px, px !== 0, px === 0);
  };

  const go = useCallback(
    (to: CollectionId, dir: 'next' | 'prev', fromDrag = 0, releaseV = 0) => {
      if (to === active) return;
      motionDirector.navigate(EXIT_MS);
      patchF05Nav({ c: to });
      const next = new URLSearchParams(params);
      next.set('c', to);
      setParams(next, { replace: true });
      if (timer.current) window.clearTimeout(timer.current);
      if (reduced) {
        setTransition(null);
      } else {
        setTransition({ from: active, to, dir, drag: fromDrag, exitMs: exitMsFor(fromDrag, releaseV) });
        timer.current = window.setTimeout(() => setTransition(null), EXIT_MS);
      }
      paint(0, false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, params, reduced, setParams],
  );

  const step = useCallback(
    (delta: 1 | -1) => {
      const i = IDS.indexOf(active);
      const j = i + delta;
      if (j < 0 || j >= IDS.length) return; // ends are ends: no wrap-around surprises
      go(IDS[j]!, delta > 0 ? 'next' : 'prev');
    },
    [active, go],
  );

  const select = useCallback(
    (to: CollectionId) => {
      const i = IDS.indexOf(active);
      const j = IDS.indexOf(to);
      if (i === j) return;
      go(to, j > i ? 'next' : 'prev');
    },
    [active, go],
  );

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  // Keep ?c= on the URL so a refresh returns to the same collection (not only sessionStorage).
  useEffect(() => {
    if (raw === active) return;
    const next = new URLSearchParams(params);
    next.set('c', active);
    setParams(next, { replace: true });
    patchF05Nav({ c: active });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('.jrn-f05m__accounts-rail')) return;
    if (e.pointerType !== 'mouse' && (e.clientX < EDGE || e.clientX > window.innerWidth - EDGE)) return;
    const now = performance.now();
    drag.current = { x: e.clientX, y: e.clientY, t: now, dx: 0, on: false, moved: false, id: e.pointerId, lx: e.clientX, lt: now, vx: 0 };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      d.on = true;
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    d.dx = dx;
    // release speed: a short running average of the last moves (px / ms), for the exit only
    const now = performance.now();
    const dt = now - d.lt;
    if (dt > 0) {
      const inst = Math.abs(e.clientX - d.lx) / dt;
      d.vx = d.vx ? d.vx * 0.6 + inst * 0.4 : inst;
      d.lx = e.clientX;
      d.lt = now;
    }
    // resistance at the ends
    const i = IDS.indexOf(active);
    const atEnd = (dx > 0 && i === 0) || (dx < 0 && i === IDS.length - 1);
    setDragPx(reduced ? 0 : dx * (atEnd ? 0.2 : 0.55));
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) {
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);
    }
    if (!d.on) return;
    const v = Math.abs(d.dx) / Math.max(1, performance.now() - d.t);
    const i = IDS.indexOf(active);
    const commit = Math.abs(d.dx) > THRESHOLD || v > FLICK;
    const from = dragPxRef.current;
    const releaseV = Math.max(d.vx, v);
    if (commit && d.dx < 0 && i < IDS.length - 1) go(IDS[i + 1]!, 'next', from, releaseV);
    else if (commit && d.dx > 0 && i > 0) go(IDS[i - 1]!, 'prev', from, releaseV);
    else setDragPx(0);
  };
  const onPointerCancel = () => {
    drag.current = null;
    setDragPx(0);
  };
  /** Capture-phase click guard: a drag that ends over a paper must not open it. */
  const onClickCapture = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  };
  const wheel = useRef({ sum: 0, restUntil: 0 });
  const onWheel = (e: ReactWheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical intent: not ours
    const w = wheel.current;
    const now = performance.now();
    if (now < w.restUntil) return;
    w.sum += e.deltaX;
    if (Math.abs(w.sum) < WHEEL_STEP) return;
    const delta = w.sum > 0 ? 1 : -1;
    w.sum = 0;
    w.restUntil = now + WHEEL_REST;
    step(delta);
  };
  const onKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    }
  };

  return {
    active,
    index: IDS.indexOf(active),
    transition,
    surface,
    step,
    select,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture, onKeyDown, onWheel },
  };
}
