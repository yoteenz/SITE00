/**
 * Device frame / browser chrome separation from implemented UI.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ReferenceFrameSegmentation } from './types.js';

export function segmentReferenceFrame(input: {
  naturalWidth: number;
  naturalHeight: number;
  viewport: DesignViewportClass;
}): ReferenceFrameSegmentation {
  const { naturalWidth: w, naturalHeight: h, viewport } = input;

  if (viewport === 'mobile') {
    const deviceFrame: ReferenceFrameSegmentation['deviceFrameRegion'] = {
      x: 0,
      y: 0,
      width: w,
      height: h,
    };
    const chromeHeight = Math.round(h * 0.06);
    const contentY = chromeHeight;
    const contentH = h - chromeHeight * 2;
    return {
      deviceFrameRegion: deviceFrame,
      browserChromeRegion: { x: 0, y: 0, width: w, height: chromeHeight },
      implementedUiRegion: { x: 0, y: contentY, width: w, height: contentH },
      contentCanvasRegion: { x: 16, y: contentY + 8, width: w - 32, height: contentH - 16 },
      ignoredContextRegion: { x: 0, y: h - chromeHeight, width: w, height: chromeHeight },
    };
  }

  return {
    deviceFrameRegion: null,
    browserChromeRegion: null,
    implementedUiRegion: { x: 0, y: 0, width: w, height: h },
    contentCanvasRegion: { x: 24, y: 24, width: w - 48, height: h - 48 },
    ignoredContextRegion: null,
  };
}
