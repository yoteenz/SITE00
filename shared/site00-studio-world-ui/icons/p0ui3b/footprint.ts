import type { IconPixelMask, IconReferenceFootprint } from './types.js';
import { maskBoundingBox } from './maskExtraction.js';

export function computeIconReferenceFootprint(
  mask: IconPixelMask,
  buttonSize = 48,
): IconReferenceFootprint {
  const bbox = maskBoundingBox(mask);
  if (!bbox) {
    return {
      iconName: mask.iconName,
      referenceOuterWidth: 0,
      referenceOuterHeight: 0,
      referenceVisualCenterX: mask.width / 2,
      referenceVisualCenterY: mask.height / 2,
      referenceToButtonRatio: 0,
    };
  }
  const w = bbox.maxX - bbox.minX + 1;
  const h = bbox.maxY - bbox.minY + 1;
  return {
    iconName: mask.iconName,
    referenceOuterWidth: w,
    referenceOuterHeight: h,
    referenceVisualCenterX: (bbox.minX + bbox.maxX) / 2,
    referenceVisualCenterY: (bbox.minY + bbox.maxY) / 2,
    referenceToButtonRatio: Math.max(w, h) / buttonSize,
  };
}

export function computeOpticalBoundsFromPaths(
  paths: string[],
  circles: Array<{ cx: number; cy: number; r: number }> = [],
) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const circle of circles) {
    xs.push(circle.cx - circle.r, circle.cx + circle.r);
    ys.push(circle.cy - circle.r, circle.cy + circle.r);
  }
  const nums = paths.join(' ').match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
  for (let i = 0; i < nums.length; i += 2) {
    if (nums[i + 1] !== undefined) {
      xs.push(nums[i]);
      ys.push(nums[i + 1]);
    }
  }
  if (xs.length === 0) {
    return {
      minX: 6,
      minY: 6,
      maxX: 18,
      maxY: 18,
      visualWidth: 12,
      visualHeight: 12,
      visualCenterX: 12,
      visualCenterY: 12,
    };
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    minY,
    maxX,
    maxY,
    visualWidth: maxX - minX,
    visualHeight: maxY - minY,
    visualCenterX: (minX + maxX) / 2,
    visualCenterY: (minY + maxY) / 2,
  };
}

export function computeOpticalCalibration(bounds: ReturnType<typeof computeOpticalBoundsFromPaths>, scale = 1) {
  const targetCenter = 12;
  const offsetX = (targetCenter - bounds.visualCenterX) * 0.15;
  const offsetY = (targetCenter - bounds.visualCenterY) * 0.15;
  return {
    opticalScale: scale,
    opticalOffsetX: Number(offsetX.toFixed(2)),
    opticalOffsetY: Number(offsetY.toFixed(2)),
    bounds,
  };
}
