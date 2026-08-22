/** Canonical SITE 00 mobile preview artboard — matches Composition Studio mobile preset (390×844). */
export const SITE00_MOBILE_ARTBOARD_WIDTH = 390;

export const SITE00_MOBILE_ARTBOARD_HEIGHT = 844;

/** Device chrome around the artboard screen on laptop Mobile preview. */
export const SITE00_MOBILE_DEVICE_BEZEL_PX = 14;

/** Home-indicator chin below the screen inset. */
export const SITE00_MOBILE_DEVICE_CHIN_PX = 22;

export type Site00MobileDevicePreviewScaleBox = {
  /** Scale applied to the entire phone frame (content stays 1:1 inside the screen). */
  scale: number;
  /** Unscaled phone frame dimensions (CSS px). */
  frameWidth: number;
  frameHeight: number;
  /** Layout slot size after frame scale — used to center the device in the shell. */
  scaledFrameWidth: number;
  scaledFrameHeight: number;
  /** Screen viewport — always the canonical artboard size. */
  screenWidth: number;
  screenHeight: number;
};

/** Fit a phone device frame inside the composer shell — never stretch to full laptop width. */
export function measureSite00MobileDevicePreviewScaleBox(
  shellWidth: number,
  shellHeight: number,
): Site00MobileDevicePreviewScaleBox {
  const bezel = SITE00_MOBILE_DEVICE_BEZEL_PX;
  const chin = SITE00_MOBILE_DEVICE_CHIN_PX;
  const screenW = SITE00_MOBILE_ARTBOARD_WIDTH;
  const screenH = SITE00_MOBILE_ARTBOARD_HEIGHT;
  const frameW = screenW + bezel * 2;
  const frameH = screenH + bezel * 2 + chin;

  const padX = 48;
  const padY = 72;
  const availW = Math.max(1, shellWidth - padX);
  const availH = Math.max(1, shellHeight - padY);

  const scale = Math.min(availW / frameW, availH / frameH, 1.15);

  return {
    scale,
    frameWidth: frameW,
    frameHeight: frameH,
    scaledFrameWidth: frameW * scale,
    scaledFrameHeight: frameH * scale,
    screenWidth: screenW,
    screenHeight: screenH,
  };
}
