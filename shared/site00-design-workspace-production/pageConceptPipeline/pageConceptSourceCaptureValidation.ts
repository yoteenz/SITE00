/**
 * P0.VR.PAGE-CONCEPT-CAPTURE-READINESS-UNIFICATION1 — single source validator for captures.
 */

import type { PageCaptureRecord } from '../designPageCapture.js';
import { isPageCaptureDisplayableArtifact, resolveCurrentPageCapture } from '../designPageCapture.js';
import type { PageConceptReadiness } from './types.js';

export type PageConceptViewportCaptureValidation = {
  exists: boolean;
  ready: boolean;
  displayable: boolean;
  captureId: string | null;
  artifactRef: string | null;
  record: PageCaptureRecord | null;
};

export type PageConceptSourceCaptureValidation = {
  mobile: PageConceptViewportCaptureValidation;
  desktop: PageConceptViewportCaptureValidation;
  allRequiredReady: boolean;
  missingViewports: readonly ('MOBILE' | 'DESKTOP')[];
  sourceCaptureBlockerCode: PageConceptReadiness | null;
};

export function isDisplayablePageConceptCapture(record: PageCaptureRecord | null | undefined): boolean {
  return Boolean(record?.artifactPath && isPageCaptureDisplayableArtifact(record.artifactPath));
}

function validateViewport(
  projectId: string,
  pageId: string,
  viewport: 'MOBILE' | 'DESKTOP',
): PageConceptViewportCaptureValidation {
  const { record } = resolveCurrentPageCapture(projectId, pageId, viewport);
  const displayable = isDisplayablePageConceptCapture(record);
  return {
    exists: Boolean(record),
    ready: displayable,
    displayable,
    captureId: record?.captureId ?? null,
    artifactRef: record?.artifactPath ?? null,
    record,
  };
}

export function validatePageConceptSourceCaptures(
  projectId: string,
  pageId: string,
): PageConceptSourceCaptureValidation {
  const mobile = validateViewport(projectId, pageId, 'MOBILE');
  const desktop = validateViewport(projectId, pageId, 'DESKTOP');
  const missingViewports: ('MOBILE' | 'DESKTOP')[] = [];
  if (!mobile.ready) missingViewports.push('MOBILE');
  if (!desktop.ready) missingViewports.push('DESKTOP');

  let sourceCaptureBlockerCode: PageConceptReadiness | null = null;
  if (missingViewports.length === 2) sourceCaptureBlockerCode = 'BLOCKED_NO_SOURCE_CAPTURE';
  else if (missingViewports.includes('MOBILE')) sourceCaptureBlockerCode = 'BLOCKED_NO_MOBILE_CAPTURE';
  else if (missingViewports.includes('DESKTOP')) sourceCaptureBlockerCode = 'BLOCKED_NO_DESKTOP_CAPTURE';

  return {
    mobile,
    desktop,
    allRequiredReady: missingViewports.length === 0,
    missingViewports,
    sourceCaptureBlockerCode,
  };
}
