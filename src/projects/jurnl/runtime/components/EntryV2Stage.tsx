/**
 * ENTRY v2 stage (P0.JURNL.ENTRY-V2.FIRST-7.AUTHORITY-PLUS-PLATE-LIVE-WIRING1).
 *
 * VIEWPORT → PLATE (the page's environment) → LIVE UI. The approved authority is the layout; the plate is the same scene
 * with the live layer removed and registers to it within a pixel. The page is drawn in the authority's frame
 * (1008 × 1792, layout/entryV2Layout.ts) and scaled as one object to cover the viewport, so every live line, field and
 * button stays on the physical surface it is printed on. One plate image per page; it is never letterboxed, doubled
 * or blurred behind itself.
 *
 *  · Aligned (phones): the plate covers the viewport; the crop follows the page's focus and always keeps the live layer
 *    on screen.
 *  · Fallback (tablet, desktop: not yet an approved authority): when the live layer cannot fit the cover crop, the
 *    plate stays full-bleed and the live layer is drawn smaller over the same part of the plate.
 */

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { RefBox } from '../layout/referenceLayout';

export const ENTRY_W = 1008;
export const ENTRY_H = 1792;
/** Clear space kept around the live layer inside the crop (frame px). */
const MARGIN = 24;

export type EntryFit = { aligned: boolean; k: number; x: number; y: number; plateK: number; plateX: number; plateY: number };

/**
 * Cover the viewport with the frame; place the crop by the page's focus, then move it the least needed to keep the
 * live layer inside. When the layer is larger than the crop, fall back (see module comment).
 */
export function entryFit(W: number, H: number, ui: RefBox, focal: readonly [number, number]): EntryFit {
  const kc = Math.max(W / ENTRY_W, H / ENTRY_H);
  const vw = W / kc;
  const vh = H / kc;
  const uw = ui[2] - ui[0] + 2 * MARGIN;
  const uh = ui[3] - ui[1] + 2 * MARGIN;
  const place = (size: number, view: number, f: number, lo: number, hi: number) => {
    let o = Math.min(Math.max(f * size - view / 2, 0), size - view);
    o = Math.min(o, lo - MARGIN);
    o = Math.max(o, hi + MARGIN - view);
    return Math.min(Math.max(o, 0), size - view);
  };
  if (uw <= vw + 0.5 && uh <= vh + 0.5) {
    const ox = place(ENTRY_W, vw, focal[0], ui[0], ui[2]);
    const oy = place(ENTRY_H, vh, focal[1], ui[1], ui[3]);
    return { aligned: true, k: kc, x: -ox * kc, y: -oy * kc, plateK: kc, plateX: -ox * kc, plateY: -oy * kc };
  }
  const ox = Math.min(Math.max(focal[0] * ENTRY_W - vw / 2, 0), ENTRY_W - vw);
  const oy = Math.min(Math.max(focal[1] * ENTRY_H - vh / 2, 0), ENTRY_H - vh);
  const k = Math.min(kc, W / uw, H / uh);
  // Centre the live layer over the part of the plate it belongs to, inside the viewport.
  const cx = ((ui[0] + ui[2]) / 2 - ox) * kc;
  const cy = ((ui[1] + ui[3]) / 2 - oy) * kc;
  const half = (s: number) => (s * k) / 2;
  const sx = Math.min(Math.max(cx, half(uw)), W - half(uw));
  const sy = Math.min(Math.max(cy, half(uh)), H - half(uh));
  return { aligned: false, k, x: sx - ((ui[0] + ui[2]) / 2) * k, y: sy - ((ui[1] + ui[3]) / 2) * k, plateK: kc, plateX: -ox * kc, plateY: -oy * kc };
}

export type EntryPlate = { src: string; assetId: string; screen: string };

/** While a field is focused and the keyboard shortens the visual viewport, lift the stage so the field stays in view. */
function useKeyboardLift(root: HTMLElement | null) {
  const [lift, setLift] = useState(0);
  useLayoutEffect(() => {
    const v = typeof window === 'undefined' ? undefined : window.visualViewport;
    if (!root || !v) return;
    const update = () => {
      const el = document.activeElement;
      if (!(el instanceof HTMLInputElement) || !root.contains(el)) return setLift(0);
      const box = el.getBoundingClientRect();
      const bottom = box.bottom + lift + 12;
      const limit = v.offsetTop + v.height;
      setLift(bottom > limit ? Math.ceil(bottom - limit) : 0);
    };
    v.addEventListener('resize', update);
    root.addEventListener('focusin', update);
    root.addEventListener('focusout', update);
    return () => {
      v.removeEventListener('resize', update);
      root.removeEventListener('focusin', update);
      root.removeEventListener('focusout', update);
    };
  }, [root, lift]);
  return lift;
}

export function EntryV2Stage({
  screenId,
  plate,
  ui,
  focal,
  label,
  children,
  outside,
}: {
  screenId: string;
  plate: EntryPlate;
  /** The live layer's extent in the frame. */
  ui: RefBox;
  focal: readonly [number, number];
  label: string;
  children: ReactNode;
  /** Overlays (drawers, handoffs) mounted outside the scaled stage. */
  outside?: ReactNode;
}) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const ref = useCallback((el: HTMLElement | null) => setRoot(el), []);
  const [fit, setFit] = useState(() => entryFit(typeof window === 'undefined' ? 393 : window.innerWidth, typeof window === 'undefined' ? 852 : window.innerHeight, ui, focal));
  const uiKey = useRef(ui.join(','));
  uiKey.current = ui.join(',');
  useLayoutEffect(() => {
    if (!root) return;
    const update = () => {
      if (!root.clientWidth || !root.clientHeight) return;
      const next = entryFit(root.clientWidth, root.clientHeight, ui, focal);
      setFit((p) => (p.k === next.k && p.x === next.x && p.y === next.y && p.aligned === next.aligned ? p : next));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(root);
    return () => ro.disconnect();
  }, [root, uiKey.current, focal]); // eslint-disable-line react-hooks/exhaustive-deps
  const lift = useKeyboardLift(root);
  const plateImg = (style: CSSProperties) => <img className="jrn-e2__plate" src={plate.src} alt="" width={ENTRY_W} height={ENTRY_H} draggable={false} data-asset-id={plate.assetId} style={style} />;
  return (
    <section ref={ref} className="jrn-screen jrn-e2" data-transition="push" data-jrn-screen={screenId} data-jrn-family="F01" data-jrn-entry-v2={plate.screen} data-jrn-composition="EDGE_LED" data-jrn-fit={fit.aligned ? 'aligned' : 'fallback'} aria-label={label}>
      <div className="jrn-env jrn-e2__env" data-testid="jurnl-environment" data-asset-id={plate.assetId} aria-hidden style={{ transform: `translateY(${-lift}px)` }}>
        {plateImg({ transform: `translate(${fit.plateX}px, ${fit.plateY}px) scale(${fit.plateK})` })}
      </div>
      <div className="jrn-e2__stage" data-runtime-bounds="column" style={{ transform: `translate(${fit.x}px, ${fit.y - lift}px) scale(${fit.k})` }}>
        {children}
      </div>
      {outside}
    </section>
  );
}

/** A physical surface the live layer is printed on (a turned sheet, a slip, a standing card): CSS matrix3d from layout. */
export function EntrySurface({ m, children, className }: { m?: string; children: ReactNode; className?: string }) {
  if (!m) return <>{children}</>;
  return (
    <div className={`jrn-e2__surface${className ? ` ${className}` : ''}`} style={{ transform: m }}>
      {children}
    </div>
  );
}
