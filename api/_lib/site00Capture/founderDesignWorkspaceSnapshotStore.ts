/**
 * Supabase storage persistence for founder design workspace snapshots.
 */

import {
  type FounderDesignWorkspaceSnapshot,
  founderDesignWorkspaceSnapshotStoragePath,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/founderDesignWorkspaceSnapshot.js';
import { downloadSite00StorageText, uploadSite00AssetBuffer } from '../site00Assts/storage.js';

export async function loadFounderDesignWorkspaceSnapshot(
  projectId: string,
): Promise<FounderDesignWorkspaceSnapshot | null> {
  const storagePath = founderDesignWorkspaceSnapshotStoragePath(projectId);
  const raw = await downloadSite00StorageText(storagePath);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as FounderDesignWorkspaceSnapshot;
    if (parsed.projectId !== projectId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function saveFounderDesignWorkspaceSnapshot(
  snapshot: FounderDesignWorkspaceSnapshot,
): Promise<{ storagePath: string; savedAt: string }> {
  const storagePath = founderDesignWorkspaceSnapshotStoragePath(snapshot.projectId);
  const body = JSON.stringify(snapshot);
  await uploadSite00AssetBuffer(storagePath, Buffer.from(body, 'utf8'), 'application/json', {
    upsert: true,
  });
  return { storagePath, savedAt: snapshot.savedAt };
}
