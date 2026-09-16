/**
 * P0.VR.OPUS-NATIVE2 — Phase 23, 24, 25: the design session.
 *
 * NATIVE1's `request_changes` terminated a run. The founder's follow-up
 * therefore started from zero: recompile the protocol, the project canon and
 * the page context, re-read the same files, re-screenshot the same route, and
 * pay full input rate for all of it — to act on one sentence of feedback. That
 * is the single largest reason a Cursor chat still felt better, and it is a
 * context-management problem rather than a model problem.
 *
 * A session is the thread. Runs hang off it, feedback accumulates on it, and a
 * continuation inherits the compiled context of its parent instead of
 * rebuilding it.
 *
 * Phase 25 is the other half. A thread that simply appends every turn grows
 * without bound and eventually costs more than it saves, so each completed run
 * is compacted into a structured summary — what is settled, what was tried and
 * failed, what the current state is, what is being asked now. Failed
 * approaches are kept deliberately: they are the most expensive thing the
 * thread learned and the easiest for a fresh context to repeat.
 */

import type { OpusNativeMode } from './types.js';
import type { DesignAgentIntent, DesignWriteMode } from './writePolicy.js';

export interface DesignSessionRunSummary {
  runId: string;
  intent: DesignAgentIntent;
  mode: OpusNativeMode;
  task: string;
  outcome: 'APPROVED' | 'CHANGES_REQUESTED' | 'REVERTED' | 'ERROR' | 'PENDING';
  filesChanged: string[];
  diffPercent: number | null;
  costUsd: number;
  at: string;
}

/**
 * Phase 25 — the compaction record. Every field is a claim the next run can
 * rely on without re-deriving it, which is what makes dropping the raw turns
 * safe.
 */
export interface DesignSessionCompaction {
  currentTask: string;
  /** Settled by observation or founder statement. Not re-litigated. */
  approvedFacts: string[];
  /** Tried and rejected, with the reason. Prevents an expensive second attempt. */
  failedApproaches: Array<{ approach: string; reason: string }>;
  currentDesignState: string;
  openRequest: string | null;
  latestScreenshotId: string | null;
  currentPatchState: 'NONE' | 'APPLIED_PENDING_REVIEW' | 'APPROVED' | 'REVERTED';
  compactedAt: string;
}

export interface DesignAgentSession {
  sessionId: string;
  projectId: string;
  pageId: string;
  route: string;
  /** The founder's standing objective for the thread, not the latest message. */
  threadTask: string;
  intent: DesignAgentIntent;
  writeMode: DesignWriteMode;
  runs: DesignSessionRunSummary[];
  founderFeedback: Array<{ at: string; note: string; afterRunId: string }>;
  compaction: DesignSessionCompaction | null;
  createdAt: string;
  updatedAt: string;
  status: 'OPEN' | 'CLOSED';
}

/**
 * Renders the compaction as the context block a continuation receives in place
 * of the parent's full transcript. Kept here rather than on the server so the
 * panel can show the founder exactly what the next run will be told — the
 * "what does Opus remember" question has an inspectable answer.
 */
export function renderCompaction(compaction: DesignSessionCompaction): string {
  const lines: string[] = ['# SESSION STATE (compacted from earlier runs in this thread)', ''];
  lines.push(`## Current task\n${compaction.currentTask}`, '');

  lines.push('## Established facts');
  lines.push(
    compaction.approvedFacts.length > 0
      ? compaction.approvedFacts.map((fact) => `  - ${fact}`).join('\n')
      : '  - none recorded',
  );
  lines.push('');

  lines.push('## Approaches already tried and rejected');
  lines.push(
    compaction.failedApproaches.length > 0
      ? compaction.failedApproaches.map((item) => `  - ${item.approach} — rejected: ${item.reason}`).join('\n')
      : '  - none',
  );
  lines.push('', `## Current design state\n${compaction.currentDesignState}`, '');
  lines.push(`## Patch state\n${compaction.currentPatchState}`, '');

  if (compaction.latestScreenshotId) {
    lines.push(`## Latest render\n${compaction.latestScreenshotId}`, '');
  }
  if (compaction.openRequest) {
    lines.push(`## Founder's open request — this is what you are being asked to do now\n${compaction.openRequest}`, '');
  }

  lines.push(
    'Do not repeat a rejected approach. Do not re-derive an established fact. Act on the open request only.',
  );
  return lines.join('\n');
}
