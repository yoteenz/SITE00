/**
 * P0.FILM.1 — Film generation plan + pre-production cost gate.
 */

import type { FilmGenerationPlan, FilmShotContract } from '../types.js';
import { routeAllShots } from '../routing/modelRouter.js';
import { DEFAULT_CANDIDATE_COUNT, BACKUP_CANDIDATE_COUNT } from '../constants.js';

export function buildFilmGenerationPlan(filmId: string, shots: FilmShotContract[]): FilmGenerationPlan {
  const routing = routeAllShots(shots);
  const shotPlans = routing.map((r) => ({
    shotId: r.shotId,
    providerStack: r.productionStack,
    laneId: r.laneId,
    estimatedCostUsd: r.estimatedCostUsd * r.candidateCount,
    candidateCount: r.candidateCount,
    riskProfile: shots.find((s) => s.shotId === r.shotId)!.riskProfile,
    blocked: false,
    blockReason: null as string | null,
  }));

  const blockedShots = shotPlans.filter((s) => s.blocked).map((s) => s.shotId);
  const continuityRisk = shots.filter((s) => s.riskProfile === 'HIGH' || s.riskProfile === 'STRESS_TEST').map((s) => s.shotId);
  const realismRisk = shots.filter((s) => s.shotClass.includes('MIRROR') || s.shotClass.includes('HAND')).map((s) => s.shotId);

  return {
    planId: `gen-plan-${filmId}`,
    filmId,
    approved: false,
    approvedAt: null,
    approvedBy: null,
    shots: shotPlans,
    totalEstimatedCostUsd: shotPlans.reduce((sum, s) => sum + s.estimatedCostUsd, 0),
    totalGenerations: shotPlans.reduce((sum, s) => sum + s.candidateCount, 0),
    blockedShots,
    continuityRisk,
    realismRisk,
    providerSpendAllowed: false,
  };
}

export function approveGenerationPlan(plan: FilmGenerationPlan, approvedBy: string): FilmGenerationPlan {
  return {
    ...plan,
    approved: true,
    approvedAt: new Date().toISOString(),
    approvedBy,
    providerSpendAllowed: true,
  };
}

export function noGenerationBeforeApproval(plan: FilmGenerationPlan): boolean {
  return !plan.providerSpendAllowed;
}

export function estimatedCostAvailable(plan: FilmGenerationPlan): boolean {
  return plan.totalEstimatedCostUsd >= 0 && plan.shots.length > 0;
}

export function candidateStrategyForRisk(risk: string): number {
  if (risk === 'HIGH' || risk === 'STRESS_TEST') return DEFAULT_CANDIDATE_COUNT + BACKUP_CANDIDATE_COUNT;
  return DEFAULT_CANDIDATE_COUNT;
}

export function boundedRetriesEnforced(retryCount: number, maxRetries = 2): boolean {
  return retryCount <= maxRetries;
}
