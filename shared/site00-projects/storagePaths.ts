/**
 * Project-scoped storage path conventions — P0.B
 */

export function projectStoragePrefix(projectId: string): string {
  const safe = projectId.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `projects/${safe}`;
}

export function projectAssetStoragePath(projectId: string, ...segments: string[]): string {
  const safeSegments = segments.map((s) => s.replace(/[^a-zA-Z0-9-_.]/g, '_'));
  return `${projectStoragePrefix(projectId)}/${safeSegments.join('/')}`;
}
