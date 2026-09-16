/**
 * P0.VR.OPUS-NATIVE1 — Phase 10 + 11: patch-based editing and the working
 * boundary.
 *
 * Lifecycle: BASELINE -> AGENT PATCH -> PREVIEW -> QA -> FOUNDER REVIEW ->
 * APPLY or REVERT.
 *
 * The agent writes to the real working tree, because that is the only way the
 * dev server can render the change and the screenshot loop can see it. What
 * makes that safe is not isolation from the filesystem but three hard
 * properties:
 *
 *   1. the write allowlist is a fixed, per-surface list of files, enforced here
 *      and not merely requested of the model;
 *   2. the exact prior bytes of every touched file are captured before the
 *      first write, so revert restores content rather than approximating it;
 *   3. nothing is committed. Approval marks a patch approved and leaves it in
 *      the tree for a human to commit; revert restores the baseline exactly.
 *
 * An agent run can therefore never reach the approved baseline on its own.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { DesignAgentPatch } from '../../../shared/site00-opus-native/types.js';
import { opusNativeWorkDir, repoRoot } from './config.js';
import { isInspectablePath } from './contextCompiler.js';

export class ScopeViolationError extends Error {
  constructor(public readonly file: string, public readonly allowed: string[]) {
    super(`SCOPE_VIOLATION: ${file} is not on the write allowlist`);
    this.name = 'ScopeViolationError';
  }
}

export class PatchConflictError extends Error {
  constructor(public readonly file: string, detail: string) {
    super(`PATCH_CONFLICT: ${file} — ${detail}`);
    this.name = 'PatchConflictError';
  }
}

export interface PatchEdit {
  file: string;
  /** Exact existing substring to replace. Empty `find` appends. */
  find: string;
  replace: string;
}

function assertWritable(file: string, writeAllowlist: string[]): void {
  if (!isInspectablePath(file) || !writeAllowlist.includes(file)) {
    throw new ScopeViolationError(file, writeAllowlist);
  }
}

async function readIfExists(abs: string): Promise<string | null> {
  try {
    return await readFile(abs, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Applies a set of surgical edits and returns a reversible patch record.
 * Full-file regeneration is deliberately not offered: a find/replace that
 * cannot locate its anchor is a conflict the founder should see, whereas a
 * whole-file rewrite silently discards anything the agent did not know about.
 */
export async function applyPatch(input: {
  runId: string;
  edits: PatchEdit[];
  reason: string;
  writeAllowlist: string[];
  /** Baseline captured by an earlier patch in the same run, so revert reaches the true origin. */
  existingBaseline?: Record<string, string | null>;
}): Promise<DesignAgentPatch> {
  const { runId, edits, reason, writeAllowlist } = input;
  if (edits.length === 0) throw new PatchConflictError('(none)', 'patch contained no edits');

  const baseline: Record<string, string | null> = { ...(input.existingBaseline ?? {}) };
  const filesChanged: string[] = [];
  const diffParts: string[] = [];

  for (const edit of edits) {
    assertWritable(edit.file, writeAllowlist);
    const abs = path.resolve(repoRoot(), edit.file);
    const current = await readIfExists(abs);

    if (!(edit.file in baseline)) baseline[edit.file] = current;

    if (current === null) {
      throw new PatchConflictError(edit.file, 'file does not exist');
    }
    if (edit.find.length === 0) {
      throw new PatchConflictError(edit.file, 'empty find anchor is not permitted');
    }
    const occurrences = current.split(edit.find).length - 1;
    if (occurrences === 0) {
      throw new PatchConflictError(edit.file, 'find anchor not present in the current file');
    }
    if (occurrences > 1) {
      throw new PatchConflictError(
        edit.file,
        `find anchor matches ${occurrences} times; provide more surrounding context so the edit is unambiguous`,
      );
    }

    const next = current.replace(edit.find, edit.replace);
    await writeFile(abs, next, 'utf8');
    if (!filesChanged.includes(edit.file)) filesChanged.push(edit.file);
    diffParts.push(renderUnifiedish(edit));
  }

  const patch: DesignAgentPatch = {
    patchId: `patch-${randomUUID().slice(0, 8)}`,
    runId,
    filesChanged,
    diff: diffParts.join('\n'),
    reason,
    reversible: true,
    createdAt: new Date().toISOString(),
    baseline,
    applied: true,
  };

  await persistPatch(patch);
  return patch;
}

/** Restores every touched file to the bytes captured before the run's first write. */
export async function revertPatch(patch: DesignAgentPatch): Promise<{ reverted: string[] }> {
  const reverted: string[] = [];
  for (const [file, original] of Object.entries(patch.baseline)) {
    if (original === null) continue;
    const abs = path.resolve(repoRoot(), file);
    await writeFile(abs, original, 'utf8');
    reverted.push(file);
  }
  patch.applied = false;
  await persistPatch(patch);
  return { reverted };
}

/** Verifies the tree still matches what the patch produced, before approval. */
export async function verifyPatchIntact(patch: DesignAgentPatch): Promise<boolean> {
  for (const file of patch.filesChanged) {
    const abs = path.resolve(repoRoot(), file);
    const current = await readIfExists(abs);
    if (current === null) return false;
    if (current === patch.baseline[file]) return false;
  }
  return true;
}

function renderUnifiedish(edit: PatchEdit): string {
  const removed = edit.find.split('\n').map((line) => `- ${line}`).join('\n');
  const added = edit.replace.split('\n').map((line) => `+ ${line}`).join('\n');
  return `--- ${edit.file}\n+++ ${edit.file}\n${removed}\n${added}`;
}

async function persistPatch(patch: DesignAgentPatch): Promise<void> {
  const dir = path.join(opusNativeWorkDir(), 'patches');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${patch.patchId}.json`), JSON.stringify(patch, null, 2), 'utf8');
}
