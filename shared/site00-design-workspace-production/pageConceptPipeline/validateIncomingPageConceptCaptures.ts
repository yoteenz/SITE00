/**
 * P0.VR.PAGE-CONCEPT-API-CAPTURE-VALIDATION-FIX1 — server/API capture validation from request body only.
 */

import {
  classifyPageConceptCaptureTransport,
  type PageConceptIncomingCapturePayload,
} from './pageConceptGenerationRequest.js';

export type IncomingPageConceptCaptureValidation =
  | {
      ok: true;
      mobileTransport: 'base64' | 'url' | 'snapshot';
      desktopTransport: 'base64' | 'url' | 'snapshot';
    }
  | { ok: false; code: string; message: string };

function validateOne(
  label: 'MOBILE' | 'DESKTOP',
  payload: PageConceptIncomingCapturePayload | undefined,
): IncomingPageConceptCaptureValidation | null {
  if (!payload) {
    return {
      ok: false,
      code: label === 'MOBILE' ? 'BLOCKED_MOBILE_CAPTURE_PAYLOAD_MISSING' : 'BLOCKED_DESKTOP_CAPTURE_PAYLOAD_MISSING',
      message: `${label} capture payload missing from generation request`,
    };
  }
  if (!payload.captureId?.trim()) {
    return {
      ok: false,
      code: label === 'MOBILE' ? 'BLOCKED_MOBILE_CAPTURE_PAYLOAD_MISSING' : 'BLOCKED_DESKTOP_CAPTURE_PAYLOAD_MISSING',
      message: `${label} captureId missing`,
    };
  }
  if (payload.viewport && payload.viewport !== label) {
    return {
      ok: false,
      code: 'BLOCKED_CAPTURE_VIEWPORT_MISMATCH',
      message: `${label} capture viewport mismatch`,
    };
  }
  const transport = classifyPageConceptCaptureTransport(payload);
  if (transport === 'missing') {
    return {
      ok: false,
      code: label === 'MOBILE' ? 'BLOCKED_MOBILE_CAPTURE_PAYLOAD_MISSING' : 'BLOCKED_DESKTOP_CAPTURE_PAYLOAD_MISSING',
      message: `${label} capture requires artifactUrl or artifactBase64`,
    };
  }
  if (transport === 'unsupported_url') {
    return {
      ok: false,
      code:
        label === 'MOBILE' ?
          'BLOCKED_MOBILE_CAPTURE_ARTIFACT_UNREADABLE'
        : 'BLOCKED_DESKTOP_CAPTURE_ARTIFACT_UNREADABLE',
      message: `${label} artifactUrl is not server-accessible (browser-only URL)`,
    };
  }
  return null;
}

/** Validates captures present on the POST body only (no client capture registry). */
export function validateIncomingPageConceptCaptures(input: {
  projectId: string;
  pageId: string;
  mobileCapture?: PageConceptIncomingCapturePayload;
  desktopCapture?: PageConceptIncomingCapturePayload;
}): IncomingPageConceptCaptureValidation {
  if (!input.projectId?.trim() || !input.pageId?.trim()) {
    return { ok: false, code: 'BLOCKED_CAPTURE_PAGE_ID_MISMATCH', message: 'projectId and pageId required' };
  }

  const mobileFail = validateOne('MOBILE', input.mobileCapture);
  if (mobileFail) return mobileFail;
  const desktopFail = validateOne('DESKTOP', input.desktopCapture);
  if (desktopFail) return desktopFail;

  const mobileTransport = classifyPageConceptCaptureTransport(input.mobileCapture);
  const desktopTransport = classifyPageConceptCaptureTransport(input.desktopCapture);
  if (
    mobileTransport !== 'base64' &&
    mobileTransport !== 'url' &&
    mobileTransport !== 'snapshot'
  ) {
    return { ok: false, code: 'BLOCKED_MOBILE_CAPTURE_ARTIFACT_UNREADABLE', message: 'mobile transport invalid' };
  }
  if (
    desktopTransport !== 'base64' &&
    desktopTransport !== 'url' &&
    desktopTransport !== 'snapshot'
  ) {
    return { ok: false, code: 'BLOCKED_DESKTOP_CAPTURE_ARTIFACT_UNREADABLE', message: 'desktop transport invalid' };
  }

  return { ok: true, mobileTransport, desktopTransport };
}
