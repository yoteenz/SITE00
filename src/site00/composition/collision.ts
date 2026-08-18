import type { CompositionZone, RegisteredOverlay, ViewportRect } from './types';

export type CompositionCollision = {
  overlayId: string;
  zoneId: string;
  zoneLabel: string;
  overlapRatio: number;
};

function rectArea(r: ViewportRect): number {
  return Math.max(0, r.width) * Math.max(0, r.height);
}

function intersectionArea(a: ViewportRect, b: ViewportRect): number {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const bottom = Math.min(a.top + a.height, b.top + b.height);
  if (right <= left || bottom <= top) return 0;
  return (right - left) * (bottom - top);
}

/** Returns collisions where overlay intersects protected zones beyond tolerance. */
export function detectProtectedCollisions(
  overlays: RegisteredOverlay[],
  protectedZones: CompositionZone[],
  zoneRects: Map<string, ViewportRect>,
): CompositionCollision[] {
  const hits: CompositionCollision[] = [];

  for (const overlay of overlays) {
    if (!overlay.persistent) continue;
    for (const zone of protectedZones) {
      const zoneRect = zoneRects.get(zone.id);
      if (!zoneRect) continue;
      const overlap = intersectionArea(overlay.rect, zoneRect);
      const zoneArea = rectArea(zoneRect);
      if (zoneArea <= 0) continue;
      const ratio = overlap / zoneArea;
      const tolerance = zone.collisionTolerance ?? 0.08;
      if (ratio > tolerance) {
        hits.push({
          overlayId: overlay.id,
          zoneId: zone.id,
          zoneLabel: zone.label,
          overlapRatio: ratio,
        });
      }
    }
  }

  return hits;
}

export function formatCompositionWarnings(collisions: CompositionCollision[]): string[] {
  return collisions.map(
    (c) =>
      `[Composition Warning] ${c.overlayId} intersects protected zone "${c.zoneLabel}" (${Math.round(c.overlapRatio * 100)}% overlap).`,
  );
}
