/**
 * ENTER 00 desktop — hero copy perspective plane (environment-aligned wall text).
 * Tune defaults here; override at runtime via ?enterWallDebug=1&enterWallRotateZ=11 etc.
 */

export const SITE00_ENTER_WALL_PERSPECTIVE_DEFAULTS = {
  perspective: '1400px',
  rotateZ: '11deg',
  rotateY: '-3deg',
  skewX: '-1deg',
  opacity: '0.98',
} as const;

export type EnterWallPerspectiveOverrides = {
  perspective?: string;
  rotateZ?: string;
  rotateY?: string;
  skewX?: string;
  opacity?: string;
  translateX?: string;
  translateY?: string;
};

export function readEnterWallPerspectiveFromUrl(): {
  debug: boolean;
  overrides: EnterWallPerspectiveOverrides;
} {
  if (typeof window === 'undefined') {
    return { debug: false, overrides: {} };
  }

  const params = new URLSearchParams(window.location.search);
  const debug = params.get('enterWallDebug') === '1';
  const overrides: EnterWallPerspectiveOverrides = {};

  const map: Array<[keyof EnterWallPerspectiveOverrides, string]> = [
    ['perspective', 'enterWallPerspective'],
    ['rotateZ', 'enterWallRotateZ'],
    ['rotateY', 'enterWallRotateY'],
    ['skewX', 'enterWallSkewX'],
    ['opacity', 'enterWallOpacity'],
    ['translateX', 'enterWallLeft'],
    ['translateY', 'enterWallTop'],
  ];

  for (const [key, param] of map) {
    const value = params.get(param);
    if (value != null && value !== '') {
      overrides[key] = value;
    }
  }

  return { debug, overrides };
}
