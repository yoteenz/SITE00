import { computeDisplayedImageBounds, normalizedRectToViewport } from '../engine';
import type { DisplayedImageBounds, EnvironmentCompositionMap, NormalizedRect } from '../types';
import type { CompositionStudioDocument, CompositionStudioObject, ResponsiveViewport } from './types';

export function resolveObjectRect(
  obj: CompositionStudioObject,
  viewport: ResponsiveViewport = 'mobile',
): NormalizedRect {
  return obj.responsiveOverrides?.[viewport] ?? obj.rect;
}

export function getDisplayedBounds(
  map: EnvironmentCompositionMap,
  containerWidth: number,
  containerHeight: number,
): DisplayedImageBounds {
  return computeDisplayedImageBounds(
    containerWidth,
    containerHeight,
    map.canvasWidth,
    map.canvasHeight,
    map.objectFit,
    map.objectPosition,
  );
}

export function objectToViewportRect(
  obj: CompositionStudioObject,
  displayed: DisplayedImageBounds,
  viewport: ResponsiveViewport = 'mobile',
): { left: number; top: number; width: number; height: number } {
  return normalizedRectToViewport(resolveObjectRect(obj, viewport), displayed);
}

/** CSS custom properties for locked composition implementation contract. */
export function lockedCompositionCssVars(
  doc: CompositionStudioDocument,
  containerWidth: number,
  containerHeight: number,
  viewport: ResponsiveViewport = 'mobile',
): Record<string, string> {
  const displayed = getDisplayedBounds(doc.baseMap, containerWidth, containerHeight);
  const vars: Record<string, string> = {
    '--comp-status': doc.status,
    '--comp-version': doc.version,
  };

  for (const obj of doc.objects) {
    if (!obj.visible) continue;
    const slug = obj.id.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const r = objectToViewportRect(obj, displayed, viewport);
    vars[`--comp-${slug}-left`] = `${r.left}px`;
    vars[`--comp-${slug}-top`] = `${r.top}px`;
    vars[`--comp-${slug}-width`] = `${r.width}px`;
    vars[`--comp-${slug}-height`] = `${r.height}px`;
    vars[`--comp-${slug}-nx`] = String(resolveObjectRect(obj, viewport).x);
    vars[`--comp-${slug}-ny`] = String(resolveObjectRect(obj, viewport).y);
    vars[`--comp-${slug}-nw`] = String(resolveObjectRect(obj, viewport).width);
    vars[`--comp-${slug}-nh`] = String(resolveObjectRect(obj, viewport).height);
    if (obj.text) {
      vars[`--comp-${slug}-align`] = obj.text.align;
      vars[`--comp-${slug}-scale`] = String(obj.text.scale ?? 1);
    }
  }

  return vars;
}
