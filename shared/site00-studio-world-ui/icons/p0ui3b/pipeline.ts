import type { ExactIconReferenceCrop, IconTraceOverlayResult, PixelTracedIconSpec } from './types.js';
import { extractIconPixelMask, maskBoundingBox } from './maskExtraction.js';
import { extractIconVectorContour, contourToNormalizedPaths } from './contourExtraction.js';
import { computeIconReferenceFootprint, computeOpticalBoundsFromPaths } from './footprint.js';
import { evaluateExactIconGeometry, detectSemanticSubstitution } from './evaluation.js';
import { NDX_ICON_VISUAL_VERSION_V2 } from './constants.js';
import type { NDXIconName } from '../types.js';

export type PixelTracePipelineInput = {
  iconName: NDXIconName;
  crop: ExactIconReferenceCrop;
  rgba: Buffer;
  width: number;
  height: number;
  channels: number;
  referenceSampleId: string;
  /** Refined paths override noisy auto-trace when provided */
  refinedPaths?: string[];
  refinedCircles?: Array<{ cx: number; cy: number; r: number; fill?: 'currentColor' | 'none' }>;
  strokeWidth?: number;
  opticalScale?: number;
  notes?: string;
};

export type PixelTracePipelineResult = {
  mask: ReturnType<typeof extractIconPixelMask>;
  contour: ReturnType<typeof extractIconVectorContour>;
  spec: PixelTracedIconSpec;
  evaluation: ReturnType<typeof evaluateExactIconGeometry>;
  overlay: IconTraceOverlayResult;
};

export function runPixelTracePipeline(input: PixelTracePipelineInput): PixelTracePipelineResult {
  const mask = extractIconPixelMask(input.rgba, input.width, input.height, input.channels, input.crop);
  const contour = extractIconVectorContour(mask);
  const auto = contourToNormalizedPaths(contour, mask);

  const pathData = input.refinedPaths ?? auto.paths;
  const circleData = input.refinedCircles ?? auto.circles;
  const bounds = computeOpticalBoundsFromPaths(pathData, circleData);
  const footprint = computeIconReferenceFootprint(mask);
  const strokeWidth = input.strokeWidth ?? (input.iconName === 'notifications' ? 1.35 : 1.4);

  const spec: PixelTracedIconSpec = {
    iconName: input.iconName,
    referenceSampleId: input.referenceSampleId,
    viewBox: 24,
    pathData,
    circleData: circleData.length ? circleData : undefined,
    drawMode: contour.drawMode,
    strokeWidth,
    fillMode: 'none',
    lineCap: 'round',
    lineJoin: 'round',
    opticalBounds: bounds,
    footprint,
    classification: 'PIXEL_TRACED',
    visualMatchStatus: 'VISUAL_MATCH',
    visualVersion: NDX_ICON_VISUAL_VERSION_V2,
    supersededGeometryId: 'NDX_ICON_GEOMETRY_V1_REFERENCE_TRACED',
    maskIou: 0,
    notes: input.notes ?? `pixel-traced from ${input.crop.sourceReferenceId}`,
  };

  const renderedMask = rasterizeSpecToMask(spec, mask.width, mask.height);
  const evaluation = evaluateExactIconGeometry(spec, mask, renderedMask);
  spec.maskIou = evaluation.metrics.MASK_IOU;
  if (evaluation.status === 'NEEDS_ADJUSTMENT') spec.visualMatchStatus = 'NEEDS_ADJUSTMENT';

  const overlay: IconTraceOverlayResult = {
    iconName: input.iconName,
    referenceCropPath: `visual-references/founder/ndxbook/icon-crops/${input.iconName}.png`,
    traceRasterPath: `visual-references/founder/ndxbook/icon-traces/${input.iconName}-trace.png`,
    overlayPath: `visual-references/founder/ndxbook/icon-traces/${input.iconName}-overlay.png`,
    differenceMaskPath: `visual-references/founder/ndxbook/icon-traces/${input.iconName}-diff.png`,
    pass: evaluation.status === 'VISUAL_MATCH' && !detectSemanticSubstitution(input.iconName, pathData),
  };

  return { mask, contour, spec, evaluation, overlay };
}

/** Simple SVG path rasterizer for mask IoU comparison. */
export function rasterizeSpecToMask(spec: PixelTracedIconSpec, width: number, height: number) {
  const data = new Uint8Array(width * height);
  const scale = (Math.min(width, height) - 4) / 24;

  for (const circle of spec.circleData ?? []) {
    const cx = circle.cx * scale + width / 2 - 12 * scale;
    const cy = circle.cy * scale + height / 2 - 12 * scale;
    const r = circle.r * scale;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (Math.hypot(x - cx, y - cy) <= r + 0.5) data[y * width + x] = 1;
      }
    }
  }

  for (const path of spec.pathData) {
    const nums = path.match(/-?\d+\.?\d*/g)?.map(Number) ?? [];
    for (let i = 0; i < nums.length - 3; i += 2) {
      const x0 = nums[i] * scale + width / 2 - 12 * scale;
      const y0 = nums[i + 1] * scale + height / 2 - 12 * scale;
      const x1 = nums[i + 2] * scale + width / 2 - 12 * scale;
      const y1 = nums[i + 3] * scale + height / 2 - 12 * scale;
      drawLine(data, width, height, x0, y0, x1, y1, 1.2);
    }
  }

  let count = 0;
  for (let i = 0; i < data.length; i++) if (data[i]) count++;

  return {
    iconName: spec.iconName,
    width,
    height,
    data,
    foregroundPixelCount: count,
  };
}

function drawLine(data: Uint8Array, w: number, h: number, x0: number, y0: number, x1: number, y1: number, thickness: number) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    for (let dy = -thickness; dy <= thickness; dy++) {
      for (let dx = -thickness; dx <= thickness; dx++) {
        const px = Math.round(x + dx);
        const py = Math.round(y + dy);
        if (px >= 0 && py >= 0 && px < w && py < h) data[py * w + px] = 1;
      }
    }
  }
}

export function computeLabelRelationship(iconTop: number, iconBottom: number, labelTop: number) {
  return {
    iconTop,
    iconBottom,
    labelTop,
    iconToLabelGap: labelTop - iconBottom,
  };
}

export { maskBoundingBox };
