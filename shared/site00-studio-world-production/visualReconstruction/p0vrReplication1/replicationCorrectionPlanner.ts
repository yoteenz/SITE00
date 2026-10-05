/**
 * P0.VR.REPLICATION.1 — Ordered corrections from highest-impact drift.
 */

import type { VisualPageBlueprint } from './types.js';
import type { VisualReplicationDiff } from './types.js';

export function planReplicationCorrections(input: {
  diff: VisualReplicationDiff;
  blueprint: VisualPageBlueprint;
}): string[] {
  const plan: string[] = [];
  const issues = input.diff.highestImpactIssues;

  if (issues.includes('COMPOSITION_MISMATCH')) {
    plan.push('REORDER_MAJOR_REGIONS_TO_AUTHORITY');
    plan.push('RESTORE_HERO_MEDIA_SLOT');
  }
  if (issues.includes('GEOMETRY_DRIFT')) {
    plan.push('ADJUST_PARENT_REGION_GEOMETRY');
  }
  if (issues.includes('ASSET_PLACEMENT')) {
    plan.push('REBIND_ASSET_SLOTS');
  }
  if (plan.length === 0 && input.diff.compositionScore != null && input.diff.compositionScore < 95) {
    plan.push('TUNE_COMPOSITION_WEIGHT');
  }
  if (plan.length === 0) {
    plan.push('MICRO_SPACING_PASS');
  }
  return plan;
}
