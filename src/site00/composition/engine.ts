import type {
  DisplayedImageBounds,
  EnvironmentCompositionMap,
  NormalizedRect,
  ViewportRect,
  CompositionZone,
} from './types';

/** Parse object-position keyword pair (e.g. "center top"). */
function parseObjectPosition(position: string): { x: number; y: number } {
  const parts = position.trim().toLowerCase().split(/\s+/);
  const xToken = parts[0] ?? 'center';
  const yToken = parts[1] ?? 'center';

  const axis = (token: string, axis: 'x' | 'y'): number => {
    if (token.endsWith('%')) return Math.min(1, Math.max(0, parseFloat(token) / 100));
    if (axis === 'x') {
      if (token === 'left') return 0;
      if (token === 'right') return 1;
      return 0.5;
    }
    if (token === 'top') return 0;
    if (token === 'bottom') return 1;
    return 0.5;
  };

  return { x: axis(xToken, 'x'), y: axis(yToken, 'y') };
}

/**
 * Compute displayed image bounds for object-fit: cover + object-position.
 * SOURCE IMAGE SPACE → DISPLAYED IMAGE SPACE → CROPPED VIEWPORT SPACE
 */
export function computeDisplayedImageBounds(
  containerWidth: number,
  containerHeight: number,
  sourceWidth: number,
  sourceHeight: number,
  objectFit: 'cover' = 'cover',
  objectPosition = 'center top',
): DisplayedImageBounds {
  if (containerWidth <= 0 || containerHeight <= 0 || sourceWidth <= 0 || sourceHeight <= 0) {
    return {
      offsetX: 0,
      offsetY: 0,
      width: containerWidth,
      height: containerHeight,
      scale: 1,
      visibleSource: { x: 0, y: 0, width: 1, height: 1 },
    };
  }

  const scale =
    objectFit === 'cover'
      ? Math.max(containerWidth / sourceWidth, containerHeight / sourceHeight)
      : Math.min(containerWidth / sourceWidth, containerHeight / sourceHeight);

  const displayedW = sourceWidth * scale;
  const displayedH = sourceHeight * scale;
  const { x: posX, y: posY } = parseObjectPosition(objectPosition);

  const overflowX = displayedW - containerWidth;
  const overflowY = displayedH - containerHeight;

  const offsetX = overflowX > 0 ? -overflowX * posX : (containerWidth - displayedW) / 2;
  const offsetY = overflowY > 0 ? -overflowY * posY : (containerHeight - displayedH) / 2;

  const visLeft = Math.max(0, -offsetX);
  const visTop = Math.max(0, -offsetY);
  const visRight = Math.min(displayedW, containerWidth - offsetX);
  const visBottom = Math.min(displayedH, containerHeight - offsetY);

  const visibleSource: NormalizedRect = {
    x: visLeft / displayedW,
    y: visTop / displayedH,
    width: Math.max(0, (visRight - visLeft) / displayedW),
    height: Math.max(0, (visBottom - visTop) / displayedH),
  };

  return {
    offsetX,
    offsetY,
    width: displayedW,
    height: displayedH,
    scale,
    visibleSource,
  };
}

/** Map normalized source rect → viewport overlay rect (px). */
export function normalizedRectToViewport(
  rect: NormalizedRect,
  displayed: DisplayedImageBounds,
): ViewportRect {
  return {
    left: displayed.offsetX + rect.x * displayed.width,
    top: displayed.offsetY + rect.y * displayed.height,
    width: rect.width * displayed.width,
    height: rect.height * displayed.height,
  };
}

export function allCompositionZones(map: EnvironmentCompositionMap): CompositionZone[] {
  return [
    ...map.protectedZones,
    ...map.preferredZones,
    ...map.conditionalZones,
    ...map.navigationZones,
  ];
}

export function buildCompositionLayout(
  map: EnvironmentCompositionMap,
  containerWidth: number,
  containerHeight: number,
): Map<string, ViewportRect> {
  const displayed = computeDisplayedImageBounds(
    containerWidth,
    containerHeight,
    map.canvasWidth,
    map.canvasHeight,
    map.objectFit,
    map.objectPosition,
  );

  const zones = new Map<string, ViewportRect>();
  for (const zone of allCompositionZones(map)) {
    zones.set(zone.id, normalizedRectToViewport(zone.rect, displayed));
  }
  return zones;
}

export function compositionCssVars(
  map: EnvironmentCompositionMap,
  containerWidth: number,
  containerHeight: number,
): Record<string, string> {
  const displayed = computeDisplayedImageBounds(
    containerWidth,
    containerHeight,
    map.canvasWidth,
    map.canvasHeight,
    map.objectFit,
    map.objectPosition,
  );

  const zones = buildCompositionLayout(map, containerWidth, containerHeight);
  const vars: Record<string, string> = {
    '--env-display-scale': String(displayed.scale),
    '--env-display-offset-x': `${displayed.offsetX}px`,
    '--env-display-offset-y': `${displayed.offsetY}px`,
  };

  for (const [id, rect] of zones) {
    const slug = id.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    vars[`--zone-${slug}-left`] = `${rect.left}px`;
    vars[`--zone-${slug}-top`] = `${rect.top}px`;
    vars[`--zone-${slug}-width`] = `${rect.width}px`;
    vars[`--zone-${slug}-height`] = `${rect.height}px`;
  }

  const corridor = map.protectedZones.find((z) => z.id.includes('corridor') || z.role === 'hero');
  if (corridor) {
    const r = normalizedRectToViewport(corridor.rect, displayed);
    vars['--corridor-left'] = `${r.left}px`;
    vars['--corridor-right'] = `${r.left + r.width}px`;
    vars['--corridor-top'] = `${r.top}px`;
    vars['--corridor-bottom'] = `${r.top + r.height}px`;
    vars['--corridor-width'] = `${r.width}px`;
  }

  const nav = map.navigationZones[0];
  if (nav) {
    const r = normalizedRectToViewport(nav.rect, displayed);
    vars['--nav-zone-top'] = `${r.top}px`;
    vars['--nav-zone-height'] = `${r.height}px`;
  }

  const library = map.preferredZones.find((z) => z.role === 'library') ?? map.preferredZones.find((z) => z.role === 'content');
  if (library) {
    const r = normalizedRectToViewport(library.rect, displayed);
    vars['--library-zone-top'] = `${r.top}px`;
  }

  return vars;
}

export function isImplementationReady(map: EnvironmentCompositionMap): boolean {
  return map.approvalStatus === 'APPROVED' || map.analysisStatus === 'APPROVED';
}
