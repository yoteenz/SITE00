/**
 * P0.VR.3L — On-demand sibling capture (P0.VR.3E integration).
 */

import { captureImplementationSnapshot } from '../p0vr3e/implementationSnapshotCaptureEngine.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import {
  COMPOSER_DERIVED_DRAFT_LABEL,
  FAMILY_SOURCE_SNAPSHOT_LABEL,
} from './constants.js';
import type { ImplementationSnapshotRecord } from '../p0vr3e/types.js';
import { evaluateSiblingCaptureNeed, type SiblingCandidate } from './siblingSelection.js';
import type { RepoOwnedProjectId } from './types.js';

export async function captureSiblingIfNeeded(input: {
  projectId: RepoOwnedProjectId;
  sibling: SiblingCandidate;
  viewports?: DesignViewportClass[];
  baseUrl?: string;
}): Promise<{ captured: boolean; snapshots: ImplementationSnapshotRecord[]; reused: boolean }> {
  const decision = evaluateSiblingCaptureNeed(input.projectId, input.sibling);
  if (!decision.captureRequired) {
    return { captured: false, snapshots: [], reused: true };
  }

  const viewports = input.viewports ?? ['mobile', 'tablet', 'desktop'];
  const snapshots: ImplementationSnapshotRecord[] = [];

  for (const viewportClass of viewports) {
    const snap = await captureImplementationSnapshot({
      projectId: input.projectId.toLowerCase(),
      screenId: input.sibling.screenId,
      viewportClass,
      route: input.sibling.route,
      baseUrl: input.baseUrl,
      snapshotLabel: FAMILY_SOURCE_SNAPSHOT_LABEL,
    });
    if (snap) snapshots.push(snap);
  }

  return { captured: true, snapshots, reused: false };
}

export async function captureDerivedTargetDraft(input: {
  projectId: RepoOwnedProjectId;
  screenId: string;
  route: string;
  viewports?: DesignViewportClass[];
  baseUrl?: string;
}): Promise<ImplementationSnapshotRecord[]> {
  const viewports = input.viewports ?? ['mobile', 'tablet', 'desktop'];
  const results: ImplementationSnapshotRecord[] = [];

  for (const viewportClass of viewports) {
    const snap = await captureImplementationSnapshot({
      projectId: input.projectId.toLowerCase(),
      screenId: input.screenId,
      viewportClass,
      route: input.route,
      baseUrl: input.baseUrl,
      snapshotLabel: COMPOSER_DERIVED_DRAFT_LABEL,
    });
    if (snap) results.push(snap);
  }

  return results;
}
