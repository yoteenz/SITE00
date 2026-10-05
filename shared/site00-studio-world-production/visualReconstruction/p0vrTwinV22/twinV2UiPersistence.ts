/** Survives full page reload on mobile tunnel preview (sessionStorage). */

export type TwinV2UiPersist = {
  projectId: string;
  pageId: string;
  /** Page upgrade drawer was open (mobile tunnel reload recovery). */
  upgradeOpen: boolean;
  twinV2Open: boolean;
  importUrlsDraft: string;
  updatedAt: string;
};

const STORAGE_PREFIX = 'site00:twin-v2-ui:v1:';

function storageKey(projectId: string): string {
  return `${STORAGE_PREFIX}${projectId.toLowerCase()}`;
}

export function readTwinV2UiPersist(projectId: string): TwinV2UiPersist | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey(projectId));
    if (!raw) return null;
    return JSON.parse(raw) as TwinV2UiPersist;
  } catch {
    return null;
  }
}

export function writeTwinV2UiPersist(patch: Partial<TwinV2UiPersist> & { projectId: string; pageId: string }): void {
  if (typeof sessionStorage === 'undefined') return;
  const prev = readTwinV2UiPersist(patch.projectId);
  const next: TwinV2UiPersist = {
    projectId: patch.projectId,
    pageId: patch.pageId,
    upgradeOpen: patch.upgradeOpen ?? prev?.upgradeOpen ?? false,
    twinV2Open: patch.twinV2Open ?? prev?.twinV2Open ?? false,
    importUrlsDraft: patch.importUrlsDraft ?? prev?.importUrlsDraft ?? '',
    updatedAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(storageKey(patch.projectId), JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function clearTwinV2UiPersist(projectId: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(storageKey(projectId));
  } catch {
    /* ignore */
  }
}
