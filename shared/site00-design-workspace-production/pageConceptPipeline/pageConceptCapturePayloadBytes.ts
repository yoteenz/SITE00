import type { PageConceptIncomingCapturePayload } from './pageConceptGenerationRequest.js';

export function estimatePageConceptCapturePayloadBytes(
  payload: PageConceptIncomingCapturePayload | undefined,
): number {
  if (!payload) return 0;
  let bytes = 200;
  if (payload.snapshotId) bytes += payload.snapshotId.length + 40;
  if (payload.captureId) bytes += payload.captureId.length;
  const b64 = payload.artifactBase64?.length ?? 0;
  const url = payload.artifactUrl?.length ?? 0;
  return bytes + b64 + url;
}

export function estimatePageConceptGenerationRequestBytes(input: {
  mobileCapture?: PageConceptIncomingCapturePayload;
  desktopCapture?: PageConceptIncomingCapturePayload;
  state?: unknown;
}): number {
  const stateJson = JSON.stringify(input.state ?? {});
  return (
    stateJson.length +
    estimatePageConceptCapturePayloadBytes(input.mobileCapture) +
    estimatePageConceptCapturePayloadBytes(input.desktopCapture)
  );
}
