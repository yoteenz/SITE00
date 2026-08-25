/**
 * P0.VR.1D.7 — Scoped pixel comparison (reference crop vs scoped render crop).
 */

import sharp from 'sharp';
import {
  compareRenderedReference,
  evaluatePixelMatch,
} from '../index.js';
import type { NormalizedVisualReference, VisualReferenceRegion } from '../types.js';
import type { ScopeAwareVisualAuthority } from './types.js';
import { markComparisonScopeValidity } from './scopedReferenceDomRegionMap.js';
import { INVALID_SCOPE_COMPARISON_MARKER } from './constants.js';

export async function compareScopedPixelMatch(input: {
  referenceBuffer: Buffer;
  renderBuffer: Buffer;
  reference: NormalizedVisualReference;
  scopeAuthority: ScopeAwareVisualAuthority;
  comparedRoute: string;
  outputDir: string;
  regions: VisualReferenceRegion[];
}): Promise<{
  pixelMatch: ReturnType<typeof evaluatePixelMatch>;
  comparison: Awaited<ReturnType<typeof compareRenderedReference>>;
  scopeComparisonValid: boolean;
  scopeComparisonMarker: typeof INVALID_SCOPE_COMPARISON_MARKER | 'VALID_SCOPE_COMPARISON';
  resizedRenderBuffer: Buffer;
}> {
  const scopeMarker = markComparisonScopeValidity({
    scopeAuthority: input.scopeAuthority,
    comparedRoute: input.comparedRoute,
    comparisonMode: input.scopeAuthority.comparisonMode,
  });

  const refMeta = await sharp(input.referenceBuffer).metadata();
  const targetWidth = refMeta.width ?? input.scopeAuthority.referenceBounds.width;
  const targetHeight = refMeta.height ?? input.scopeAuthority.referenceBounds.height;

  const resizedRenderBuffer = await sharp(input.renderBuffer)
    .resize(targetWidth, targetHeight, { fit: 'fill' })
    .png()
    .toBuffer();

  const comparison = await compareRenderedReference({
    referenceBuffer: input.referenceBuffer,
    renderBuffer: resizedRenderBuffer,
    reference: input.reference,
    snapshot: {
      renderId: input.scopeAuthority.screenId,
      route: input.comparedRoute,
      viewport: {
        width: targetWidth,
        height: targetHeight,
        deviceScaleFactor: 1,
      },
      timestamp: new Date().toISOString(),
      commit: null,
      screenshotPath: '',
      reconstructionIteration: 1,
      blueprintVersion: 'P0.VR.1D.7',
    },
    regions: input.regions,
    outputDir: input.outputDir,
  });

  const pixelMatch = evaluatePixelMatch({
    referenceAssetId: input.scopeAuthority.screenId,
    renderAssetId: `${input.scopeAuthority.screenId}-scoped`,
    comparison,
  });

  return {
    pixelMatch,
    comparison,
    scopeComparisonValid: scopeMarker === 'VALID_SCOPE_COMPARISON',
    scopeComparisonMarker: scopeMarker,
    resizedRenderBuffer,
  };
}

export function referenceCropComparedToFullRouteWhenScopePanel(
  scopeAuthority: ScopeAwareVisualAuthority,
  renderCaptureMode: 'FULL_VIEWPORT' | 'SCOPED_ELEMENT',
): boolean {
  const isPanel =
    scopeAuthority.scope === 'WORKSPACE_PANEL_REFERENCE' ||
    scopeAuthority.scope === 'MODULE_REFERENCE';
  return isPanel && renderCaptureMode === 'FULL_VIEWPORT';
}
