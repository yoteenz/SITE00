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

/** Centralized desktop composition — tuned to approved 1672×941 landscape master. */
export const ASSTS_LOADER_DESKTOP_COMPOSITION = {
  reference: { width: 1672, height: 941, centerX: 836 },
  wireframe: { x: 716, y: 88, w: 240, h: 372 },
  platform: { x: 586, y: 442, w: 500, h: 96 },
  siteLabel: { x: 796, y: 552, w: 80, h: 22, centerX: 836 },
  headline: { x: 396, y: 574, w: 880, h: 34, centerX: 836 },
  subtitle: { x: 564, y: 608, w: 544, h: 24, centerX: 836 },
  status: { x: 716, y: 644, w: 240, h: 22, centerX: 836 },
  progressTrack: { x: 536, y: 674, w: 600, h: 8 },
  progressPercentage: { x: 1144, y: 666, w: 44, h: 24 },
  brandStatement: { x: 546, y: 704, w: 580, h: 28, centerX: 836 },
  siteMark: { x: 792, y: 752, w: 88, h: 96, centerX: 836 },
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

/** Desktop typography — same Martian Mono system, modest readability bump. */
export const ASSTS_LOADER_DESKTOP_TYPOGRAPHY = {
  eyebrow: { size: 11, weight: 600, tracking: '0.1em', lh: 1.12 },
  title: { size: 14, weight: 650, tracking: '0.035em', lh: 1.08 },
  subtitle: { size: 11, weight: 450, tracking: '0.09em', lh: 1.2 },
  status: { size: 10, weight: 450, tracking: '0.08em', lh: 1.15 },
  progressPct: { size: 10, weight: 500, tracking: '0.02em', lh: 1 },
  tagline: { size: 9, weight: 450, tracking: '0.07em', lh: 1.15 },
  taglinePlus: { size: 11, weight: 500, tracking: '0', lh: 1 },
  mark: { size: 28, weight: 800, tracking: '0.02em', lh: 1 },
  signatureLabel: { size: 10, weight: 600, tracking: '0.1em', lh: 1.12 },
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
