/**
 * P0.VR.1D.1 — RegionCodeSpec: reference geometry → concrete code properties.
 */

import type { LayoutRegionGeometry } from '../p0vr1d/types.js';
import type { PixelGeometryContractEntry } from '../p0vr1d/types.js';
import type { ReferenceTypographyContractEntry } from '../p0vr1d/types.js';
import type { RegionCodeSpec } from './types.js';

export function buildRegionCodeSpec(input: {
  geometry: PixelGeometryContractEntry;
  layout: LayoutRegionGeometry;
  viewportWidth: number;
  viewportHeight: number;
  typography?: ReferenceTypographyContractEntry;
  layoutParent?: string | null;
  assetId?: string | null;
}): RegionCodeSpec {
  const { geometry, layout, viewportWidth, viewportHeight } = input;
  const positioningMode = inferPositioningMode(layout);
  const displayMode = inferDisplayMode(layout);

  return {
    regionId: geometry.regionId,
    semanticRole: layout.role,
    xPx: geometry.referenceX,
    yPx: geometry.referenceY,
    widthPx: geometry.referenceWidth,
    heightPx: geometry.referenceHeight,
    xPercent: (geometry.referenceX / viewportWidth) * 100,
    yPercent: (geometry.referenceY / viewportHeight) * 100,
    widthPercent: (geometry.referenceWidth / viewportWidth) * 100,
    heightPercent: (geometry.referenceHeight / viewportHeight) * 100,
    layoutParent: input.layoutParent ?? null,
    positioningMode,
    displayMode,
    gridTemplate: displayMode === 'grid' ? inferGridTemplate(layout) : null,
    flexDirection: displayMode === 'flex' ? inferFlexDirection(layout) : null,
    gapPx: layout.gap,
    padding: `${layout.padding}px`,
    margin: '0',
    border: null,
    borderRadius: layout.borderRadius,
    background: null,
    zIndex: layout.zIndexHint,
    overflow: 'visible',
    assetId: input.assetId ?? null,
    textStyles: typographyToCss(input.typography),
    interactionMode: inferInteractionMode(layout.role),
  };
}

function typographyToCss(entry?: ReferenceTypographyContractEntry): Record<string, string | number | null> {
  if (!entry) {
    return {
      fontFamily: null,
      fontSizePx: null,
      fontWeight: null,
      lineHeightPx: null,
      letterSpacing: null,
      textTransform: null,
      maxWidthPx: null,
      textAlign: null,
      whiteSpace: null,
    };
  }
  return {
    fontFamily: entry.fontFamily ?? entry.fallbackClass,
    fontSizePx: entry.sizePx,
    fontWeight: entry.weight,
    lineHeightPx: Math.round(entry.sizePx * entry.lineHeight),
    letterSpacing: entry.tracking,
    textTransform: entry.textCase === 'upper' ? 'uppercase' : entry.textCase === 'lower' ? 'lowercase' : 'none',
    maxWidthPx: entry.maxWidth,
    textAlign: entry.alignment,
    whiteSpace: entry.preserveLineBreaks ? 'pre-line' : 'normal',
    lineBreakPositions: entry.lineBreaks.join('\n'),
  };
}

function inferPositioningMode(layout: LayoutRegionGeometry): RegionCodeSpec['positioningMode'] {
  if (layout.role === 'BOTTOM_NAV') return 'fixed';
  if (layout.role === 'TOP_NAV' || layout.role === 'HEADER_LOGO') return 'sticky';
  if (layout.zIndexHint > 10) return 'absolute';
  return 'relative';
}

function inferDisplayMode(layout: LayoutRegionGeometry): string {
  if (layout.role === 'LEFT_PANEL' || layout.role === 'CENTER_PANEL' || layout.role === 'RIGHT_PANEL') {
    return 'grid';
  }
  if (layout.role === 'BOTTOM_NAV' || layout.role === 'TOP_NAV') return 'flex';
  return 'block';
}

function inferGridTemplate(layout: LayoutRegionGeometry): string | null {
  if (layout.role === 'CENTER_PANEL') return 'repeat(auto-fill, minmax(0, 1fr))';
  return null;
}

function inferFlexDirection(layout: LayoutRegionGeometry): string | null {
  if (layout.role === 'BOTTOM_NAV') return 'row';
  return 'column';
}

function inferInteractionMode(role: string): RegionCodeSpec['interactionMode'] {
  if (role.includes('NAV')) return 'link';
  if (role === 'CTA') return 'button';
  if (role === 'CENTER_PANEL') return 'scroll';
  return 'static';
}

export function regionGeometryTranslatedToCode(spec: RegionCodeSpec): boolean {
  return spec.widthPx > 0 && spec.heightPx > 0 && spec.displayMode.length > 0;
}
