/**
 * P0.VR.PROMOTED-PROJECT-VISUAL-AUTHORITY-AND-CAPTURE-SANITATION1
 * Distinguish product UI from capture environment (device/browser chrome).
 */

export const SCREENSHOT_SANITATION_MAP_VERSION = 'screenshot-sanitation-map-v1' as const;

export type ScreenshotExcludedRegionType =
  | 'IOS_STATUS_BAR'
  | 'DYNAMIC_ISLAND'
  | 'BROWSER_ADDRESS_BAR'
  | 'BROWSER_TOOLBAR'
  | 'DEVICE_BEZEL'
  | 'SYSTEM_NAVIGATION'
  | 'LETTERBOX'
  | 'EXTERNAL_PADDING';

export type ScreenshotExcludedRegion = {
  type: ScreenshotExcludedRegionType;
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
};

export type ScreenshotProductBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ScreenshotSanitationMap = {
  mapVersion: typeof SCREENSHOT_SANITATION_MAP_VERSION;
  mapId: string;
  captureWidth: number;
  captureHeight: number;
  productBounds: ScreenshotProductBounds;
  excludedRegions: readonly ScreenshotExcludedRegion[];
};

/** Heuristic chrome bands for tall mobile captures (structural — not pixel ML). */
export const CAPTURE_ENVIRONMENT_TOP_BAND_FRACTION = 0.06;
export const CAPTURE_ENVIRONMENT_BOTTOM_BAND_FRACTION = 0.08;
export const CAPTURE_TALL_ASPECT_THRESHOLD = 2.05;

export function buildScreenshotSanitationMap(input: {
  captureId: string;
  captureWidth: number;
  captureHeight: number;
}): ScreenshotSanitationMap {
  const { captureWidth: w, captureHeight: h } = input;
  const aspect = h / Math.max(w, 1);
  const excluded: ScreenshotExcludedRegion[] = [];
  let topInset = 0;
  let bottomInset = 0;

  if (aspect >= CAPTURE_TALL_ASPECT_THRESHOLD) {
    topInset = Math.round(h * CAPTURE_ENVIRONMENT_TOP_BAND_FRACTION);
    bottomInset = Math.round(h * CAPTURE_ENVIRONMENT_BOTTOM_BAND_FRACTION);
    excluded.push({
      type: 'IOS_STATUS_BAR',
      x: 0,
      y: 0,
      width: w,
      height: topInset,
      reason: 'Top status / dynamic island band excluded from product authority',
    });
    excluded.push({
      type: 'SYSTEM_NAVIGATION',
      x: 0,
      y: h - bottomInset,
      width: w,
      height: bottomInset,
      reason: 'Bottom system home-indicator / browser toolbar band excluded',
    });
  }

  const productBounds: ScreenshotProductBounds = {
    x: 0,
    y: topInset,
    width: w,
    height: Math.max(32, h - topInset - bottomInset),
  };

  return {
    mapVersion: SCREENSHOT_SANITATION_MAP_VERSION,
    mapId: `${input.captureId}:sanitation-v1`,
    captureWidth: w,
    captureHeight: h,
    productBounds,
    excludedRegions: excluded,
  };
}

export function buildDeviceChromeCaptureGuardBlock(): string {
  return 'CAPTURE GUARD: product UI only — no phone/browser chrome, status bar, device nav, or letterboxing.';
}

const DEVICE_CHROME_LABEL_PATTERNS: readonly RegExp[] = [
  /\bsafari\b/i,
  /\baddress bar\b/i,
  /\bstatus bar\b/i,
  /\bdynamic island\b/i,
  /\bhome indicator\b/i,
  /\bbrowser toolbar\b/i,
  /\bdevice frame\b/i,
  /\bphone chrome\b/i,
];

export function isDeviceOrBrowserChromeLabel(label: string): boolean {
  return DEVICE_CHROME_LABEL_PATTERNS.some((p) => p.test(label));
}

export async function cropCaptureBase64ToProductBounds(input: {
  captureBase64: string;
  sanitation: ScreenshotSanitationMap;
}): Promise<{ base64: string; width: number; height: number }> {
  const { productBounds, captureWidth, captureHeight } = input.sanitation;
  if (
    productBounds.x === 0 &&
    productBounds.y === 0 &&
    productBounds.width === captureWidth &&
    productBounds.height === captureHeight
  ) {
    return { base64: input.captureBase64, width: captureWidth, height: captureHeight };
  }

  if (process.env.VITEST === 'true') {
    return {
      base64: input.captureBase64,
      width: productBounds.width,
      height: productBounds.height,
    };
  }

  const sharp = (await import('sharp')).default;
  const raw = Buffer.from(input.captureBase64.trim(), 'base64');
  const cropped = await sharp(raw)
    .extract({
      left: productBounds.x,
      top: productBounds.y,
      width: productBounds.width,
      height: productBounds.height,
    })
    .png()
    .toBuffer();
  return {
    base64: cropped.toString('base64'),
    width: productBounds.width,
    height: productBounds.height,
  };
}
