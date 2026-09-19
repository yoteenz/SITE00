/**
 * P0.VR.3J.1 — Founder composer draft review session (post-hydration).
 */

import type { SnapshotRegistryHealth, ComposerDraftReviewCoverage } from './snapshotRegistryHealth.js';
import {
  buildComposerDraftReviewCoverage,
  buildSnapshotRegistryHealth,
} from './snapshotRegistryHealth.js';
import {
  buildEnrichedComposerReviewQueue,
  buildEnrichedComposerReviewSets,
  buildReviewQueueSummary,
} from './reviewReadiness.js';
import { buildComplexShellReviewBriefs } from './complexShellBriefs.js';
import { hydratePersistentImplementationSnapshots } from '../p0vr3e/hydratePersistentImplementationSnapshots.js';
import type { EnrichedComposerReviewQueueEntry, EnrichedComposerReviewSet, ComplexShellReviewBrief } from './types.js';

export type ComposerDraftReviewSession = {
  queue: EnrichedComposerReviewQueueEntry[];
  sets: EnrichedComposerReviewSet[];
  summary: ReturnType<typeof buildReviewQueueSummary>;
  complexBriefs: ComplexShellReviewBrief[];
  health: SnapshotRegistryHealth;
  coverage: ComposerDraftReviewCoverage;
  hydrated: boolean;
};

export async function buildComposerDraftReviewSession(input?: {
  repoRoot?: string;
  verifyStorage?: boolean;
}): Promise<ComposerDraftReviewSession> {
  const repoRoot = input?.repoRoot ?? process.cwd();
  await hydratePersistentImplementationSnapshots({
    repoRoot,
    verifyStorage: input?.verifyStorage,
  });

  return {
    queue: buildEnrichedComposerReviewQueue(),
    sets: buildEnrichedComposerReviewSets(),
    summary: buildReviewQueueSummary(),
    complexBriefs: buildComplexShellReviewBriefs(),
    health: buildSnapshotRegistryHealth(repoRoot),
    coverage: buildComposerDraftReviewCoverage(),
    hydrated: true,
  };
}
