/**
 * P0.VR.1D.1 — RenderedDomMeasurementMap capture after render.
 */

import { randomUUID } from 'node:crypto';
import type { RenderedDomMeasurement, RenderedDomMeasurementMap, ScreenImplementationSpec } from './types.js';

export type DomMeasurementInput = {
  route: string;
  renderAssetId: string;
  measuredRegions: Array<{
    regionId: string;
    rect: { x: number; y: number; width: number; height: number };
    computed: Partial<RenderedDomMeasurement>;
  }>;
};

export function captureRenderedDomMeasurementMap(input: DomMeasurementInput): RenderedDomMeasurementMap {
  const measurements: RenderedDomMeasurement[] = input.measuredRegions.map((region) => ({
    regionId: region.regionId,
    actualX: region.rect.x,
    actualY: region.rect.y,
    actualWidth: region.rect.width,
    actualHeight: region.rect.height,
    computedPadding: region.computed.computedPadding ?? '0px',
    computedMargin: region.computed.computedMargin ?? '0px',
    computedGap: region.computed.computedGap ?? '0px',
    computedFontSize: region.computed.computedFontSize ?? '16px',
    computedLineHeight: region.computed.computedLineHeight ?? 'normal',
    computedPosition: region.computed.computedPosition ?? 'static',
    computedDisplay: region.computed.computedDisplay ?? 'block',
    computedGrid: region.computed.computedGrid ?? null,
    computedFlex: region.computed.computedFlex ?? null,
    computedZIndex: region.computed.computedZIndex ?? 'auto',
  }));

  return {
    mapId: randomUUID(),
    route: input.route,
    renderAssetId: input.renderAssetId,
    measurements,
    capturedAt: new Date().toISOString(),
  };
}

/** Simulate DOM measurement from implementation spec (test / skipRender path). */
export function simulateDomMeasurementFromSpec(
  spec: ScreenImplementationSpec,
  drift: Record<string, Partial<{ x: number; y: number; width: number; height: number }>> = {},
): RenderedDomMeasurementMap {
  return captureRenderedDomMeasurementMap({
    route: spec.route,
    renderAssetId: `render-${spec.screenId}`,
    measuredRegions: spec.regions.map((region) => {
      const d = drift[region.regionId] ?? {};
      return {
        regionId: region.regionId,
        rect: {
          x: region.xPx + (d.x ?? 0),
          y: region.yPx + (d.y ?? 0),
          width: region.widthPx + (d.width ?? 0),
          height: region.heightPx + (d.height ?? 0),
        },
        computed: {
          computedPadding: region.padding,
          computedMargin: region.margin,
          computedGap: `${region.gapPx}px`,
          computedFontSize: String(region.textStyles.fontSizePx ?? '16px'),
          computedLineHeight: String(region.textStyles.lineHeightPx ?? 'normal'),
          computedPosition: region.positioningMode,
          computedDisplay: region.displayMode,
          computedGrid: region.gridTemplate,
          computedFlex: region.flexDirection,
          computedZIndex: String(region.zIndex),
        },
      };
    }),
  });
}

export function domMeasurementCaptureImplemented(map: RenderedDomMeasurementMap): boolean {
  return map.measurements.length > 0 && map.measurements.every((m) => m.actualWidth >= 0);
}
