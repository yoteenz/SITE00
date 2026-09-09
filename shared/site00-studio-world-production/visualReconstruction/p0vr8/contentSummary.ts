/**
 * P0.VR.8 — PageContentSummary — derived from live page structure.
 */

import type { PageContentSummary, PageDomManifest } from './types.js';

export function buildPageContentSummaryFromDom(dom: PageDomManifest): PageContentSummary {
  return {
    pageId: dom.pageId,
    projectId: dom.projectId,
    majorHeadings: dom.headings.slice(0, 5),
    primaryCtas: dom.buttons.slice(0, 3),
    majorRegions: dom.landmarks.slice(0, 5),
    keyModules: dom.componentMarkers.slice(0, 5),
    updatedAt: dom.capturedAt,
  };
}

export function formatPageDescription(summary: PageContentSummary, pageName = ''): string {
  const parts = pageName ? [pageName.toUpperCase()] : [];
  if (summary.majorHeadings.length) parts.push(summary.majorHeadings.join(' · '));
  if (summary.primaryCtas.length) parts.push(`CTA: ${summary.primaryCtas.join(', ')}`);
  return parts.join('. ');
}
