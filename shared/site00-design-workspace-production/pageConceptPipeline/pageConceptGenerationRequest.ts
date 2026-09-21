/**
 * P0.VR.PAGE-CONCEPT-API-CAPTURE-VALIDATION-FIX1 — shared client/server generation request contract.
 */

import type { PageConceptGenerationState } from './types.js';

export type PageConceptIncomingCapturePayload = {
  captureId: string;
  snapshotId?: string;
  viewport?: 'MOBILE' | 'DESKTOP';
  artifactBase64?: string;
  artifactUrl?: string;
  width: number;
  height: number;
};

export type PageConceptGenerationRequest = {
  action: 'plan' | 'generate' | 'trace' | 'start';
  founderConfirmedSpend?: boolean;
  retryFailedOnly?: boolean;
  retryCgptOnly?: boolean;
  resumeRunId?: string;
  continueNbpAfterGpt2Review?: boolean;
  continueGpt2AfterCgptReview?: boolean;
  traceOnly?: boolean;
  dryRun?: boolean;
  state: PageConceptGenerationState;
  mobileCapture?: PageConceptIncomingCapturePayload;
  desktopCapture?: PageConceptIncomingCapturePayload;
};

export type PageConceptCaptureTransportKind =
  | 'base64'
  | 'url'
  | 'snapshot'
  | 'missing'
  | 'unsupported_url';

export function classifyPageConceptCaptureTransport(
  payload: PageConceptIncomingCapturePayload | undefined,
): PageConceptCaptureTransportKind {
  if (!payload?.captureId?.trim()) return 'missing';
  if (payload.snapshotId?.trim()) return 'snapshot';
  const b64 = payload.artifactBase64?.trim();
  if (b64) return 'base64';
  const url = payload.artifactUrl?.trim();
  if (!url) return 'missing';
  const lower = url.toLowerCase();
  if (
    lower.startsWith('blob:') ||
    lower.startsWith('local://') ||
    lower.includes('localhost') ||
    lower.startsWith('127.0.0.1')
  ) {
    return 'unsupported_url';
  }
  return 'url';
}
