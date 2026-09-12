/**
 * Push/pull founder design workspace snapshot (authority + capture bindings) via page-mirror API.
 */

import {
  applyFounderDesignWorkspaceSnapshot,
  buildFounderDesignWorkspaceSnapshot,
  writeLocalFounderDesignSnapshotSavedAt,
  type FounderDesignWorkspaceSnapshot,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/founderDesignWorkspaceSnapshot.js';
import { registerFounderDesignWorkspaceCloudSyncHook } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/founderDesignWorkspaceCloudSyncHook.js';
import { captureApiFetch, PAGE_MIRROR_PATH } from './captureApiFetch';

const pushTimers = new Map<string, ReturnType<typeof setTimeout>>();
const PUSH_DEBOUNCE_MS = 1200;

let hookRegistered = false;

export function ensureFounderDesignWorkspaceCloudSyncRegistered(): void {
  if (hookRegistered) return;
  hookRegistered = true;
  registerFounderDesignWorkspaceCloudSyncHook((projectId) => {
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

export async function pushFounderDesignWorkspaceSnapshot(projectId: string): Promise<boolean> {
  const snapshot = buildFounderDesignWorkspaceSnapshot(projectId);
  const result = await captureApiFetch<{ savedAt?: string; storagePath?: string }>(PAGE_MIRROR_PATH, {
    method: 'POST',
    body: {
      action: 'put_founder_design_snapshot',
      projectId,
      snapshot,
    },
    timeoutMs: 45_000,
  });
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
