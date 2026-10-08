/**
 * Overlay authorities (P0.JURNL.OVERLAYS.QUICK-ADD-AND-HAMBURGER-EDITORIAL-REDESIGN1, approved).
 *
 * QUICK ADD (bottom sheet) and the account menu (drawer) are drawn on their approved shells
 * (JURNL/OVERLAYS_EDITORIAL_REDESIGN1). Each overlay is laid out in design px on a 393-wide phone frame and scaled to the
 * screen as one object, so the live controls stay on the paper they were placed on. The shell is painted in two layers
 * (jurnl-overlays.css): from the top at its own proportions, so the torn edge, clip and print / tabs, portrait and ribbon
 * never stretch, and the shell's foot from the bottom, faded in over plain paper when the content or screen is taller.
 */

import { useLayoutEffect, useState } from 'react';

/** Phone frame the authorities were composed on. */
export const OVERLAY_FRAME_W = 393;
/** Never draw an overlay larger than this (tablet, desktop). */
const MAX_SCALE = 1.35;

/** QUICK ADD runtime shell: the approved shell from frame y 100 down (393 × 599 design px), 1260 px wide. */
export const QUICK_ADD_SHELL = { frameTop: 100, height: 599 } as const;
/** Account menu runtime shell: the approved folio on a 393 × 852 frame, 1260 px wide. Never shorter than the 699 frame. */
export const ACCOUNT_MENU_SHELL = { height: 852, minHeight: 699 } as const;

export type OverlayFit = { s: number; W: number; H: number };

/**
 * Scale of the 393 frame on this screen. The sheet keeps to the same column the root hubs use on wide screens and must
 * clear the screen's height; the drawer must keep at least the 699 frame height.
 */
export function overlayFit(W: number, H: number, kind: 'sheet' | 'drawer'): OverlayFit {
  const column = W / H > 3 / 5 ? Math.min(W, 0.6 * H) : W;
  const s = kind === 'sheet' ? Math.min(column / OVERLAY_FRAME_W, H / 640, MAX_SCALE) : Math.min(W / OVERLAY_FRAME_W, H / ACCOUNT_MENU_SHELL.minHeight, MAX_SCALE);
  return { s, W, H };
}

/**
 * Measures the overlay host (the runtime viewport) once the overlay mounts in it; returns a callback ref for the overlay
 * root. The keyboard never rescales an open overlay.
 */
export function useOverlayFit(kind: 'sheet' | 'drawer'): { fit: OverlayFit; ref: (el: HTMLElement | null) => void } {
  const [el, ref] = useState<HTMLElement | null>(null);
  const [fit, setFit] = useState(() =>
    overlayFit(typeof window === 'undefined' ? 402 : window.innerWidth, typeof window === 'undefined' ? 874 : window.innerHeight, kind),
  );
  useLayoutEffect(() => {
    const host = el?.parentElement;
    if (!host) return;
    const update = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      const next = overlayFit(host.clientWidth, host.clientHeight, kind);
      setFit((prev) => (prev.s === next.s && prev.W === next.W && prev.H === next.H ? prev : next));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(host);
    return () => ro.disconnect();
  }, [el, kind]);
  return { fit, ref };
}

/** While a field is focused, the overlay follows the visual viewport so the keyboard does not cover SAVE. */
export function useKeyboardViewport(open: boolean): { top: number; height: number } | null {
  const [vv, setVv] = useState<{ top: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const v = typeof window === 'undefined' ? undefined : window.visualViewport;
    if (!open || !v) {
      setVv(null);
      return;
    }
    const sync = () => setVv({ top: Math.round(v.offsetTop), height: Math.round(v.height) });
    sync();
    v.addEventListener('resize', sync);
    v.addEventListener('scroll', sync);
    return () => {
      v.removeEventListener('resize', sync);
      v.removeEventListener('scroll', sync);
    };
  }, [open]);
  return vv;
}

export function OverlayCloseGlyph() {
  return (
    <svg viewBox="0 0 13 13" width="13" height="13" aria-hidden>
      <path d="M1 1l11 11M12 1L1 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function OverlayArrow({ width = 18 }: { width?: number }) {
  return (
    <svg viewBox="0 0 18 12" width={width} height={(width * 12) / 18} aria-hidden>
      <path d="M0 6h16.5M11.5 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
