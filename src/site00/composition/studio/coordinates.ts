import type { DisplayedImageBounds, NormalizedRect, ViewportRect } from '../types';

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function clampNormalizedRect(rect: NormalizedRect): NormalizedRect {
  const x = clamp01(rect.x);
  const y = clamp01(rect.y);
  const width = Math.max(0.01, Math.min(1 - x, rect.width));
  const height = Math.max(0.01, Math.min(1 - y, rect.height));
  return { x, y, width, height };
}

/** Viewport px rect → normalized source-space rect. */
export function viewportRectToNormalized(
  rect: ViewportRect,
  displayed: DisplayedImageBounds,
): NormalizedRect {
  if (displayed.width <= 0 || displayed.height <= 0) return rect as unknown as NormalizedRect;
  return clampNormalizedRect({
    x: (rect.left - displayed.offsetX) / displayed.width,
    y: (rect.top - displayed.offsetY) / displayed.height,
    width: rect.width / displayed.width,
    height: rect.height / displayed.height,
  });
}

/** Delta in viewport px → delta in normalized space. */
export function viewportDeltaToNormalized(
  dx: number,
  dy: number,
  displayed: DisplayedImageBounds,
): { dx: number; dy: number } {
  return {
    dx: displayed.width > 0 ? dx / displayed.width : 0,
    dy: displayed.height > 0 ? dy / displayed.height : 0,
  };
}

export type SnapGuide = {
  axis: 'x' | 'y';
  value: number;
  label: string;
};

const SNAP_THRESHOLD_PX = 6;

/** Subtle snap to canvas center, zone edges, and focal points. */
export function computeSnapGuides(
  moving: ViewportRect,
  canvasW: number,
  canvasH: number,
  others: ViewportRect[],
  focalPoints: { x: number; y: number }[],
  displayed: DisplayedImageBounds,
): { rect: ViewportRect; guides: SnapGuide[] } {
  const guides: SnapGuide[] = [];
  let { left, top, width, height } = moving;
  const cx = left + width / 2;
  const cy = top + height / 2;

  const snapX = (target: number, label: string, point: number) => {
    if (Math.abs(point - target) <= SNAP_THRESHOLD_PX) {
      guides.push({ axis: 'x', value: target, label });
      return target - (point - left);
    }
    return left;
  };

  const snapY = (target: number, label: string, point: number) => {
    if (Math.abs(point - target) <= SNAP_THRESHOLD_PX) {
      guides.push({ axis: 'y', value: target, label });
      return target - (point - top);
    }
    return top;
  };

  left = snapX(canvasW / 2, 'canvas-center', cx);
  top = snapY(canvasH * 0.34, 'vanishing-point', cy);

  for (const fp of focalPoints) {
    const fx = displayed.offsetX + fp.x * displayed.width;
    const fy = displayed.offsetY + fp.y * displayed.height;
    left = snapX(fx, 'focal', cx);
    top = snapY(fy, 'focal', cy);
  }

  for (const o of others) {
    left = snapX(o.left, 'edge', left);
    left = snapX(o.left + o.width, 'edge', left + width);
    top = snapY(o.top, 'edge', top);
  }

  return { rect: { left, top, width, height }, guides };
}
