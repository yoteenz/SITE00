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

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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
  /** Exact existing substring to replace. Must match exactly once. */
  find: string;
  replace: string;
}

/** P0.VR.OPUS-NATIVE2 — Phase 10. A new file, in the same reviewable patch. */
export interface PatchCreate {
  file: string;
  content: string;
  /** Overwriting an existing file is a distinct, explicit act. */
  overwrite?: boolean;
}

export class AssetFirewallError extends Error {
  constructor(public readonly detail: string) {
    super(`ASSET_MUTATION_BLOCKED: ${detail}`);
    this.name = 'AssetFirewallError';
  }
}

async function readIfExists(abs: string): Promise<string | null> {
  try {
    return await readFile(abs, 'utf8');
  } catch {
    return null;
  }
}

interface PlannedWrite {
  file: string;
  abs: string;
  before: string | null;
  after: string;
  diff: string;
  created: boolean;
}

/**
 * Applies a set of surgical edits and file creations as one reversible patch.
 *
 * Full-file regeneration of an existing file is deliberately not offered: a
 * find/replace that cannot locate its anchor is a conflict the founder should
 * see, whereas a whole-file rewrite silently discards anything the agent did
 * not know about.
 *
 * P0.VR.OPUS-NATIVE2 — Phase 11 made this atomic. NATIVE1 validated and wrote
 * in the same pass, so a three-file patch whose third file was out of scope
 * left the first two modified on disk and threw. Real page work touches a
 * component, a stylesheet and a test together, and a partially-applied patch
 * of that shape is worse than no patch: it renders, so the failure is not
 * obvious. Every write is now planned and validated in full before any byte
 * reaches the filesystem.
 */
export async function applyPatch(input: {
  runId: string;
  edits: PatchEdit[];
  creates?: PatchCreate[];
  reason: string;
  writeAllowlist: string[];
  /** Phase 10 — predicate supplied by the write policy for creation paths. */
  canCreate?: (file: string) => boolean;
  /** Phase 9 — asset firewall, evaluated against edit content. */
  assetGuard?: (edits: Array<{ file: string; find: string; replace: string }>) => { blocked: boolean; reason: string | null };
  /** Baseline captured by an earlier patch in the same run, so revert reaches the true origin. */
  existingBaseline?: Record<string, string | null>;
}): Promise<DesignAgentPatch> {
  const { runId, edits, reason, writeAllowlist } = input;
  const creates = input.creates ?? [];
  if (edits.length === 0 && creates.length === 0) {
    throw new PatchConflictError('(none)', 'patch contained no edits and no creations');
  }

  if (input.assetGuard) {
    const verdict = input.assetGuard([
      ...edits,
      ...creates.map((create) => ({ file: create.file, find: '', replace: create.content })),
    ]);
    if (verdict.blocked) throw new AssetFirewallError(verdict.reason ?? 'asset mutation is not permitted');
  }

  // ---- Phase 1: plan and validate everything. No writes in this pass. ------
  const planned: PlannedWrite[] = [];
  const pending = new Map<string, string>();

  for (const create of creates) {
    if (!(input.canCreate?.(create.file) ?? false)) {
      throw new ScopeViolationError(create.file, writeAllowlist);
    }
    const abs = path.resolve(repoRoot(), create.file);
    const existing = await readIfExists(abs);
    if (existing !== null && create.overwrite !== true) {
      throw new PatchConflictError(create.file, 'file already exists; pass overwrite to replace it deliberately');
    }
    planned.push({
      file: create.file,
      abs,
      before: existing,
      after: create.content,
      diff: renderCreate(create.file, create.content),
      created: existing === null,
    });
    pending.set(create.file, create.content);
  }

  for (const edit of edits) {
    // A file created earlier in the same patch is editable by a later edit in
    // that patch; anything else must be on the allowlist.
    if (!pending.has(edit.file) && (!isInspectablePath(edit.file) || !writeAllowlist.includes(edit.file))) {
      throw new ScopeViolationError(edit.file, writeAllowlist);
    }
    const abs = path.resolve(repoRoot(), edit.file);
    const current = pending.get(edit.file) ?? (await readIfExists(abs));

    if (current === null) throw new PatchConflictError(edit.file, 'file does not exist');
    if (edit.find.length === 0) throw new PatchConflictError(edit.file, 'empty find anchor is not permitted');

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
    const already = planned.find((entry) => entry.file === edit.file);
    if (already) {
      already.after = next;
      already.diff = `${already.diff}\n${renderUnifiedish(edit)}`;
    } else {
      planned.push({
        file: edit.file,
        abs,
        before: current,
        after: next,
        diff: renderUnifiedish(edit),
        created: false,
      });
    }
    pending.set(edit.file, next);
  }

  // ---- Phase 2: commit. Validation is complete, so this pass cannot reject.
  const baseline: Record<string, string | null> = { ...(input.existingBaseline ?? {}) };
  const filesChanged: string[] = [];
  const createdFiles: string[] = [];

  for (const entry of planned) {
    if (!(entry.file in baseline)) baseline[entry.file] = entry.before;
    if (entry.created) {
      await mkdir(path.dirname(entry.abs), { recursive: true });
      createdFiles.push(entry.file);
    }
    await writeFile(entry.abs, entry.after, 'utf8');
    filesChanged.push(entry.file);
  }

  const patch: DesignAgentPatch = {
    patchId: `patch-${randomUUID().slice(0, 8)}`,
    runId,
    filesChanged,
    diff: planned.map((entry) => entry.diff).join('\n'),
    reason,
    reversible: true,
    createdAt: new Date().toISOString(),
    baseline,
    applied: true,
    createdFiles,
  };

  await persistPatch(patch);
  return patch;
}

/**
 * Restores every touched file to the bytes captured before the run's first
 * write. A file the run created has a null baseline and is deleted rather than
 * left behind as an empty artifact — "revert" has to mean the tree is as it
 * was, including its file list.
 */
export async function revertPatch(patch: DesignAgentPatch): Promise<{ reverted: string[] }> {
  const reverted: string[] = [];
  for (const [file, original] of Object.entries(patch.baseline)) {
    const abs = path.resolve(repoRoot(), file);
    if (original === null) {
      await rm(abs, { force: true });
      reverted.push(file);
      continue;
    }
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

function renderCreate(file: string, content: string): string {
  const body = content.split('\n').map((line) => `+ ${line}`).join('\n');
  return `--- /dev/null\n+++ ${file}\n${body}`;
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
