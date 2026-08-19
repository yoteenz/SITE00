/**
 * SITE 00 Asset Vault immersive loader — approved desktop master (1672×941, 16:9).
 * compositionId: assts-loader-desktop-v1
 *
 * Landscape recomposition of the mobile reference — same hierarchy, wider canvas.
 */

export const ASSTS_LOADER_DESKTOP_COMPOSITION_ID = 'assts-loader-desktop-v1' as const;

export const ASSTS_LOADER_DESKTOP_REFERENCE_CANVAS = {
  width: 1672,
  height: 941,
} as const;

export const ASSTS_LOADER_DESKTOP_CENTER_X = 836;

export type LoaderDesktopRegionId =
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

export type LoaderDesktopRegionRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

function rect(x: number, y: number, w: number, h: number): LoaderDesktopRegionRect {
  const { width, height } = ASSTS_LOADER_DESKTOP_REFERENCE_CANVAS;
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

/** Centralized desktop composition — copy regions mirror mobile normalized anchors (1672×941). */
export const ASSTS_LOADER_DESKTOP_COMPOSITION = {
  reference: { width: 1672, height: 941, centerX: 836 },
  wireframe: { x: 716, y: 88, w: 240, h: 372 },
  platform: { x: 586, y: 442, w: 500, h: 96 },
  /** copy.* below — same nx/ny/nw/nh as mobile master (711×1536). */
  siteLabel: { x: 740, y: 44, w: 190, h: 20, centerX: 836 },
  headline: { x: 113, y: 69, w: 1449, h: 64, centerX: 836 },
  subtitle: { x: 282, y: 137, w: 1111, h: 25, centerX: 836 },
  status: { x: 670, y: 635, w: 332, h: 16, centerX: 836 },
  progressTrack: { x: 228, y: 671, w: 1134, h: 5 },
  progressPercentage: { x: 1409, y: 665, w: 94, h: 15 },
  brandStatement: { x: 226, y: 717, w: 1223, h: 21, centerX: 836 },
  siteMark: { x: 734, y: 776, w: 207, h: 62, centerX: 836 },
} as const;

export const ASSTS_LOADER_DESKTOP_REGIONS: Record<LoaderDesktopRegionId, LoaderDesktopRegionRect> = {
  background: rect(0, 0, 1672, 941),
  pedestal: rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.platform.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.platform.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.platform.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.platform.h,
  ),
  geometry: rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.wireframe.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.wireframe.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.wireframe.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.wireframe.h,
  ),
  'copy.eyebrow': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteLabel.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteLabel.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteLabel.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteLabel.h,
  ),
  'copy.title': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.headline.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.headline.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.headline.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.headline.h,
  ),
  'copy.subtitle': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.subtitle.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.subtitle.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.subtitle.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.subtitle.h,
  ),
  'copy.status': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.status.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.status.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.status.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.status.h,
  ),
  'copy.progressTrack': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressTrack.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressTrack.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressTrack.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressTrack.h,
  ),
  'copy.progressPct': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressPercentage.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressPercentage.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressPercentage.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.progressPercentage.h,
  ),
  'copy.tagline': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.brandStatement.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.brandStatement.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.brandStatement.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.brandStatement.h,
  ),
  'copy.signature': rect(
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteMark.x,
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteMark.y,
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteMark.w,
    ASSTS_LOADER_DESKTOP_COMPOSITION.siteMark.h,
  ),
};

/** Desktop typography — mirrors mobile master (live overlay uses mobile map). */
export const ASSTS_LOADER_DESKTOP_TYPOGRAPHY = {
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

export function loaderDesktopRegionStyleVars(id: LoaderDesktopRegionId): Record<string, string> {
  const r = ASSTS_LOADER_DESKTOP_REGIONS[id];
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
