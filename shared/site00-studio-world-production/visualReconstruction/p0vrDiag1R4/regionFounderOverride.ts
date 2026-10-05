/**
 * P0.VR.DIAG.1R4 — Minimal founder region override controls.
 */

import type { FounderRegionOverride, FounderRegionOverrideAction } from './types.js';

const overridesByReport = new Map<string, FounderRegionOverride[]>();

export function recordFounderRegionOverride(input: {
  reportId: string;
  regionId: string;
  action: FounderRegionOverrideAction;
  who: string;
  reason: string;
}): FounderRegionOverride {
  const entry: FounderRegionOverride = {
    regionId: input.regionId,
    action: input.action,
    who: input.who,
    when: new Date().toISOString(),
    reason: input.reason,
  };
  const list = overridesByReport.get(input.reportId) ?? [];
  list.push(entry);
  overridesByReport.set(input.reportId, list);
  return entry;
}

export function listFounderRegionOverrides(reportId: string): FounderRegionOverride[] {
  return overridesByReport.get(reportId) ?? [];
}

export function isRegionExcludedByFounder(regionId: string, reportId?: string): boolean {
  if (!reportId) {
    for (const list of overridesByReport.values()) {
      if (list.some((o) => o.regionId === regionId && o.action === 'EXCLUDE_FROM_RECONSTRUCTION')) return true;
    }
    return false;
  }
  return listFounderRegionOverrides(reportId).some(
    (o) => o.regionId === regionId && o.action === 'EXCLUDE_FROM_RECONSTRUCTION',
  );
}

export function resetFounderRegionOverridesForTest(): void {
  overridesByReport.clear();
}
