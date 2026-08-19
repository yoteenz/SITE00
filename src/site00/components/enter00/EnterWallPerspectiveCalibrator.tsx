import { useLayoutEffect } from 'react';
import {
  SITE00_ENTER_WALL_PERSPECTIVE_DEFAULTS,
  readEnterWallPerspectiveFromUrl,
  type EnterWallPerspectiveOverrides,
} from '../../config/enter-wall-perspective';

const CSS_VAR = {
  perspective: '--site00-enter-wall-perspective',
  rotateZ: '--site00-enter-wall-rotate-z',
  rotateY: '--site00-enter-wall-rotate-y',
  skewX: '--site00-enter-wall-skew-x',
  opacity: '--site00-enter-wall-opacity',
  translateX: '--site00-enter-wall-translate-x',
  translateY: '--site00-enter-wall-translate-y',
} as const;

type EnterWallPerspectiveValues = EnterWallPerspectiveOverrides & {
  perspective: string;
  rotateZ: string;
  rotateY: string;
  skewX: string;
  opacity: string;
};

function applyVars(target: HTMLElement, values: EnterWallPerspectiveValues) {
  target.style.setProperty(CSS_VAR.perspective, values.perspective);
  target.style.setProperty(CSS_VAR.rotateZ, values.rotateZ);
  target.style.setProperty(CSS_VAR.rotateY, values.rotateY);
  target.style.setProperty(CSS_VAR.skewX, values.skewX);
  target.style.setProperty(CSS_VAR.opacity, values.opacity);
  if (values.translateX) target.style.setProperty(CSS_VAR.translateX, values.translateX);
  if (values.translateY) target.style.setProperty(CSS_VAR.translateY, values.translateY);
}

function clearVars(target: HTMLElement) {
  for (const name of Object.values(CSS_VAR)) {
    target.style.removeProperty(name);
  }
}

/** Desktop ENTER 00 — sync wall-perspective CSS vars from URL (dev calibration only). */
export function EnterWallPerspectiveCalibrator() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('.site00-enter-page');
    if (!root) return;

    const wide = window.matchMedia('(min-width: 768px)').matches;
    if (!wide) return;

    const { debug, overrides } = readEnterWallPerspectiveFromUrl();

    root.classList.toggle('site00-enter-wall-debug', debug);

    if (Object.keys(overrides).length > 0) {
      applyVars(root, { ...SITE00_ENTER_WALL_PERSPECTIVE_DEFAULTS, ...overrides });
    } else {
      clearVars(root);
    }

    return () => {
      root.classList.remove('site00-enter-wall-debug');
      clearVars(root);
    };
  }, []);

  return null;
}
