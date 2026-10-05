/**
 * P0.PAF.1 — Variant generation concurrency policy.
 */

import { DEFAULT_CONCURRENCY_POLICY } from './constants.js';
import type { VariantGenerationConcurrencyPolicy } from './types.js';

export function getDefaultConcurrencyPolicy(): VariantGenerationConcurrencyPolicy {
  return { ...DEFAULT_CONCURRENCY_POLICY };
}

export function clampConcurrency(
  requested: number,
  policy: VariantGenerationConcurrencyPolicy = getDefaultConcurrencyPolicy(),
): number {
  return Math.min(requested, policy.maxConcurrentRequests, policy.providerRateLimit);
}

export async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  policy: VariantGenerationConcurrencyPolicy = getDefaultConcurrencyPolicy(),
): Promise<void> {
  const max = clampConcurrency(policy.maxConcurrentRequests, policy);
  let index = 0;
  const inFlight: Promise<void>[] = [];

  async function runNext(): Promise<void> {
    if (index >= items.length) return;
    const current = items[index++];
    await worker(current);
    await runNext();
  }

  for (let i = 0; i < Math.min(max, items.length); i++) {
    inFlight.push(runNext());
  }
  await Promise.all(inFlight);
}

export function estimateWithinBudget(costUsd: number, policy: VariantGenerationConcurrencyPolicy): boolean {
  return costUsd <= policy.projectBudgetLimitUsd;
}
