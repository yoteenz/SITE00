/**
 * P0.VR.DIAG.1 — Founder overrides on measured spec items.
 */

import type { FounderForensicOverride, MeasuredReconstructionSpec } from './types.js';

const overrides = new Map<string, FounderForensicOverride[]>();

export function recordFounderOverride(input: {
  specId: string;
  evidenceId: string;
  who: string;
  action: FounderForensicOverride['action'];
  reason: string;
}): FounderForensicOverride {
  const entry: FounderForensicOverride = {
    evidenceId: input.evidenceId,
    who: input.who,
    when: new Date().toISOString(),
    action: input.action,
    reason: input.reason,
  };
  const list = overrides.get(input.specId) ?? [];
  list.push(entry);
  overrides.set(input.specId, list);
  return entry;
}

export function applyOverrideToSpec(
  spec: MeasuredReconstructionSpec,
  override: FounderForensicOverride,
): MeasuredReconstructionSpec {
  if (override.action !== 'KEEP_CURRENT' && override.action !== 'EXCLUDE') return spec;
  return {
    ...spec,
    regionSpecs: spec.regionSpecs.map((region) =>
      region.evidenceId === override.evidenceId
        ? { ...region, status: 'FOUNDER_OVERRIDE_KEEP_CURRENT' }
        : region,
    ),
  };
}

export function listFounderOverrides(specId: string): FounderForensicOverride[] {
  return overrides.get(specId) ?? [];
}

export function resetFounderOverridesForTest(): void {
  overrides.clear();
}
