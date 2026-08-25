export type Point = { x: number; y: number };

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  }
  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy);
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  return Math.hypot(point.x - projX, point.y - projY);
}

/** Ramer–Douglas–Peucker path simplification. */
export function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points.slice();
  let maxDist = 0;
  let maxIndex = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end]);
    if (dist > maxDist) {
      maxDist = dist;
      maxIndex = i;
    }
  }
  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon);
    const right = simplifyPath(points.slice(maxIndex), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[end]];
}

export function contourToSvgPath(points: Point[], close = true): string {
  if (points.length === 0) return '';
  const parts = [`M ${fmt(points[0].x)} ${fmt(points[0].y)}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${fmt(points[i].x)} ${fmt(points[i].y)}`);
  }
  if (close) parts.push('Z');
  return parts.join(' ');
}

export function polylineToSvgPath(points: Point[]): string {
  if (points.length === 0) return '';
  const parts = [`M ${fmt(points[0].x)} ${fmt(points[0].y)}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${fmt(points[i].x)} ${fmt(points[i].y)}`);
  }
  return parts.join(' ');
}

function fmt(n: number): string {
  return Number(n.toFixed(2)).toString();
}

export function normalizePointsToViewBox(
  points: Point[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  viewBox = 24,
  padding = 1.5,
): Point[] {
  const bw = Math.max(1, bounds.maxX - bounds.minX);
  const bh = Math.max(1, bounds.maxY - bounds.minY);
  const scale = (viewBox - padding * 2) / Math.max(bw, bh);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const center = viewBox / 2;
  return points.map((p) => ({
    x: center + (p.x - cx) * scale,
    y: center + (p.y - cy) * scale,
  }));
}
