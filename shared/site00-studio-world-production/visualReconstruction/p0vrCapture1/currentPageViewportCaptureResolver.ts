/**
 * P0.VR.CAPTURE.1R2 — Resolve latest valid capture for page + viewport.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import { migrateHistoricalRootCapturePageId } from '../../pageFamilyWorkspace/pageFamilyRootTarget.js';
import {
  getPageViewportCapture,
  listPageViewportCaptureHistory,
  type PageViewportCaptureRecord,
} from './pageViewportCapture.js';
import type { PageViewportCapture } from './types.js';

export function resolveCanonicalPageIdForCapture(projectId: string, pageId: string): string {
  return migrateHistoricalRootCapturePageId(projectId, pageId);
}

export function resolveCurrentPageViewportCapture(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageViewportCapture | null {
  const canonicalPageId = resolveCanonicalPageIdForCapture(projectId, pageId);
  const direct = getPageViewportCapture(projectId, canonicalPageId, viewport);
  if (direct?.imageRef && direct.status === 'CAPTURE_READY') return direct;

  const legacy = getPageViewportCapture(projectId, pageId, viewport);
  if (legacy?.imageRef && legacy.status === 'CAPTURE_READY') return legacy;

  const history = listPageViewportCaptureHistory(projectId, canonicalPageId, viewport);
  return history.find((c) => c.imageRef && c.status === 'CAPTURE_READY') ?? direct ?? legacy;
}

export function listCurrentCaptureCandidates(
  projectId: string,
  pageId: string,
  viewport: DesignViewportClass,
): PageViewportCaptureRecord[] {
  const canonicalPageId = resolveCanonicalPageIdForCapture(projectId, pageId);
  return listPageViewportCaptureHistory(projectId, canonicalPageId, viewport);
}
