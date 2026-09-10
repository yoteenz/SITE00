/**
 * P0.CGO.1 — Shot diversity planner + repetition drift detection.
 */

import type { CampaignShotRole } from './types.js';

export function planShotDiversity(shots: CampaignShotRole[]): {
  cameraDistances: string[];
  productProminenceSpread: string[];
  environmentProminenceSpread: string[];
  coverageComplete: boolean;
  missingFamilies: string[];
} {
  const requiredFamilies = ['WORLD', 'CLUE', 'DETAIL', 'HANDS', 'PAYOFF'];
  const present = new Set(shots.map((s) => s.role));
  const missingFamilies = requiredFamilies.filter((f) => !present.has(f as CampaignShotRole['role']));

  return {
    cameraDistances: [...new Set(shots.map((s) => s.cameraDistance))],
    productProminenceSpread: [...new Set(shots.map((s) => s.productProminence))],
    environmentProminenceSpread: [...new Set(shots.map((s) => s.environmentProminence))],
    coverageComplete: missingFamilies.length === 0,
    missingFamilies,
  };
}

export function detectShotRepetitionDrift(shots: CampaignShotRole[]): string[] {
  const warnings: string[] = [];
  const byDistance = countField(shots, (s) => s.cameraDistance);
  const byProduct = countField(shots, (s) => s.productProminence);

  for (const [dist, n] of Object.entries(byDistance)) {
    if (n >= 4 && dist === 'MEDIUM') warnings.push(`SHOT_REPETITION_DRIFT: ${n} medium-distance shots`);
  }
  for (const [prom, n] of Object.entries(byProduct)) {
    if (n >= 4 && prom === 'HIGH') warnings.push(`SHOT_REPETITION_DRIFT: ${n} high product-prominence shots`);
  }

  const handCloseups = shots.filter((s) => s.role === 'HANDS' && s.cameraDistance === 'MACRO').length;
  if (handCloseups >= 3) warnings.push('SHOT_REPETITION_DRIFT: 4 identical hand closeups');

  return warnings;
}

function countField<T extends string>(shots: CampaignShotRole[], fn: (s: CampaignShotRole) => T): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of shots) {
    const k = fn(s);
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}
