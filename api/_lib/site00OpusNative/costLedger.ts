/**
 * P0.VR.OPUS-NATIVE1 — Phase 6 + 7: cost receipts and the spend guard.
 *
 * The guard is checked before every model iteration rather than after, because
 * a limit that is only noticed once it has been exceeded is an accounting
 * record, not a guard.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { modeContract } from '../../../shared/site00-opus-native/modeContracts.js';
import {
  addUsage,
  cacheSavingsUsd,
  EMPTY_USAGE,
  round6,
  usageCostUsd,
  type TokenUsage,
} from '../../../shared/site00-opus-native/pricing.js';
import type {
  OpusNativeCostGuardVerdict,
  OpusNativeCostReceipt,
  OpusNativeMode,
} from '../../../shared/site00-opus-native/types.js';
import { opusNativeWorkDir, tokenRates } from './config.js';

export class CostCeilingError extends Error {
  constructor(public readonly verdict: OpusNativeCostGuardVerdict) {
    super(`COST_CEILING: ${verdict.reason ?? 'spend ceiling reached'}`);
    this.name = 'CostCeilingError';
  }
}

export class IterationCeilingError extends Error {
  constructor(public readonly verdict: OpusNativeCostGuardVerdict) {
    super(`ITERATION_CEILING: ${verdict.reason ?? 'iteration ceiling reached'}`);
    this.name = 'IterationCeilingError';
  }
}

/** Accumulates one run's spend and answers the guard question. */
export class RunCostMeter {
  usage: TokenUsage = { ...EMPTY_USAGE };
  iterations = 0;
  toolCalls = 0;

  constructor(
    public readonly runId: string,
    public readonly mode: OpusNativeMode,
    public readonly projectId: string,
    public readonly pageId: string,
    public readonly protocolHash: string,
    /** Founder-supplied override, clamped to the mode ceiling. */
    private readonly overrideMaxUsd?: number,
  ) {}

  get limits() {
    const base = modeContract(this.mode).limits;
    if (typeof this.overrideMaxUsd !== 'number') return base;
    const clamped = Math.min(this.overrideMaxUsd, base.maxRunCostUsd);
    return { ...base, maxRunCostUsd: clamped, hardStopAtCostUsd: clamped };
  }

  get spentUsd(): number {
    return usageCostUsd(this.usage, tokenRates());
  }

  record(usage: TokenUsage): void {
    this.usage = addUsage(this.usage, usage);
  }

  /**
   * Called before dispatching another iteration. Returns BLOCKED rather than
   * throwing so the caller can finish the run cleanly, preserve the work and
   * present it for review — Phase 21 requires that a ceiling stop does not
   * discard what has already been produced.
   */
  check(): OpusNativeCostGuardVerdict {
    const limits = this.limits;
    const spentUsd = round6(this.spentUsd);
    const base = { limits, spentUsd, iterations: this.iterations };

    if (this.iterations >= limits.maxIterations) {
      return { ...base, state: 'BLOCKED', reason: `iteration ceiling reached (${limits.maxIterations})` };
    }
    if (spentUsd >= limits.hardStopAtCostUsd) {
      return { ...base, state: 'BLOCKED', reason: `hard spend ceiling reached ($${limits.hardStopAtCostUsd})` };
    }
    if (this.usage.inputTokens >= limits.maxInputTokens) {
      return { ...base, state: 'BLOCKED', reason: `input token ceiling reached (${limits.maxInputTokens})` };
    }
    if (this.usage.outputTokens >= limits.maxOutputTokens) {
      return { ...base, state: 'BLOCKED', reason: `output token ceiling reached (${limits.maxOutputTokens})` };
    }
    if (spentUsd >= limits.warnAtCostUsd) {
      return { ...base, state: 'WARNING', reason: `spend passed the warning threshold ($${limits.warnAtCostUsd})` };
    }
    return { ...base, state: 'OK', reason: null };
  }

  receipt(): OpusNativeCostReceipt {
    const rates = tokenRates();
    const estimatedUsd = usageCostUsd(this.usage, rates);
    return {
      runId: this.runId,
      model: 'claude-opus-5',
      mode: this.mode,
      inputTokens: this.usage.inputTokens,
      outputTokens: this.usage.outputTokens,
      cacheWriteTokens: this.usage.cacheWriteTokens,
      cacheReadTokens: this.usage.cacheReadTokens,
      estimatedUsd,
      // Anthropic bills from the same token counts it reports, so once a run
      // has completed against the real provider the estimate IS the actual.
      actualUsd: estimatedUsd,
      toolCalls: this.toolCalls,
      iterations: this.iterations,
      projectId: this.projectId,
      pageId: this.pageId,
      taskType: this.mode,
      cacheSavingsUsd: cacheSavingsUsd(this.usage, rates),
      protocolHash: this.protocolHash,
      createdAt: new Date().toISOString(),
    };
  }
}

function ledgerDir(): string {
  return path.join(opusNativeWorkDir(), 'ledger');
}

export async function persistReceipt(receipt: OpusNativeCostReceipt): Promise<void> {
  await mkdir(ledgerDir(), { recursive: true });
  await writeFile(
    path.join(ledgerDir(), `${receipt.runId}.json`),
    JSON.stringify(receipt, null, 2),
    'utf8',
  );
}

export async function readLedger(): Promise<OpusNativeCostReceipt[]> {
  try {
    const files = await readdir(ledgerDir());
    const receipts: OpusNativeCostReceipt[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        receipts.push(JSON.parse(await readFile(path.join(ledgerDir(), file), 'utf8')));
      } catch {
        /* a corrupt receipt must not take down the ledger */
      }
    }
    return receipts.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

/** Phase 6 — the four questions the ledger has to be able to answer. */
export function summariseLedger(receipts: OpusNativeCostReceipt[]) {
  const costPerPage: Record<string, number> = {};
  const costPerProject: Record<string, number> = {};
  let totalUsd = 0;
  let totalCacheSavingsUsd = 0;
  let refinements = 0;
  let refinementUsd = 0;

  for (const receipt of receipts) {
    const spend = receipt.actualUsd ?? receipt.estimatedUsd;
    totalUsd += spend;
    totalCacheSavingsUsd += receipt.cacheSavingsUsd;
    costPerPage[receipt.pageId] = round6((costPerPage[receipt.pageId] ?? 0) + spend);
    costPerProject[receipt.projectId] = round6((costPerProject[receipt.projectId] ?? 0) + spend);
    if (receipt.mode === 'QUICK' || receipt.mode === 'DESIGN') {
      refinements += 1;
      refinementUsd += spend;
    }
  }

  return {
    runs: receipts.length,
    totalUsd: round6(totalUsd),
    totalCacheSavingsUsd: round6(totalCacheSavingsUsd),
    costPerPage,
    costPerProject,
    costPerRefinementUsd: refinements > 0 ? round6(refinementUsd / refinements) : 0,
  };
}
