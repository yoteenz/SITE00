/**
 * P0.VR.OPUS-NATIVE1 — Phase 17 + 19: the founder approval boundary.
 *
 * Approval is the only path by which agent work becomes permanent, and it is
 * driven exclusively by an explicit founder action. Note what approval does
 * NOT do: it does not commit, push, or touch git. It marks the patch approved
 * and closes the lineage record, leaving the change in the working tree for a
 * human to commit. Keeping the agent out of git is deliberate — it is the last
 * structural guarantee that an approved-looking run cannot reach main on its
 * own.
 */

import type { DesignAgentLineageRecord } from '../../../shared/site00-opus-native/types.js';
import { persistLineage, type RunContextHandle } from './runContext.js';
import { revertPatch, verifyPatchIntact } from './workspaceSandbox.js';

export class ReviewStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewStateError';
  }
}

function requireReviewable(run: RunContextHandle): void {
  if (run.status !== 'WAITING_FOR_FOUNDER_REVIEW') {
    throw new ReviewStateError(
      `run ${run.runId} is ${run.status}; only a run WAITING_FOR_FOUNDER_REVIEW can be decided`,
    );
  }
}

export async function approveRun(
  run: RunContextHandle,
  resultingDesignVersion: string | null,
): Promise<DesignAgentLineageRecord> {
  requireReviewable(run);
  const patch = run.patch();
  if (patch && !(await verifyPatchIntact(patch))) {
    throw new ReviewStateError(
      `the working tree no longer matches patch ${patch.patchId}; re-run rather than approving a stale patch`,
    );
  }

  const lineage = run.lineage();
  if (!lineage) throw new ReviewStateError('run has no lineage record');

  const decided: DesignAgentLineageRecord = {
    ...lineage,
    founderDecision: 'APPROVED',
    decidedAt: new Date().toISOString(),
    resultingDesignVersion: resultingDesignVersion ?? run.context.currentDesignAuthority,
  };
  run.setLineage(decided);
  await persistLineage(decided);
  run.note('system', 'Founder approved. Patch left in the working tree for a human commit.');
  run.touch('APPROVED');
  return decided;
}

export async function requestChanges(run: RunContextHandle, note: string): Promise<void> {
  requireReviewable(run);
  const lineage = run.lineage();
  if (lineage) {
    const decided: DesignAgentLineageRecord = {
      ...lineage,
      founderDecision: 'CHANGES_REQUESTED',
      decidedAt: new Date().toISOString(),
    };
    run.setLineage(decided);
    await persistLineage(decided);
  }
  run.note('system', `Founder requested changes: ${note}`);
  run.touch('WAITING_FOR_FOUNDER_REVIEW');
}

/**
 * Revert is available from any terminal state, including ERROR and CANCELLED.
 * A run that failed halfway through a patch is exactly when revert matters
 * most, so it is deliberately not gated behind the review state.
 */
export async function revertRun(run: RunContextHandle): Promise<{ reverted: string[] }> {
  const patch = run.patch();
  if (!patch) {
    run.touch('REVERTED');
    return { reverted: [] };
  }
  const result = await revertPatch(patch);
  const lineage = run.lineage();
  if (lineage) {
    const decided: DesignAgentLineageRecord = {
      ...lineage,
      founderDecision: 'REVERTED',
      decidedAt: new Date().toISOString(),
    };
    run.setLineage(decided);
    await persistLineage(decided);
  }
  run.note('system', `Founder reverted. Restored: ${result.reverted.join(', ') || 'nothing'}.`);
  run.touch('REVERTED');
  return result;
}
