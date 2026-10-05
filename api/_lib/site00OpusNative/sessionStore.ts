/**
 * P0.VR.OPUS-NATIVE2 — Phase 23, 24, 25: session storage and compaction.
 *
 * Sessions live in memory with a JSON mirror on disk, the same shape NATIVE1
 * chose for receipts and lineage and for the same reason: the thread is worth
 * surviving a restart, the in-flight agent loop is not, because a restart has
 * already cancelled it.
 *
 * The compaction is written by the runtime rather than by the model. Asking
 * the model to summarise its own thread invites it to describe a failed
 * approach as a partial success, and the failed-approach list is the most
 * valuable thing in the record. Everything here is derived from what actually
 * happened: the patch that exists, the diff that was measured, the tests that
 * ran, the note the founder typed.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type {
  DesignAgentSession,
  DesignSessionCompaction,
  DesignSessionRunSummary,
} from '../../../shared/site00-opus-native/session.js';
import type { DesignAgentIntent, DesignWriteMode } from '../../../shared/site00-opus-native/writePolicy.js';
import { opusNativeWorkDir } from './config.js';
import type { RunContextHandle } from './runContext.js';

const SESSIONS = new Map<string, DesignAgentSession>();

export function createSession(input: {
  projectId: string;
  pageId: string;
  route: string;
  threadTask: string;
  intent: DesignAgentIntent;
  writeMode: DesignWriteMode;
}): DesignAgentSession {
  const now = new Date().toISOString();
  const session: DesignAgentSession = {
    sessionId: `session-${now.slice(0, 10)}-${randomUUID().slice(0, 8)}`,
    projectId: input.projectId,
    pageId: input.pageId,
    route: input.route,
    threadTask: input.threadTask,
    intent: input.intent,
    writeMode: input.writeMode,
    runs: [],
    founderFeedback: [],
    compaction: null,
    createdAt: now,
    updatedAt: now,
    status: 'OPEN',
  };
  SESSIONS.set(session.sessionId, session);
  return session;
}

export function getSession(sessionId: string): DesignAgentSession | null {
  return SESSIONS.get(sessionId) ?? null;
}

export function listSessions(filter?: { pageId?: string; projectId?: string }): DesignAgentSession[] {
  return [...SESSIONS.values()]
    .filter((session) => !filter?.pageId || session.pageId === filter.pageId)
    .filter((session) => !filter?.projectId || session.projectId === filter.projectId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function closeSession(sessionId: string): DesignAgentSession | null {
  const session = SESSIONS.get(sessionId);
  if (!session) return null;
  session.status = 'CLOSED';
  session.updatedAt = new Date().toISOString();
  void persistSession(session);
  return session;
}

/**
 * Folds one finished run into its session and rebuilds the compaction.
 *
 * Rebuilt rather than appended: a compaction is a statement about the current
 * state of the thread, and appending would reproduce exactly the unbounded
 * growth Phase 25 exists to avoid.
 */
export function recordRunInSession(
  session: DesignAgentSession,
  run: RunContextHandle,
  outcome: DesignSessionRunSummary['outcome'],
): DesignAgentSession {
  const patch = run.patch();
  const lastDiff = run.screenshots.slice().reverse().find((shot) => typeof shot.diffPercent === 'number');

  const summary: DesignSessionRunSummary = {
    runId: run.runId,
    intent: run.intent,
    mode: run.mode,
    task: run.task,
    outcome,
    filesChanged: patch?.filesChanged ?? [],
    diffPercent: lastDiff?.diffPercent ?? null,
    costUsd: run.meter.check().spentUsd,
    at: new Date().toISOString(),
  };

  const existing = session.runs.findIndex((entry) => entry.runId === run.runId);
  if (existing >= 0) session.runs[existing] = summary;
  else session.runs.push(summary);

  session.compaction = buildCompaction(session, run);
  session.updatedAt = new Date().toISOString();
  void persistSession(session);
  return session;
}

export function recordFeedback(session: DesignAgentSession, runId: string, note: string): DesignAgentSession {
  session.founderFeedback.push({ at: new Date().toISOString(), note, afterRunId: runId });
  if (session.compaction) session.compaction.openRequest = note;
  session.updatedAt = new Date().toISOString();
  void persistSession(session);
  return session;
}

function buildCompaction(session: DesignAgentSession, run: RunContextHandle): DesignSessionCompaction {
  const patch = run.patch();
  const tests = run.testResult();
  const typecheck = run.typecheckResult();
  const lastDiff = run.screenshots.slice().reverse().find((shot) => typeof shot.diffPercent === 'number');

  const approvedFacts: string[] = [];
  approvedFacts.push(`Surface ${session.pageId} at ${session.route}.`);
  if (patch) approvedFacts.push(`Files in scope and successfully edited: ${patch.filesChanged.join(', ')}.`);
  if (typecheck?.ok) approvedFacts.push('Typecheck passes with the current patch applied.');
  if (tests?.ok) approvedFacts.push('Targeted guards pass with the current patch applied.');
  if (lastDiff?.diffPercent !== undefined) {
    approvedFacts.push(`Last measured render delta: ${lastDiff.diffPercent}% of pixels changed.`);
  }

  /**
   * Derived from observed failure, not from the model's self-report. A tool
   * call that failed is a rejected approach whether or not the model chose to
   * mention it in its summary.
   */
  const failedApproaches = run.toolCalls
    .filter((call) => !call.ok)
    .map((call) => ({
      approach: `${call.tool}(${summariseInput(call.input)})`,
      reason: call.summary,
    }));
  if (tests && !tests.ok) {
    failedApproaches.push({ approach: 'the current patch as written', reason: 'targeted guards failed' });
  }

  const priorFeedback = session.founderFeedback.filter((entry) => entry.afterRunId !== run.runId);
  for (const entry of priorFeedback) {
    failedApproaches.push({ approach: `the state after ${entry.afterRunId}`, reason: `founder asked for changes: ${entry.note}` });
  }

  const patchState: DesignSessionCompaction['currentPatchState'] = !patch
    ? 'NONE'
    : run.status === 'APPROVED'
      ? 'APPROVED'
      : run.status === 'REVERTED' || !patch.applied
        ? 'REVERTED'
        : 'APPLIED_PENDING_REVIEW';

  return {
    currentTask: session.threadTask,
    approvedFacts,
    failedApproaches,
    currentDesignState: patch
      ? `${patch.filesChanged.length} file(s) carry an unapproved patch: ${patch.reason}`
      : 'No patch is applied. The surface is at its committed state.',
    openRequest: session.founderFeedback.at(-1)?.note ?? null,
    latestScreenshotId: run.screenshots.at(-1)?.screenshotId ?? null,
    currentPatchState: patchState,
    compactedAt: new Date().toISOString(),
  };
}

function summariseInput(input: Record<string, unknown>): string {
  const keys = Object.keys(input).slice(0, 3);
  return keys.map((key) => `${key}=${String(input[key]).slice(0, 40)}`).join(', ');
}

async function persistSession(session: DesignAgentSession): Promise<void> {
  try {
    const dir = path.join(opusNativeWorkDir(), 'sessions');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${session.sessionId}.json`), JSON.stringify(session, null, 2), 'utf8');
  } catch {
    // A session that cannot be mirrored to disk is still usable in memory;
    // losing the mirror must not take the run down with it.
  }
}
