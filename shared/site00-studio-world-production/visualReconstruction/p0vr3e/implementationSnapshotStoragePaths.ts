/**
 * P0.VR.3E — Human-browsable implementation snapshot storage paths.
 */

import { IMPLEMENTATION_SNAPSHOT_STORAGE_ROOT } from './constants.js';
import type { DesignViewportClass } from '../p0vr2/types.js';

export function buildImplementationSnapshotStoragePath(input: {
  projectId: string;
  designScreenId: string;
  viewportClass: DesignViewportClass;
  sourceCommit?: string | null;
  capturedAt?: string;
  visualStateId?: string | null;
  extension?: 'webp' | 'png';
}): string {
  const date = (input.capturedAt ?? new Date().toISOString()).slice(0, 10);
  const commitSuffix = input.sourceCommit ? `-commit-${input.sourceCommit.slice(0, 8)}` : '';
  const stateSuffix = input.visualStateId ? `-${input.visualStateId}` : '';
  const ext = input.extension ?? 'webp';
  return `${IMPLEMENTATION_SNAPSHOT_STORAGE_ROOT}/${input.projectId}/${input.designScreenId}/${input.viewportClass}/${date}${commitSuffix}${stateSuffix}.${ext}`;
}

export function buildImplementationSnapshotPublicUrl(storagePath: string): string {
  if (storagePath.startsWith('http')) return storagePath;
  return `/${storagePath.replace(/^\//, '')}`;
}
