/**
 * Optional client hook — shared capture/authority modules call this after local persist.
 */

let hook: ((projectId: string) => void) | null = null;

export function registerFounderDesignWorkspaceCloudSyncHook(
  next: ((projectId: string) => void) | null,
): void {
  hook = next;
}

export function notifyFounderDesignWorkspaceCloudSync(projectId: string): void {
  if (!projectId) return;
  hook?.(projectId);
}
