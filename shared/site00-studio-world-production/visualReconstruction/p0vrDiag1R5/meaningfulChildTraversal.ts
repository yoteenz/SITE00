/**
 * P0.VR.DIAG.1R5B — Bounded descent through layout wrappers to meaningful units.
 */

import type { DomRegionMeasurement } from '../p0vrDiag1/types.js';

const MIN_MEANINGFUL_AREA = 16;
const MAX_TRAVERSE_DEPTH = 4;

function area(d: DomRegionMeasurement): number {
  return Math.max(0, d.actualWidth) * Math.max(0, d.actualHeight);
}

function insideChild(container: DomRegionMeasurement, child: DomRegionMeasurement): boolean {
  const cx = child.actualX + child.actualWidth / 2;
  const cy = child.actualY + child.actualHeight / 2;
  return (
    cx >= container.actualX &&
    cx <= container.actualX + container.actualWidth &&
    cy >= container.actualY &&
    cy <= container.actualY + container.actualHeight
  );
}

/** Decorative full-bleed wrappers with no distinct layout role. */
function isLikelyDecorativeWrapper(child: DomRegionMeasurement, container: DomRegionMeasurement): boolean {
  if (area(child) < MIN_MEANINGFUL_AREA) return true;
  const sameSize =
    Math.abs(child.actualWidth - container.actualWidth) < 2 &&
    Math.abs(child.actualHeight - container.actualHeight) < 2;
  return sameSize && child.actualHeight < container.actualHeight * 0.25;
}

export type MeaningfulChildCandidate = {
  dom: DomRegionMeasurement;
  depth: number;
  rejectionReason?: string;
};

export function collectMeaningfulChildCandidates(input: {
  container: DomRegionMeasurement;
  relatedDom: DomRegionMeasurement[];
  maxDepth?: number;
}): { accepted: DomRegionMeasurement[]; rejected: MeaningfulChildCandidate[] } {
  const maxDepth = input.maxDepth ?? MAX_TRAVERSE_DEPTH;
  const accepted: DomRegionMeasurement[] = [];
  const rejected: MeaningfulChildCandidate[] = [];

  const direct = input.relatedDom.filter((d) => insideChild(input.container, d));
  const queue: Array<{ dom: DomRegionMeasurement; depth: number }> = direct.map((d) => ({ dom: d, depth: 1 }));

  while (queue.length) {
    const { dom, depth } = queue.shift()!;
    if (area(dom) < MIN_MEANINGFUL_AREA) {
      rejected.push({ dom, depth, rejectionReason: 'ZERO_AREA' });
      continue;
    }
    if (isLikelyDecorativeWrapper(dom, input.container) && depth < maxDepth) {
      const nested = input.relatedDom.filter(
        (d) => d.regionId !== dom.regionId && insideChild(dom, d) && d.regionId.startsWith(input.container.regionId),
      );
      if (nested.length) {
        for (const n of nested) queue.push({ dom: n, depth: depth + 1 });
        rejected.push({ dom, depth, rejectionReason: 'DECORATIVE_ONLY' });
        continue;
      }
    }
    if (depth > maxDepth) {
      rejected.push({ dom, depth, rejectionReason: 'OUTSIDE_REGION' });
      continue;
    }
    accepted.push(dom);
  }

  return { accepted, rejected };
}

/** Detect repeated sibling rows (activity / list). */
export function detectRepeatedRowGeometry(children: DomRegionMeasurement[]): DomRegionMeasurement[] | null {
  if (children.length < 3) return null;
  const sorted = [...children].sort((a, b) => a.actualY - b.actualY);
  const h0 = sorted[0]!.actualHeight;
  const similar = sorted.filter((c) => Math.abs(c.actualHeight - h0) <= Math.max(4, h0 * 0.15));
  if (similar.length >= 3) return similar;
  return null;
}
