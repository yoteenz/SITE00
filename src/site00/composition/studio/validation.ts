import { detectProtectedCollisions } from '../collision';
import { buildCompositionLayout, normalizedRectToViewport } from '../engine';
import type { RegisteredOverlay, ViewportRect } from '../types';
import { documentToEnvironmentMap } from './types';
import type {
  CompositionStudioDocument,
  CompositionValidationFinding,
  CompositionValidationOverride,
} from './types';

function rectsOverlap(a: ViewportRect, b: ViewportRect): number {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.left + a.width, b.left + b.width);
  const bottom = Math.min(a.top + a.height, b.top + b.height);
  if (right <= left || bottom <= top) return 0;
  const area = (right - left) * (bottom - top);
  const minArea = Math.min(a.width * a.height, b.width * b.height);
  return minArea > 0 ? area / minArea : 0;
}

function isOverridden(findingId: string, overrides: CompositionValidationOverride[]): boolean {
  return overrides.some((o) => o.findingId === findingId);
}

/** Validate composition document before approval. */
export function validateCompositionDocument(
  doc: CompositionStudioDocument,
  containerWidth = 390,
  containerHeight = 844,
): CompositionValidationFinding[] {
  const findings: CompositionValidationFinding[] = [];
  const map = documentToEnvironmentMap(doc);
  const zoneRects = buildCompositionLayout(map, containerWidth, containerHeight);
  const displayed = buildCompositionLayout(map, containerWidth, containerHeight);

  const overlays: RegisteredOverlay[] = doc.objects
    .filter((o) => o.visible && o.objectClass === 'interface')
    .map((o) => {
      const zoneRect = zoneRects.get(o.zoneId ?? '') ?? normalizedRectToViewport(o.rect, {
        offsetX: 0,
        offsetY: 0,
        width: containerWidth,
        height: containerHeight,
        scale: 1,
        visibleSource: { x: 0, y: 0, width: 1, height: 1 },
      });
      const rect = normalizedRectToViewport(o.rect, {
        offsetX: 0,
        offsetY: 0,
        width: containerWidth,
        height: containerHeight,
        scale: 1,
        visibleSource: { x: 0, y: 0, width: 1, height: 1 },
      });
      return { id: o.id, rect: { ...rect, left: zoneRect.left + (rect.left - 0), top: zoneRect.top }, persistent: true };
    });

  void displayed;

  const collisions = detectProtectedCollisions(overlays, map.protectedZones, zoneRects);
  for (const c of collisions) {
    findings.push({
      id: `collision-${c.overlayId}-${c.zoneId}`,
      severity: 'WARNING',
      message: `${c.overlayId} overlaps protected zone "${c.zoneLabel}" (${Math.round(c.overlapRatio * 100)}%).`,
      objectId: c.overlayId,
      zoneId: c.zoneId,
      overridable: true,
    });
  }

  for (const obj of doc.objects) {
    const { x, y, width, height } = obj.rect;
    if (x < 0 || y < 0 || x + width > 1.001 || y + height > 1.001) {
      findings.push({
        id: `bounds-${obj.id}`,
        severity: 'ERROR',
        message: `${obj.label} extends outside composition bounds.`,
        objectId: obj.id,
        overridable: false,
      });
    }
    if (width <= 0.005 || height <= 0.005) {
      findings.push({
        id: `size-${obj.id}`,
        severity: 'ERROR',
        message: `${obj.label} has invalid dimensions.`,
        objectId: obj.id,
        overridable: false,
      });
    }
    if (obj.recompositionRequest?.status === 'pending') {
      findings.push({
        id: `recompose-pending-${obj.id}`,
        severity: 'WARNING',
        message: `${obj.label} has a pending environment recomposition request.`,
        objectId: obj.id,
        overridable: true,
      });
    }
  }

  const interfaceObjects = doc.objects.filter((o) => o.visible && o.objectClass === 'interface');
  for (let i = 0; i < interfaceObjects.length; i++) {
    for (let j = i + 1; j < interfaceObjects.length; j++) {
      const a = interfaceObjects[i]!;
      const b = interfaceObjects[j]!;
      const ra = normalizedRectToViewport(a.rect, {
        offsetX: 0,
        offsetY: 0,
        width: containerWidth,
        height: containerHeight,
        scale: 1,
        visibleSource: { x: 0, y: 0, width: 1, height: 1 },
      });
      const rb = normalizedRectToViewport(b.rect, {
        offsetX: 0,
        offsetY: 0,
        width: containerWidth,
        height: containerHeight,
        scale: 1,
        visibleSource: { x: 0, y: 0, width: 1, height: 1 },
      });
      const overlap = rectsOverlap(ra, rb);
      if (overlap > 0.65) {
        findings.push({
          id: `overlap-${a.id}-${b.id}`,
          severity: 'WARNING',
          message: `${a.label} and ${b.label} substantially overlap.`,
          objectId: a.id,
          overridable: true,
        });
      }
    }
  }

  const nav = doc.objects.find((o) => o.id === 'assts-navigation' || o.semanticRole === 'navigation');
  if (nav && !nav.visible) {
    findings.push({
      id: 'missing-nav',
      severity: 'ERROR',
      message: 'Navigation is hidden — implementation requires bottom navigation.',
      objectId: nav.id,
      overridable: true,
    });
  }

  return findings.filter((f) => !isOverridden(f.id, doc.validationOverrides));
}

export function hasBlockingErrors(findings: CompositionValidationFinding[]): boolean {
  return findings.some((f) => f.severity === 'ERROR');
}
