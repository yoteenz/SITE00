/**
 * Canonical viewport dimensions for automated visual reference capture.
 * Configurable — not hardcoded founder device dimensions.
 */

import type { ViewportClass } from './types.js';

export type ViewportSpec = {
  viewportClass: ViewportClass;
  width: number;
  height: number;
  deviceScaleFactor: number;
};

export const CANONICAL_VIEWPORTS: Record<ViewportClass, ViewportSpec> = {
  DESKTOP: { viewportClass: 'DESKTOP', width: 1440, height: 900, deviceScaleFactor: 1 },
  WIDE_DESKTOP: { viewportClass: 'WIDE_DESKTOP', width: 1920, height: 1080, deviceScaleFactor: 1 },
  MOBILE: { viewportClass: 'MOBILE', width: 390, height: 844, deviceScaleFactor: 2 },
};

export function getViewportSpec(viewportClass: ViewportClass): ViewportSpec {
  return CANONICAL_VIEWPORTS[viewportClass];
}
