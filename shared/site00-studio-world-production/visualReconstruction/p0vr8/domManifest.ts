/**
 * P0.VR.8 — PageDomManifest — structure capture for intelligent reconstruction.
 */

import type { PageDomManifest } from './types.js';

export function buildEmptyDomManifest(projectId: string, pageId: string): PageDomManifest {
  return {
    pageId,
    projectId,
    headings: [],
    landmarks: [],
    forms: [],
    buttons: [],
    navigation: [],
    imageSlots: [],
    componentMarkers: [],
    capturedAt: new Date().toISOString(),
  };
}

export function mergeDomManifestFromCapture(
  base: PageDomManifest,
  captured: Partial<PageDomManifest>,
): PageDomManifest {
  return {
    ...base,
    ...captured,
    capturedAt: new Date().toISOString(),
  };
}
