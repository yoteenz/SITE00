import type { IconTraceOverlayResult, PixelTracedIconSpec } from './types.js';
import type { IconPixelMask } from './types.js';
import { computeMaskIou } from './evaluation.js';

export function buildTraceOverlayResult(
  iconName: PixelTracedIconSpec['iconName'],
  referenceMask: IconPixelMask,
  renderedMask: IconPixelMask,
): IconTraceOverlayResult {
  const iou = computeMaskIou(referenceMask, renderedMask);
  return {
    iconName,
    referenceCropPath: `visual-references/founder/ndxbook/icon-crops/${iconName}.png`,
    traceRasterPath: `visual-references/founder/ndxbook/icon-traces/${iconName}-trace.png`,
    overlayPath: `visual-references/founder/ndxbook/icon-traces/${iconName}-overlay.png`,
    differenceMaskPath: `visual-references/founder/ndxbook/icon-traces/${iconName}-diff.png`,
    pass: iou >= 0.35,
  };
}

export function generateDifferenceMask(
  referenceMask: IconPixelMask,
  renderedMask: IconPixelMask,
): Uint8Array {
  const diff = new Uint8Array(referenceMask.data.length);
  for (let i = 0; i < diff.length; i++) {
    diff[i] = referenceMask.data[i] !== renderedMask.data[i] ? 1 : 0;
  }
  return diff;
}

export function runReferenceTraceOverlay(
  spec: PixelTracedIconSpec,
  referenceMask: IconPixelMask,
  renderedMask: IconPixelMask,
): {
  reference: string;
  trace: string;
  overlay: string;
  differenceMask: string;
  pass: boolean;
} {
  const result = buildTraceOverlayResult(spec.iconName, referenceMask, renderedMask);
  return {
    reference: result.referenceCropPath,
    trace: result.traceRasterPath,
    overlay: result.overlayPath,
    differenceMask: result.differenceMaskPath,
    pass: result.pass,
  };
}
