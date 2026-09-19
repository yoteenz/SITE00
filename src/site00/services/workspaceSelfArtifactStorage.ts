const ARTIFACT_KEY_PREFIX = 'site00:workspace-self-artifact:v1:';

export function persistCaptureArtifact(captureId: string, artifactBase64: string): string {
  if (typeof localStorage === 'undefined') return '';
  localStorage.setItem(`${ARTIFACT_KEY_PREFIX}${captureId}`, artifactBase64);
  return `local://${ARTIFACT_KEY_PREFIX}${captureId}`;
}

export function resolveCaptureArtifactDisplayUrl(artifactPath: string | null): string | null {
  if (!artifactPath) return null;
  if (artifactPath.startsWith('data:') || artifactPath.startsWith('http') || artifactPath.startsWith('/')) {
    return artifactPath;
  }
  if (!artifactPath.startsWith('local://') || typeof localStorage === 'undefined') return null;
  const key = artifactPath.slice('local://'.length);
  const b64 = localStorage.getItem(key);
  if (!b64) return null;
  return `data:image/png;base64,${b64}`;
}
