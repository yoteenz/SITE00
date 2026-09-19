/**
 * FrameAuthority — camera / environmental composition for non-conventional references.
 */

import type { PageVisualDecomposition } from './types.js';
import type { FrameAuthority } from './types.js';

export function extractFrameAuthority(decomposition: PageVisualDecomposition): FrameAuthority {
  const g = decomposition.global;
  const aspect = g.aspectRatio;
  const isEnvironmental = g.cameraFraming.includes('environment') || aspect > 2.2;
  return {
    cameraDistance: isEnvironmental ? 'environmental' : aspect > 1.5 ? 'wide' : 'medium',
    visualCenter: g.visualCenter,
    horizon: g.contentBounds.height * 0.45,
    perspective: isEnvironmental ? 'dramatic' : 'subtle',
    crop: g.contentBounds,
    negativeSpace: g.whitespaceRatio,
    environmentScale: isEnvironmental ? 1.4 : 1,
    panelScale: isEnvironmental ? 0.72 : 1,
  };
}

export function cameraDriftDetected(
  reference: FrameAuthority,
  candidate: FrameAuthority,
  tolerance = 0.08,
): boolean {
  return (
    Math.abs(reference.negativeSpace - candidate.negativeSpace) > tolerance ||
    Math.abs(reference.panelScale - candidate.panelScale) > tolerance ||
    reference.cameraDistance !== candidate.cameraDistance
  );
}
