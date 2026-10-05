/**
 * Detect browser/OS chrome in screenshot references and compute usable page bounds.
 */

import type { Bounds, DeviceClass, NormalizedVisualReference } from '../types.js';
import { MOBILE_IOS_CHROME } from '../constants.js';

export type BrowserChromeDetectionResult = {
  browserChromePresent: boolean;
  browserChromeBounds: Bounds | null;
  usablePageBounds: Bounds;
  detectedDeviceClass: DeviceClass;
  estimatedViewportWidth: number;
  estimatedViewportHeight: number;
  scrollPositionConfidence: number;
};

export function evaluateBrowserChrome(
  pixelWidth: number,
  pixelHeight: number,
  hints?: { forceMobileChrome?: boolean },
): BrowserChromeDetectionResult {
  const portrait = pixelHeight > pixelWidth;
  const aspect = pixelWidth / pixelHeight;
  const likelyMobile = portrait && pixelWidth >= 360 && pixelWidth <= 430 && aspect < 0.55;
  const chromePresent = hints?.forceMobileChrome ?? likelyMobile;

  if (!chromePresent) {
    return {
      browserChromePresent: false,
      browserChromeBounds: null,
      usablePageBounds: { x: 0, y: 0, width: pixelWidth, height: pixelHeight },
      detectedDeviceClass: portrait ? 'mobile' : 'desktop',
      estimatedViewportWidth: pixelWidth,
      estimatedViewportHeight: pixelHeight,
      scrollPositionConfidence: 0.95,
    };
  }

  const topChrome = MOBILE_IOS_CHROME.statusBarHeight + MOBILE_IOS_CHROME.urlBarHeight;
  const bottomChrome = MOBILE_IOS_CHROME.bottomBarHeight;
  const usableHeight = Math.max(200, pixelHeight - topChrome - bottomChrome);

  const chromeBounds: Bounds = {
    x: 0,
    y: 0,
    width: pixelWidth,
    height: pixelHeight,
  };

  const usablePageBounds: Bounds = {
    x: 0,
    y: topChrome,
    width: pixelWidth,
    height: usableHeight,
  };

  return {
    browserChromePresent: true,
    browserChromeBounds: chromeBounds,
    usablePageBounds,
    detectedDeviceClass: 'mobile',
    estimatedViewportWidth: pixelWidth,
    estimatedViewportHeight: usableHeight,
    scrollPositionConfidence: 0.85,
  };
}

export function cropToUsableBounds(
  reference: Pick<NormalizedVisualReference, 'usablePageBounds' | 'pixelWidth' | 'pixelHeight'>,
): Bounds {
  return reference.usablePageBounds;
}
