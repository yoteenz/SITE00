/**
 * P0.VR.1D.7 — Scope-aware render capture (panel crop vs full viewport).
 */

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { renderControlledReference } from '../render/ControlledReferenceRenderer.js';
import { scopedDomRegionSelector } from './scopedDomMeasurement.js';
import type { ScopedRenderCaptureInput, ScopedRenderCaptureResult } from './types.js';

export async function captureScopedRenderSnapshot(
  input: ScopedRenderCaptureInput,
): Promise<ScopedRenderCaptureResult & { domMeasurement: Awaited<ReturnType<typeof renderControlledReference>>['domMeasurement'] }> {
  mkdirSync(input.outputDir, { recursive: true });
  const authority = input.scopeAuthority;
  const isScoped = authority.comparisonMode === 'SCOPED_REGION' || authority.comparisonMode === 'COMPONENT';

  const viewport = isScoped
    ? {
        width: Math.max(320, Math.min(authority.referenceBounds.width, 1440)),
        height: Math.max(240, Math.min(authority.referenceBounds.height, 1200)),
        deviceScaleFactor: input.previewDeviceMode === 'mobile' ? 2 : 1,
      }
    : {
        width: input.previewDeviceMode === 'mobile' ? 390 : 1440,
        height: input.previewDeviceMode === 'mobile' ? 844 : 900,
        deviceScaleFactor: input.previewDeviceMode === 'mobile' ? 2 : 1,
      };

  const snapshot = await renderControlledReference({
    route: authority.route,
    baseUrl: input.baseUrl,
    viewport,
    outputDir: input.outputDir,
    reconstructionIteration: input.reconstructionIteration,
    blueprintVersion: 'P0.VR.1D.7',
    selector: authority.rootSelector,
    previewDeviceMode: input.previewDeviceMode,
    routeSearch: input.routeSearch,
    captureDomMeasurements: true,
    domRegionSelector: scopedDomRegionSelector(authority),
    waitForSelector: authority.rootSelector,
  });

  let scopeRootRect: ScopedRenderCaptureResult['scopeRootRect'] = null;
  if (isScoped) {
    scopeRootRect = { x: 0, y: 0, width: authority.referenceBounds.width, height: authority.referenceBounds.height };
  }

  return {
    snapshotPath: snapshot.screenshotPath,
    renderId: snapshot.renderId,
    scopeRootRect,
    captureMode: isScoped ? 'SCOPED_ELEMENT' : 'FULL_VIEWPORT',
    finalUrl: snapshot.finalUrl,
    domMeasurement: snapshot.domMeasurement,
  };
}

export function resolveScopedRenderSearch(
  scopeAuthority: { route: string; comparisonMode: string },
  previewDeviceMode: 'mobile' | 'desktop',
): string {
  if (previewDeviceMode === 'mobile') return '?site00MobileLayout=1';
  if (scopeAuthority.comparisonMode === 'SCOPED_REGION' && scopeAuthority.route.endsWith('/ndxbook')) {
    return '?site00PreviewDesktop=1';
  }
  return '';
}

export function resolveScopedRenderOutputDir(baseDir: string, screenId: string): string {
  return join(baseDir, 'scoped-renders', screenId);
}
