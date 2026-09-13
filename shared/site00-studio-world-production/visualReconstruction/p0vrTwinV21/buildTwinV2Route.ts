export function buildTwinV2PreviewRoute(projectSlug: string, sessionId: string): string {
  return `/projects/${projectSlug}/debug/twin-v2/${sessionId}`;
}
