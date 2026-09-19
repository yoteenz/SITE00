/**
 * B5.9R2 — Weighted project progress from enabled module state.
 *
 * Weights apply only to enabled modules:
 * - IDENTITY: 25%
 * - BUILDER: 30%
 * - EVOLVE: 25%
 * - PRODUCTION: 20%
 *
 * If no module yields a numeric percent, return label-only progress.
 */

import type { GeneralizedProjectOperatingState } from './generalizedProjectOperatingState.js';

export type ProjectProgressConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type ProjectProgressSummary = {
  percent: number | null;
  label: string | null;
  confidence: ProjectProgressConfidence;
};

const MODULE_WEIGHTS = {
  IDENTITY: 25,
  BUILDER: 30,
  EVOLVE: 25,
  PRODUCTION: 20,
} as const;

function identityProgressPercent(
  state: GeneralizedProjectOperatingState['identityState'],
): number | null {
  if (!state) return null;
  const fields = [state.brandTruth, state.personality, state.voice, state.visualDna];
  const defined = fields.filter((f) => /DEFINED|APPROVED|COMPLETE/i.test(f)).length;
  if (defined === 0) return 0;
  return Math.round((defined / fields.length) * 100);
}

function evolveProgressPercent(
  state: GeneralizedProjectOperatingState['evolveState'],
): number | null {
  if (!state) return null;
  if (state.activeCampaigns > 0 || state.contentInProduction > 0) {
    const activity = state.activeCampaigns + state.contentInProduction + state.packagesReady;
    return Math.min(100, Math.round((activity / 10) * 100));
  }
  return null;
}

function productionProgressPercent(
  state: GeneralizedProjectOperatingState['productionState'],
): number | null {
  if (!state) return null;
  if (state.launchChecklistTotal > 0) {
    return Math.round((state.launchChecklistComplete / state.launchChecklistTotal) * 100);
  }
  return null;
}

export function buildProjectProgressSummary(
  operatingState: GeneralizedProjectOperatingState,
): ProjectProgressSummary {
  const manifest = operatingState.capabilityManifest;
  const enabled = manifest.enabledModules;
  let weightedSum = 0;
  let weightTotal = 0;
  let measuredModules = 0;

  if (enabled.includes('IDENTITY') && operatingState.identityState) {
    const p = identityProgressPercent(operatingState.identityState);
    if (p != null) {
      weightedSum += p * MODULE_WEIGHTS.IDENTITY;
      weightTotal += MODULE_WEIGHTS.IDENTITY;
      measuredModules++;
    }
  }
  if (enabled.includes('BUILDER') && operatingState.builderState) {
    const p = operatingState.builderState.buildProgressPercent;
    if (p > 0 || operatingState.builderState.pages > 0) {
      weightedSum += p * MODULE_WEIGHTS.BUILDER;
      weightTotal += MODULE_WEIGHTS.BUILDER;
      measuredModules++;
    }
  }
  if (enabled.includes('EVOLVE') && operatingState.evolveState) {
    const p = evolveProgressPercent(operatingState.evolveState);
    if (p != null) {
      weightedSum += p * MODULE_WEIGHTS.EVOLVE;
      weightTotal += MODULE_WEIGHTS.EVOLVE;
      measuredModules++;
    }
  }
  if (enabled.includes('PRODUCTION') && operatingState.productionState) {
    const p = productionProgressPercent(operatingState.productionState);
    if (p != null) {
      weightedSum += p * MODULE_WEIGHTS.PRODUCTION;
      weightTotal += MODULE_WEIGHTS.PRODUCTION;
      measuredModules++;
    }
  }

  if (operatingState.summary.progressPercent > 0 && weightTotal === 0) {
    return {
      percent: operatingState.summary.progressPercent,
      label: null,
      confidence: 'MEDIUM',
    };
  }

  if (weightTotal === 0) {
    const phase = operatingState.summary.phase;
    return {
      percent: null,
      label: phase.includes('REVIEW') ? 'AWAITING REVIEW' : 'IN PROGRESS',
      confidence: 'LOW',
    };
  }

  const percent = Math.round(weightedSum / weightTotal);
  return {
    percent,
    label: null,
    confidence: measuredModules >= 2 ? 'HIGH' : 'MEDIUM',
  };
}
