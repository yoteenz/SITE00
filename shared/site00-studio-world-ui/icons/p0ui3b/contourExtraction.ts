import type { IconGeometryDrawMode, IconPixelMask, IconVectorContour } from './types.js';
import type { Point } from './pathSimplification.js';
import { maskBoundingBox } from './maskExtraction.js';
import { simplifyPath, normalizePointsToViewBox } from './pathSimplification.js';

function n(v: number): string {
  return Number(v.toFixed(2)).toString();
}

const NEIGHBORS: Array<[number, number]> = [
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

function isEdgePixel(mask: IconPixelMask, x: number, y: number): boolean {
  if (!mask.data[y * mask.width + x]) return false;
  for (const [dx, dy] of NEIGHBORS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= mask.width || ny >= mask.height || !mask.data[ny * mask.width + nx]) {
      return true;
    }
  }
  return false;
}

function traceBoundary(mask: IconPixelMask, startX: number, startY: number, visited: Set<number>): Point[] {
  const points: Point[] = [];
  let x = startX;
  let y = startY;
  let dir = 0;
  const maxSteps = mask.width * mask.height * 2;
  for (let step = 0; step < maxSteps; step++) {
    const key = y * mask.width + x;
    if (visited.has(key)) break;
    visited.add(key);
    points.push({ x, y });

    let found = false;
    for (let i = 0; i < 8; i++) {
      const nd = (dir + i) % 8;
      const nx = x + NEIGHBORS[nd][0];
      const ny = y + NEIGHBORS[nd][1];
      if (nx >= 0 && ny >= 0 && nx < mask.width && ny < mask.height && isEdgePixel(mask, nx, ny)) {
        x = nx;
        y = ny;
        dir = (nd + 6) % 8;
        found = true;
        break;
      }
    }
    if (!found) break;
    if (x === startX && y === startY && points.length > 3) break;
  }
  return points;
}

function findDots(mask: IconPixelMask): Array<{ cx: number; cy: number; r: number }> {
  const visited = new Uint8Array(mask.data.length);
  const dots: Array<{ cx: number; cy: number; r: number }> = [];
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      const idx = y * mask.width + x;
      if (!mask.data[idx] || visited[idx]) continue;
      let minX = x,
        maxX = x,
        minY = y,
        maxY = y,
        count = 0;
      const stack: Array<[number, number]> = [[x, y]];
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        const cidx = cy * mask.width + cx;
        if (visited[cidx] || !mask.data[cidx]) continue;
        visited[cidx] = 1;
        count++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const [dx, dy] of NEIGHBORS) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && ny >= 0 && nx < mask.width && ny < mask.height) stack.push([nx, ny]);
        }
      }
      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      const aspect = w / Math.max(1, h);
      const fillRatio = count / (w * h);
      if (w <= 14 && h <= 14 && aspect > 0.65 && aspect < 1.55 && fillRatio > 0.45) {
        dots.push({
          cx: (minX + maxX) / 2,
          cy: (minY + maxY) / 2,
          r: Math.max(w, h) / 2,
        });
      }
    }
  }
  return dots;
}

function inferDrawMode(mask: IconPixelMask, dots: Array<{ cx: number; cy: number; r: number }>): IconGeometryDrawMode {
  const bbox = maskBoundingBox(mask);
  if (!bbox) return 'STROKE_PATH';
  const area = (bbox.maxX - bbox.minX + 1) * (bbox.maxY - bbox.minY + 1);
  const fillRatio = mask.foregroundPixelCount / Math.max(1, area);
  if (dots.length >= 2 && fillRatio < 0.35) return 'FILLED_PATH';
  if (dots.length >= 1 && fillRatio < 0.55) return 'MIXED';
  if (fillRatio > 0.55) return 'FILLED_PATH';
  return 'STROKE_PATH';
}

export function extractIconVectorContour(mask: IconPixelMask): IconVectorContour {
  const visited = new Set<number>();
  const outerContours: Point[][] = [];
  for (let y = 0; y < mask.height; y++) {
    for (let x = 0; x < mask.width; x++) {
      if (!isEdgePixel(mask, x, y)) continue;
      const key = y * mask.width + x;
      if (visited.has(key)) continue;
      const contour = traceBoundary(mask, x, y, visited);
      if (contour.length >= 4) {
        outerContours.push(simplifyPath(contour, 0.6));
      }
    }
  }

  const dots = findDots(mask);
  const drawMode = inferDrawMode(mask, dots);

  return {
    iconName: mask.iconName,
    drawMode,
    outerContours,
    holes: [],
    dots,
    internalStrokes: [],
  };
}

export function contourToNormalizedPaths(
  contour: IconVectorContour,
  mask: IconPixelMask,
  viewBox = 24,
): { paths: string[]; circles: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }> } {
  const bounds = maskBoundingBox(mask);
  if (!bounds) return { paths: [], circles: [] };

  const paths = contour.outerContours.map((c) => {
    const normalized = normalizeContour(c, bounds, viewBox);
    if (normalized.length < 2) return '';
    const parts = [`M ${n(normalized[0].x)} ${n(normalized[0].y)}`];
    for (let i = 1; i < normalized.length; i++) {
      parts.push(`L ${n(normalized[i].x)} ${n(normalized[i].y)}`);
    }
    if (contour.drawMode !== 'STROKE_PATH') parts.push('Z');
    return parts.join(' ');
  }).filter(Boolean);

  const scale = (viewBox - 3) / Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const center = viewBox / 2;
  const circles = contour.dots.map((d) => ({
    cx: center + (d.cx - cx) * scale,
    cy: center + (d.cy - cy) * scale,
    r: Math.max(0.6, d.r * scale * 0.85),
    fill: 'currentColor' as const,
  }));

  return { paths, circles };
}

function normalizeContour(points: Point[], bounds: { minX: number; minY: number; maxX: number; maxY: number }, viewBox: number): Point[] {
  return normalizePointsToViewBox(points, bounds, viewBox);
}
