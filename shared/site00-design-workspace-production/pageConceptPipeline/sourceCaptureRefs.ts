/**
 * P0.VR.PAGE-CONCEPT-SOURCE-CAPTURE-RESOLUTION-FIX1 — package fields for API validation.
 */

import type { PageCaptureRecord } from '../designPageCapture.js';
import { getPageConceptSourceCaptures } from '../designPageCapture.js';
import type { PageConceptSourceCaptureRef } from './types.js';

export function pageCaptureRecordToSourceRef(
  record: PageCaptureRecord,
  viewport: 'MOBILE' | 'DESKTOP',
): PageConceptSourceCaptureRef {
  return {
    captureId: record.captureId,
    viewport,
    artifactPath: record.artifactPath,
    route: record.route,
    buildVersion: record.buildVersion,
    timestamp: record.timestamp,
    screenId: record.screenId,
  };
}

export function resolvePageConceptSourceCaptureRefs(
  projectId: string,
  pageId: string,
): { mobile: PageConceptSourceCaptureRef | null; desktop: PageConceptSourceCaptureRef | null } {
  const { mobile, desktop } = getPageConceptSourceCaptures(projectId, pageId);
  return {
    mobile: mobile ? pageCaptureRecordToSourceRef(mobile, 'MOBILE') : null,
    desktop: desktop ? pageCaptureRecordToSourceRef(desktop, 'DESKTOP') : null,
  };
}
