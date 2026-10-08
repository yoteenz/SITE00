/**
 * Overlay replicas: QUICK ADD (bottom sheet) and the account drawer, built to the founder references
 * JURNL/F09_SAFE/AUTHORITIES/F09_QUICK_ADD_OVERLAY_SOURCE.jpg and F09_ACCOUNT_DRAWER_OVERLAY_SOURCE.jpg.
 *
 * Each overlay is drawn in the reference's own pixels (941 × 1672, layout/overlayReferenceLayout.ts) on the founder's
 * handoff shell (JURNL/F09_SAFE/OVERLAYS, registered to the source) and scaled to the screen as one object, so every
 * control stays where the reference has it.
 */

import { useLayoutEffect, useState } from 'react';

/** The founder references' frame. */
export const REPLICA_W = 941;
export const REPLICA_H = 1672;

/** Drawer panel width in the reference (x 296 → 941). */
const DRAWER_PANEL_W = 645;

/**
 * QUICK ADD: the sheet spans the column the root hubs use on wide screens and must clear the screen's height.
 * `frameH` is the sheet's height in reference px (986 in the reference; taller when a family offers record types).
 */
export function sheetScale(W: number, H: number, frameH: number): number {
  const column = W / H > 3 / 5 ? Math.min(W, 0.6 * H) : W;
  return Math.min(column / REPLICA_W, (0.94 * H) / frameH, 0.62);
}

/** Account drawer: the reference's full height, right-anchored, never wider than 86% of the screen. */
export function drawerScale(W: number, H: number): number {
  return Math.min(H / REPLICA_H, (0.86 * W) / DRAWER_PANEL_W, 0.7);
}

export type OverlayHost = { W: number; H: number };

/**
 * Measures the overlay host (the runtime viewport) once the overlay mounts in it; returns a callback ref for the overlay
 * root. The keyboard never rescales an open overlay.
 */
export function useOverlayHost(): { host: OverlayHost; ref: (el: HTMLElement | null) => void } {
  const [el, ref] = useState<HTMLElement | null>(null);
  const [host, setHost] = useState<OverlayHost>(() => ({
    W: typeof window === 'undefined' ? 402 : window.innerWidth,
    H: typeof window === 'undefined' ? 874 : window.innerHeight,
  }));
  useLayoutEffect(() => {
    const parent = el?.parentElement;
    if (!parent) return;
    const update = () => {
      if (!parent.clientWidth || !parent.clientHeight) return;
      const next = { W: parent.clientWidth, H: parent.clientHeight };
      setHost((prev) => (prev.W === next.W && prev.H === next.H ? prev : next));
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [el]);
  return { host, ref };
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

/**
 * A live value set in a fitted line: the reference size while it fits `room` (reference px), smaller when it would not.
 * `perChar` is the measured advance of the reference string at the reference size.
 */
export function fitSize(text: string, size: number, perChar: number, room: number, min: number): number {
  const need = Math.max(1, text.length) * perChar;
  return need <= room ? size : Math.max(min, Math.floor(((size * room) / need) * 10) / 10);
}
