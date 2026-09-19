/**
 * Push/pull founder design workspace snapshot (authority + capture bindings) via page-mirror API.
 */

import {
  applyFounderDesignWorkspaceSnapshot,
  buildFounderDesignWorkspaceSnapshot,
  hydrateLocalFounderDesignWorkspaceSnapshot,
  persistLocalFounderDesignWorkspaceSnapshot,
  writeLocalFounderDesignSnapshotSavedAt,
  type FounderDesignWorkspaceSnapshot,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/founderDesignWorkspaceSnapshot.js';
import { registerFounderDesignWorkspaceCloudSyncHook } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/founderDesignWorkspaceCloudSyncHook.js';
import {
  hydrateDesignAuthorityVersionsFromStorage,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/designAuthorityVersion.js';
import {
  hydratePageViewportCapturesFromStorage,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageViewportCapture.js';
import { captureApiFetch, PAGE_MIRROR_PATH } from './captureApiFetch';

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const PUSH_DEBOUNCE_MS = 1200;

let hookRegistered = false;
let beforeUnloadRegistered = false;

function registerBeforeUnloadFlush(): void {
  if (beforeUnloadRegistered || typeof window === 'undefined') return;
  beforeUnloadRegistered = true;
  window.addEventListener('pagehide', () => {
    for (const projectId of pushTimers.keys()) {
      const timer = pushTimers.get(projectId);
      if (timer) clearTimeout(timer);
      pushTimers.delete(projectId);
      void pushFounderDesignWorkspaceSnapshot(projectId, { immediate: true });
    }
  });
}

export function ensureFounderDesignWorkspaceCloudSyncRegistered(): void {
  if (hookRegistered) return;
  hookRegistered = true;
  registerBeforeUnloadFlush();
  registerFounderDesignWorkspaceCloudSyncHook((projectId) => {
    persistLocalFounderDesignWorkspaceSnapshot(projectId);
    schedulePushFounderDesignWorkspaceSnapshot(projectId);
  });
}

export function schedulePushFounderDesignWorkspaceSnapshot(projectId: string): void {
  if (!projectId) return;
  const prev = pushTimers.get(projectId);
  if (prev) clearTimeout(prev);
  pushTimers.set(
    projectId,
    setTimeout(() => {
      pushTimers.delete(projectId);
      void pushFounderDesignWorkspaceSnapshot(projectId);
    }, PUSH_DEBOUNCE_MS),
  );
}

export async function pushFounderDesignWorkspaceSnapshot(
  projectId: string,
  options?: { immediate?: boolean },
): Promise<boolean> {
  if (!projectId) return false;
  persistLocalFounderDesignWorkspaceSnapshot(projectId);
  const snapshot = buildFounderDesignWorkspaceSnapshot(projectId);
  if (!snapshot.authorityVersions.length && !snapshot.captures.length) {
    return false;
  }
  const result = await captureApiFetch<{ savedAt?: string; storagePath?: string; error?: string }>(
    PAGE_MIRROR_PATH,
    {
      method: 'POST',
      body: {
        action: 'put_founder_design_snapshot',
        projectId,
        snapshot,
      },
      timeoutMs: options?.immediate ? 20_000 : 45_000,
    },
  );
  if (result.ok && result.data?.savedAt) {
    writeLocalFounderDesignSnapshotSavedAt(projectId, result.data.savedAt);
    return true;
  }
  return false;
}

export async function pullFounderDesignWorkspaceSnapshot(projectId: string): Promise<{
  applied: boolean;
  reason?: string;
}> {
  const result = await captureApiFetch<{ snapshot?: FounderDesignWorkspaceSnapshot | null }>(PAGE_MIRROR_PATH, {
    method: 'POST',
    body: {
      action: 'get_founder_design_snapshot',
      projectId,
    },
    timeoutMs: 30_000,
  });
  if (!result.ok || !result.data?.snapshot) {
    return { applied: false, reason: 'NO_REMOTE_SNAPSHOT' };
  }
  return applyFounderDesignWorkspaceSnapshot(result.data.snapshot);
}

/** Load per-key localStorage, local snapshot blob, then cloud (in order). */
export async function bootstrapFounderDesignWorkspace(projectId: string): Promise<void> {
  if (!projectId) return;
  ensureFounderDesignWorkspaceCloudSyncRegistered();
  hydrateDesignAuthorityVersionsFromStorage();
  hydratePageViewportCapturesFromStorage(projectId);
  // Compact backup restores bindings when per-key LS keys are missing (mobile refresh / quota).
  hydrateLocalFounderDesignWorkspaceSnapshot(projectId);
  hydrateDesignAuthorityVersionsFromStorage();
  hydratePageViewportCapturesFromStorage(projectId);
  await pullFounderDesignWorkspaceSnapshot(projectId);
}
