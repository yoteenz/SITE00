/**
 * P0.VR.DIAG.1R2 — DOM + computed style measurements for CURRENT page.
 */

import type { PageRegionLayoutDefinition } from './pageRegionLayoutProfiles.js';
import { geometryMetrics } from './stackLayout.js';
import type {
  DimensionMeasurementSource,
  DomRegionMeasurement,
  ForensicConfidence,
  VisualRegionBounds,
} from './types.js';

export type ExtractedScalar = {
  value: number;
  unit: 'px' | 'pct' | 'ratio' | 'count';
  source: DimensionMeasurementSource;
  confidence: ForensicConfidence;
};

export type CurrentDomExtraction = {
  scalars: Map<string, ExtractedScalar>;
  alignment: string | null;
};

function parseCss(value: string | number | undefined | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = /^([\d.]+)/.exec(String(value).trim());
  return match ? Number(match[1]) : null;
}

function parsePaddingEdge(padding: string | null | undefined, edge: 'top' | 'left'): number | null {
  if (!padding) return null;
  const parts = padding.trim().split(/\s+/);
  if (!parts.length) return null;
  if (parts.length === 1) return parseCss(parts[0]);
  if (parts.length === 2) return edge === 'top' ? parseCss(parts[0]) : parseCss(parts[1]);
  if (parts.length === 3) return edge === 'top' ? parseCss(parts[0]) : parseCss(parts[3] ?? parts[1]);
  return edge === 'top' ? parseCss(parts[0]) : parseCss(parts[3]);
}

export function extractCurrentDomMeasurements(input: {
  def: PageRegionLayoutDefinition;
  current: VisualRegionBounds;
  dom?: DomRegionMeasurement;
  cssSnapshot?: Record<string, string | number>;
  viewportWidth: number;
  contentPaddingX?: number | null;
}): CurrentDomExtraction {
  const scalars = new Map<string, ExtractedScalar>();
  const cur = geometryMetrics(input.current.geometry);
  const dom = input.dom;

  const put = (
    dimension: string,
    value: number | null,
    unit: ExtractedScalar['unit'],
    source: DimensionMeasurementSource,
    confidence: ForensicConfidence,
  ) => {
    if (value == null || !Number.isFinite(value)) return;
    scalars.set(dimension, { value, unit, source, confidence });
  };

  if (dom) {
    put('x', dom.actualX, 'px', 'DOM_RECT', 'HIGH');
    put('y', dom.actualY, 'px', 'DOM_RECT', 'HIGH');
    put('width', dom.actualWidth, 'px', 'DOM_RECT', 'HIGH');
    put('height', dom.actualHeight, 'px', 'DOM_RECT', 'HIGH');
    put('leftInset', dom.actualX, 'px', 'DOM_RECT', 'HIGH');
    put('rightInset', input.viewportWidth - (dom.actualX + dom.actualWidth), 'px', 'DOM_RECT', 'HIGH');
    put('topOffset', dom.actualY, 'px', 'DOM_RECT', 'HIGH');
    put('bottomEdgeY', dom.actualY + dom.actualHeight, 'px', 'DOM_RECT', 'HIGH');
    put('containerHeight', dom.actualHeight, 'px', 'DOM_RECT', 'HIGH');
    put('bandHeight', dom.actualHeight, 'px', 'DOM_RECT', 'HIGH');
    put('bandWidth', dom.actualWidth, 'px', 'DOM_RECT', 'HIGH');
    put('sectionWidth', dom.actualWidth, 'px', 'DOM_RECT', 'HIGH');
    put('sectionHeight', dom.actualHeight, 'px', 'DOM_RECT', 'HIGH');
    put('railWidth', dom.actualWidth, 'px', 'DOM_RECT', 'HIGH');
    put('railInset', dom.actualX, 'px', 'DOM_RECT', 'HIGH');

    const gap = parseCss(dom.computedGap);
    if (gap != null) put('itemGap', gap, 'px', 'COMPUTED_STYLE', 'HIGH');
    put('gap', gap ?? parseCss(input.cssSnapshot?.sectionGap), 'px', gap != null ? 'COMPUTED_STYLE' : 'CSS_SNAPSHOT', gap != null ? 'HIGH' : 'MEDIUM');

    const padTop = parsePaddingEdge(dom.computedPadding ?? null, 'top');
    const padLeft = parsePaddingEdge(dom.computedPadding ?? null, 'left');
    if (padTop != null) put('paddingTop', padTop, 'px', 'COMPUTED_STYLE', 'MEDIUM');
    if (padTop != null || padLeft != null) put('padding', padTop ?? padLeft ?? 0, 'px', 'COMPUTED_STYLE', 'MEDIUM');

    const fs = parseCss(dom.computedFontSize);
    if (fs != null) {
      put('fontSize', fs, 'px', 'COMPUTED_STYLE', 'HIGH');
      put('labelFontSize', fs, 'px', 'COMPUTED_STYLE', 'HIGH');
      put('valueFontSize', fs, 'px', 'COMPUTED_STYLE', 'MEDIUM');
    }
    const lh = parseCss(dom.computedLineHeight);
    if (lh != null) put('lineHeight', lh, 'px', 'COMPUTED_STYLE', 'HIGH');

    if (dom.actualWidth > 0 && dom.actualHeight > 0) {
      put('aspectRatio', dom.actualWidth / dom.actualHeight, 'ratio', 'DOM_RECT', 'HIGH');
    }
  } else {
    put('width', cur.width, 'px', 'SCREENSHOT_ESTIMATE', 'MEDIUM');
    put('height', cur.height, 'px', 'SCREENSHOT_ESTIMATE', 'MEDIUM');
    put('leftOffset', cur.leftOffset, 'px', 'LAYOUT_PROFILE', 'MEDIUM');
    put('topOffset', cur.topOffset, 'px', 'LAYOUT_PROFILE', 'MEDIUM');
    put('x', cur.x, 'px', 'LAYOUT_PROFILE', 'MEDIUM');
    put('y', cur.y, 'px', 'LAYOUT_PROFILE', 'MEDIUM');
  }

  const contentPad = input.contentPaddingX ?? parseCss(input.cssSnapshot?.contentPaddingX);
  if (contentPad != null && !scalars.has('leftInset')) {
    put('leftInset', contentPad, 'px', 'CSS_SNAPSHOT', 'MEDIUM');
  }

  put('leftOffset', scalars.get('leftInset')?.value ?? cur.leftOffset, 'px', dom ? 'DOM_RECT' : 'LAYOUT_PROFILE', dom ? 'HIGH' : 'MEDIUM');
  put('occupiedAreaPct', cur.occupiedAreaPct, 'pct', dom ? 'DOM_RECT' : 'LAYOUT_PROFILE', 'MEDIUM');

  const alignment = dom?.computedJustifyContent ?? dom?.computedAlignItems ?? null;

  return { scalars, alignment };
}
