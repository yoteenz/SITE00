/** Session ids embed page routes (slashes) — must encode for a single :sessionId param. */
export function encodeTwinV2PreviewSessionId(sessionId: string): string {
  return encodeURIComponent(sessionId);
}

export function decodeTwinV2PreviewSessionId(encodedSessionId: string): string {
  try {
    return decodeURIComponent(encodedSessionId);
  } catch {
    return encodedSessionId;
  }
}

export function buildTwinV2PreviewRoute(projectSlug: string, sessionId: string): string {
  return `/projects/${projectSlug}/debug/twin-v2/${encodeTwinV2PreviewSessionId(sessionId)}`;
}
