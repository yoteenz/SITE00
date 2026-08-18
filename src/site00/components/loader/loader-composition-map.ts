/**
 * SITE 00 Asset Vault immersive loader — approved master reference (711×1536).
 * compositionId: assts-loader-mobile-v2
 *
 * Single coordinate plane: background + hero + typography + progress + mark.
 * Tune values here — do not scatter arbitrary coordinates in CSS.
 */

export const ASSTS_LOADER_COMPOSITION_ID = 'assts-loader-mobile-v2' as const;

export const ASSTS_LOADER_REFERENCE_CANVAS = {
  width: 711,
  height: 1536,
} as const;

/** Master vertical centerline (reference px). */
export const ASSTS_LOADER_CENTER_X = 355.5;

export type LoaderRegionRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export type LoaderRegionId =
  | 'background'
  | 'pedestal'
  | 'geometry'
  | 'copy.eyebrow'
  | 'copy.title'
  | 'copy.subtitle'
  | 'copy.status'
  | 'copy.progressTrack'
  | 'copy.progressPct'
  | 'copy.tagline'
  | 'copy.signature';

function rect(x: number, y: number, w: number, h: number): LoaderRegionRect {
  const { width, height } = ASSTS_LOADER_REFERENCE_CANVAS;
  return {
    x,
    y,
    w,
    h,
    nx: x / width,
    ny: y / height,
    nw: w / width,
    nh: h / height,
  };
}

/** Centralized composition token map — master reference blueprint. */
export const ASSTS_LOADER_COMPOSITION = {
  reference: { width: 711, height: 1536, centerX: 355.5 },
  wireframe: { x: 238, y: 154, w: 222, h: 540 },
  platform: { x: 120, y: 630, w: 470, h: 160 },
  siteLabel: { x: 315, y: 837, w: 81, h: 24, centerX: 355.5 },
  headline: { x: 85, y: 878, w: 542, h: 43, centerX: 355.5 },
  subtitle: { x: 184, y: 940, w: 344, h: 27, centerX: 355.5 },
  status: { x: 285, y: 1037, w: 141, h: 26, centerX: 355.5 },
  progressTrack: { x: 97, y: 1095, w: 482, h: 8 },
  progressPercentage: { x: 599, y: 1086, w: 40, h: 25 },
  brandStatement: { x: 165, y: 1170, w: 380, h: 34, centerX: 355.5 },
  siteMark: { x: 312, y: 1265, w: 88, h: 102, centerX: 355.5 },
} as const;

/** Authoritative region map — approved Asset Vault loader master reference. */
export const ASSTS_LOADER_REGIONS: Record<LoaderRegionId, LoaderRegionRect> = {
  background: rect(0, 0, 711, 1536),
  pedestal: rect(ASSTS_LOADER_COMPOSITION.platform.x, ASSTS_LOADER_COMPOSITION.platform.y, ASSTS_LOADER_COMPOSITION.platform.w, ASSTS_LOADER_COMPOSITION.platform.h),
  geometry: rect(
    ASSTS_LOADER_COMPOSITION.wireframe.x,
    ASSTS_LOADER_COMPOSITION.wireframe.y,
    ASSTS_LOADER_COMPOSITION.wireframe.w,
    ASSTS_LOADER_COMPOSITION.wireframe.h,
  ),
  'copy.eyebrow': rect(
    ASSTS_LOADER_COMPOSITION.siteLabel.x,
    ASSTS_LOADER_COMPOSITION.siteLabel.y,
    ASSTS_LOADER_COMPOSITION.siteLabel.w,
    ASSTS_LOADER_COMPOSITION.siteLabel.h,
  ),
  'copy.title': rect(
    ASSTS_LOADER_COMPOSITION.headline.x,
    ASSTS_LOADER_COMPOSITION.headline.y,
    ASSTS_LOADER_COMPOSITION.headline.w,
    ASSTS_LOADER_COMPOSITION.headline.h,
  ),
  'copy.subtitle': rect(
    ASSTS_LOADER_COMPOSITION.subtitle.x,
    ASSTS_LOADER_COMPOSITION.subtitle.y,
    ASSTS_LOADER_COMPOSITION.subtitle.w,
    ASSTS_LOADER_COMPOSITION.subtitle.h,
  ),
  'copy.status': rect(
    ASSTS_LOADER_COMPOSITION.status.x,
    ASSTS_LOADER_COMPOSITION.status.y,
    ASSTS_LOADER_COMPOSITION.status.w,
    ASSTS_LOADER_COMPOSITION.status.h,
  ),
  'copy.progressTrack': rect(
    ASSTS_LOADER_COMPOSITION.progressTrack.x,
    ASSTS_LOADER_COMPOSITION.progressTrack.y,
    ASSTS_LOADER_COMPOSITION.progressTrack.w,
    ASSTS_LOADER_COMPOSITION.progressTrack.h,
  ),
  'copy.progressPct': rect(
    ASSTS_LOADER_COMPOSITION.progressPercentage.x,
    ASSTS_LOADER_COMPOSITION.progressPercentage.y,
    ASSTS_LOADER_COMPOSITION.progressPercentage.w,
    ASSTS_LOADER_COMPOSITION.progressPercentage.h,
  ),
  'copy.tagline': rect(
    ASSTS_LOADER_COMPOSITION.brandStatement.x,
    ASSTS_LOADER_COMPOSITION.brandStatement.y,
    ASSTS_LOADER_COMPOSITION.brandStatement.w,
    ASSTS_LOADER_COMPOSITION.brandStatement.h,
  ),
  'copy.signature': rect(
    ASSTS_LOADER_COMPOSITION.siteMark.x,
    ASSTS_LOADER_COMPOSITION.siteMark.y,
    ASSTS_LOADER_COMPOSITION.siteMark.w,
    ASSTS_LOADER_COMPOSITION.siteMark.h,
  ),
};

