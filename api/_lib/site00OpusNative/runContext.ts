/**
 * P0.VR.OPUS-NATIVE1 — mutable state for one in-flight run, plus the run store.
 *
 * Runs live in memory with their artifacts on disk. That is the right shape for
 * an internal single-founder surface: a receipt, a patch and a screenshot
 * survive a restart because they are files, while the live agent loop does not
 * need to, because a restart cancels it anyway.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type {
  DesignAgentContext,
  DesignAgentLineageRecord,
  DesignAgentPatch,
  OpusNativeCostReceipt,
  OpusNativeFailure,
  OpusNativeGoldenReference,
  OpusNativeMode,
  OpusNativeReviewPackage,
  OpusNativeRun,
  OpusNativeRunStatus,
  OpusNativeScreenshot,
  OpusNativeToolCallRecord,
} from '../../../shared/site00-opus-native/types.js';
import type { CompiledAgentContext } from '../../../shared/site00-opus-native/types.js';
import { opusNativeWorkDir, redactSecrets } from './config.js';
import type { RunCostMeter } from './costLedger.js';
import type { DesignSurfaceEntry } from './designSurfaceRegistry.js';

export class RunContextHandle {
  status: OpusNativeRunStatus = 'READY';
  failure: OpusNativeFailure | null = null;
  failureDetail: string | null = null;
  cancelled = false;
  readonly createdAt = new Date().toISOString();
  updatedAt = this.createdAt;

  readonly toolCalls: OpusNativeToolCallRecord[] = [];
  readonly screenshots: OpusNativeScreenshot[] = [];
  readonly transcript: OpusNativeRun['transcript'] = [];

  private currentPatch: DesignAgentPatch | null = null;
  private typecheck: { ran: boolean; ok: boolean; output: string } | null = null;
  private tests: { ran: boolean; ok: boolean; output: string } | null = null;
  private reviewPackage: OpusNativeReviewPackage | null = null;
  private lineageRecord: DesignAgentLineageRecord | null = null;
  private receiptRecord: OpusNativeCostReceipt | null = null;
  cachePosture: 'HIT' | 'MISS' | 'PARTIAL' | 'UNKNOWN' = 'UNKNOWN';

  constructor(
    readonly runId: string,
    readonly mode: OpusNativeMode,
    readonly task: string,
    readonly context: DesignAgentContext,
    readonly compiled: CompiledAgentContext,
    readonly surface: DesignSurfaceEntry,
    readonly meter: RunCostMeter,
    readonly providerId: 'anthropic' | 'scripted',
    private readonly projectContext: string,
  ) {}

  touch(status?: OpusNativeRunStatus): void {
    if (status) this.status = status;
    this.updatedAt = new Date().toISOString();
  }

  note(kind: 'assistant' | 'tool' | 'system', text: string): void {
    this.transcript.push({ at: new Date().toISOString(), kind, text: redactSecrets(text) });
    this.touch();
  }

  projectContextText(): string {
    return this.projectContext;
  }

  golden(): OpusNativeGoldenReference | null {
    return this.context.goldenReference;
  }

  patch(): DesignAgentPatch | null {
    return this.currentPatch;
  }

  setPatch(patch: DesignAgentPatch): void {
    this.currentPatch = patch;
    this.touch();
  }

  setTypecheck(result: { ran: boolean; ok: boolean; output: string }): void {
    this.typecheck = result;
  }

  setTests(result: { ran: boolean; ok: boolean; output: string }): void {
    this.tests = result;
  }

  typecheckResult() {
    return this.typecheck;
  }

  testResult() {
    return this.tests;
  }

  addScreenshot(shot: OpusNativeScreenshot): void {
    this.screenshots.push(shot);
    this.touch();
  }

  /**
   * Exact id first, then the capture label. Labels matter because the agent
   * chooses them ("before", "after") and can refer to them without having to
   * carry a generated id across turns, which is the most common way a
   * comparison call goes wrong.
   */
  screenshotById(id: string): OpusNativeScreenshot | null {
    if (!id) return null;
    const exact = this.screenshots.find((shot) => shot.screenshotId === id);
    if (exact) return exact;
    const label = id.trim().toLowerCase();
    const byLabel = this.screenshots.filter((shot) => shot.screenshotId.startsWith(`shot-${label}-`));
    return byLabel.length > 0 ? byLabel[byLabel.length - 1] : null;
  }

  recordComparison(afterId: string, beforeId: string, diffPercent: number): void {
    const shot = this.screenshotById(afterId);
    if (shot) {
      shot.comparedToId = beforeId;
      shot.diffPercent = diffPercent;
    }
  }

  recordToolCall(record: OpusNativeToolCallRecord): void {
    this.toolCalls.push(record);
    this.meter.toolCalls += 1;
    this.touch();
  }

  setReview(review: OpusNativeReviewPackage): void {
    this.reviewPackage = review;
    this.touch();
  }

  review(): OpusNativeReviewPackage | null {
    return this.reviewPackage;
  }

  setLineage(record: DesignAgentLineageRecord): void {
    this.lineageRecord = record;
    this.touch();
  }

  lineage(): DesignAgentLineageRecord | null {
    return this.lineageRecord;
  }

  setReceipt(receipt: OpusNativeCostReceipt): void {
    this.receiptRecord = receipt;
    this.touch();
  }

  fail(failure: OpusNativeFailure, detail: string): void {
    this.failure = failure;
    this.failureDetail = redactSecrets(detail);
    this.touch('ERROR');
  }

  /** The wire shape. Blocks are summarised rather than sent — the panel needs sizes, not text. */
  serialise(): OpusNativeRun {
    return {
      runId: this.runId,
      mode: this.mode,
      task: this.task,
      status: this.status,
      failure: this.failure,
      failureDetail: this.failureDetail,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      context: this.context,
      compiled: {
        totalEstimatedTokens: this.compiled.totalEstimatedTokens,
        cacheableEstimatedTokens: this.compiled.cacheableEstimatedTokens,
        fileAllowlist: this.compiled.fileAllowlist,
        writeAllowlist: this.compiled.writeAllowlist,
        protocolVersion: this.compiled.protocolVersion,
        protocolHash: this.compiled.protocolHash,
        blockSummary: this.compiled.blocks.map((block) => ({
          tier: block.tier,
          label: block.label,
          estimatedTokens: block.estimatedTokens,
          cacheable: block.cacheable,
        })),
      },
      toolCalls: this.toolCalls,
      screenshots: this.screenshots,
      patch: this.currentPatch,
      receipt: this.receiptRecord,
      guard: this.meter.check(),
      review: this.reviewPackage,
      lineage: this.lineageRecord,
      transcript: this.transcript,
      providerId: this.providerId,
    };
  }
}

const RUNS = new Map<string, RunContextHandle>();
const RUN_ORDER: string[] = [];
const MAX_RETAINED_RUNS = 40;

export function storeRun(run: RunContextHandle): void {
  RUNS.set(run.runId, run);
  RUN_ORDER.push(run.runId);
  while (RUN_ORDER.length > MAX_RETAINED_RUNS) {
    const evicted = RUN_ORDER.shift();
    if (evicted) RUNS.delete(evicted);
  }
}

export function getRun(runId: string): RunContextHandle | null {
  return RUNS.get(runId) ?? null;
}

export function latestRun(): RunContextHandle | null {
  for (let i = RUN_ORDER.length - 1; i >= 0; i -= 1) {
    const run = RUNS.get(RUN_ORDER[i]);
    if (run) return run;
  }
  return null;
}

/** Phase 19 — the lineage record is written to disk so approval is auditable. */
export async function persistLineage(record: DesignAgentLineageRecord): Promise<void> {
  const dir = path.join(opusNativeWorkDir(), 'lineage');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${record.lineageId}.json`), JSON.stringify(record, null, 2), 'utf8');
}
