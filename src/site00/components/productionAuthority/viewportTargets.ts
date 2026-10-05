/**
 * DESIGN / VIEWPORT — target geometry (P0.STUDIOOS.PRODUCTION.AUTHORITY-CONVERGENCE.OPUS2).
 *
 * The preset selector drives REAL client dimensions: the client app iframe is laid out at exactly these
 * logical pixels (so its own responsive breakpoints apply) and only then scaled to fit the host stage.
 * DESKTOP is always a landscape browser canvas; orientation only applies to handheld targets.
 */

export type ViewportPreset = 'MOBILE' | 'MOBILE XL' | 'TABLET' | 'DESKTOP';
export type ViewportKind = 'phone' | 'tablet' | 'desktop';
export type ViewportOrientation = 'PORTRAIT' | 'LANDSCAPE';
export type ViewportZoom = 'FIT' | '50%' | '75%' | '100%';

export const VIEWPORT_PRESET_ORDER: readonly ViewportPreset[] = ['MOBILE', 'MOBILE XL', 'TABLET', 'DESKTOP'];
export const VIEWPORT_ZOOMS: readonly ViewportZoom[] = ['FIT', '50%', '75%', '100%'];

/** Natural-orientation logical sizes (CSS px) handed to the client app. */
export const VIEWPORT_PRESET_SIZE: Record<ViewportPreset, { w: number; h: number; kind: ViewportKind }> = {
  MOBILE: { w: 390, h: 844, kind: 'phone' },
  'MOBILE XL': { w: 430, h: 932, kind: 'phone' },
  TABLET: { w: 834, h: 1194, kind: 'tablet' },
  DESKTOP: { w: 1440, h: 900, kind: 'desktop' },
};

export type ViewportTarget = {
  preset: ViewportPreset;
  kind: ViewportKind;
  w: number;
  h: number;
  orientation: ViewportOrientation;
  /** Desktop ignores the orientation control (a laptop / monitor is landscape). */
  orientationLocked: boolean;
};

export function isViewportPreset(v: string): v is ViewportPreset {
  return (VIEWPORT_PRESET_ORDER as readonly string[]).includes(v);
}

export function resolveViewportTarget(preset: ViewportPreset, orientation: ViewportOrientation): ViewportTarget {
  const p = VIEWPORT_PRESET_SIZE[preset];
  if (p.kind === 'desktop') return { preset, kind: 'desktop', w: p.w, h: p.h, orientation: 'LANDSCAPE', orientationLocked: true };
  const long = Math.max(p.w, p.h);
  const short = Math.min(p.w, p.h);
  return orientation === 'LANDSCAPE' ?
      { preset, kind: p.kind, w: long, h: short, orientation, orientationLocked: false }
    : { preset, kind: p.kind, w: short, h: long, orientation, orientationLocked: false };
}

/**
 * Scale for the client canvas inside a host stage of `box` px.
 * FIT never upscales and always shows the whole target. Fixed zooms are true scales; when the canvas is
 * larger than the stage the stage scrolls (horizontal inspection) instead of squeezing the host layout.
 */
export function viewportScale(target: Pick<ViewportTarget, 'w' | 'h'>, box: { w: number; h: number }, zoom: ViewportZoom): number {
  if (zoom !== 'FIT') return parseInt(zoom, 10) / 100;
  if (!box.w || !box.h) return 0.25;
  return Math.min(1, box.w / target.w, box.h / target.h);
}

/**
 * Project-declared device sizes (P0.JURNL.SITE00-INGEST-F01): an ingested project's authority viewport wins over
 * the host default for that preset (e.g. JURNL MOBILE = 393 × 852). Orientation and desktop locking still apply.
 */
export function applyProjectViewportSize(target: ViewportTarget, size: { w: number; h: number } | null | undefined): ViewportTarget {
  if (!size) return target;
  if (target.kind === 'desktop') return { ...target, w: Math.max(size.w, size.h), h: Math.min(size.w, size.h) };
  const long = Math.max(size.w, size.h);
  const short = Math.min(size.w, size.h);
  return target.orientation === 'LANDSCAPE' ? { ...target, w: long, h: short } : { ...target, w: short, h: long };
}