/** Loader typography — Martian Mono proportions tuned to reference bounding boxes. */
export const ASSTS_LOADER_TYPOGRAPHY = {
  eyebrow: { size: 10, weight: 600, tracking: '0.1em', lh: 1.12 },
  title: { size: 13, weight: 650, tracking: '0.035em', lh: 1.08 },
  subtitle: { size: 10, weight: 450, tracking: '0.09em', lh: 1.2 },
  status: { size: 9, weight: 450, tracking: '0.08em', lh: 1.15 },
  progressPct: { size: 9, weight: 500, tracking: '0.02em', lh: 1 },
  tagline: { size: 8, weight: 450, tracking: '0.07em', lh: 1.15 },
  taglinePlus: { size: 10, weight: 500, tracking: '0', lh: 1 },
  mark: { size: 26, weight: 800, tracking: '0.02em', lh: 1 },
  signatureLabel: { size: 9, weight: 600, tracking: '0.1em', lh: 1.12 },
} as const;

/** Visible geometry bounds (wireframe tower in reference space). */
export const ASSTS_LOADER_GEOMETRY_VISIBLE = {
  top: ASSTS_LOADER_COMPOSITION.wireframe.y,
  bottom: ASSTS_LOADER_COMPOSITION.wireframe.y + ASSTS_LOADER_COMPOSITION.wireframe.h,
  left: ASSTS_LOADER_COMPOSITION.wireframe.x,
  right: ASSTS_LOADER_COMPOSITION.wireframe.x + ASSTS_LOADER_COMPOSITION.wireframe.w,
  centerX: ASSTS_LOADER_CENTER_X,
  centerY: ASSTS_LOADER_COMPOSITION.wireframe.y + ASSTS_LOADER_COMPOSITION.wireframe.h / 2,
  anchorXNormalized: ASSTS_LOADER_CENTER_X / ASSTS_LOADER_REFERENCE_CANVAS.width,
  visibleBottomNormalized:
    (ASSTS_LOADER_COMPOSITION.wireframe.y + ASSTS_LOADER_COMPOSITION.wireframe.h) /
    ASSTS_LOADER_REFERENCE_CANVAS.height,
} as const;

/** Master vertical landmarks (reference px) for debug guides. */
export const ASSTS_LOADER_Y_LANDMARKS: { label: string; y: number }[] = [
  { label: 'WIREFRAME TOP', y: 154 },
  { label: 'PLATFORM TOP', y: 630 },
  { label: 'WIREFRAME BASE', y: 694 },
  { label: 'PLATFORM BOTTOM', y: 790 },
  { label: 'SITE 00 EYEBROW', y: 837 },
  { label: 'HEADLINE', y: 878 },
  { label: 'SUBTITLE', y: 940 },
  { label: 'STATUS', y: 1037 },
  { label: 'PROGRESS TRACK', y: 1095 },
  { label: 'BRAND STATEMENT', y: 1170 },
  { label: 'SITE MARK', y: 1265 },
  { label: 'LOWER BREATHING', y: 1370 },
];

/** Regions measured during validation (primary tolerance targets). */
export const ASSTS_LOADER_PRIMARY_REGIONS: LoaderRegionId[] = [
  'geometry',
  'copy.eyebrow',
  'copy.title',
  'copy.subtitle',
  'copy.status',
  'copy.progressTrack',
  'copy.progressPct',
  'copy.tagline',
  'copy.signature',
];

export function scaleLoaderRect(r: LoaderRegionRect, scale: number) {
  return {
    x: r.x * scale,
    y: r.y * scale,
    w: r.w * scale,
    h: r.h * scale,
  };
}

export function loaderRegionStyleVars(id: LoaderRegionId): Record<string, string> {
  const r = ASSTS_LOADER_REGIONS[id];
  return {
    '--loader-x': String(r.x),
    '--loader-y': String(r.y),
    '--loader-w': String(r.w),
    '--loader-h': String(r.h),
    '--loader-nx': String(r.nx),
    '--loader-ny': String(r.ny),
    '--loader-nw': String(r.nw),
    '--loader-nh': String(r.nh),
  };
}

/** Anchor center in normalized artboard coordinates (0–100). */
export function loaderRegionAnchorPercent(id: LoaderRegionId): { x: number; y: number } {
  const r = ASSTS_LOADER_REGIONS[id];
  return {
    x: (r.nx + r.nw / 2) * 100,
    y: (r.ny + r.nh / 2) * 100,
  };
}

export function getLoaderRegion(id: LoaderRegionId): LoaderRegionRect {
  return ASSTS_LOADER_REGIONS[id];
}
