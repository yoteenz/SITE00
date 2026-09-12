/**
 * P0.VR.REPLICATION.1 — Iteration limits and plateau guard.
 */

import type { ReplicationBudgetPolicy, ReplicationIteration } from './types.js';

export function createDefaultReplicationBudgetPolicy(): ReplicationBudgetPolicy {
  return {
    maxIterations: 4,
    maxBuildAttempts: 2,
    plateauThreshold: 3,
    requiresFounderContinueAfter: 4,
    status: 'ACTIVE',
  };
}

export function detectReplicationPlateau(iterations: ReplicationIteration[]): boolean {
  if (iterations.length < 2) return false;
  const last = iterations[iterations.length - 1]!;
  const prev = iterations[iterations.length - 2]!;
  const lastComp = last.diff.compositionScore ?? 0;
  const prevComp = prev.diff.compositionScore ?? 0;
  return Math.abs(lastComp - prevComp) < 2 && last.status === 'COMPLETE';
}

export function shouldStopReplication(input: {
  policy: ReplicationBudgetPolicy;
  iterations: ReplicationIteration[];
  targets: { compositionMin: number };
}): { stop: boolean; reason: string | null } {
  if (input.iterations.length >= input.policy.maxIterations) {
    return { stop: true, reason: 'MAX_ITERATIONS' };
  }
  const last = input.iterations[input.iterations.length - 1];
  if (last?.diff.compositionScore != null && last.diff.compositionScore >= input.targets.compositionMin) {
    return { stop: true, reason: 'TARGET_REACHED' };
  }
  if (detectReplicationPlateau(input.iterations)) {
    return { stop: true, reason: 'PLATEAU' };
  }
  return { stop: false, reason: null };
}
