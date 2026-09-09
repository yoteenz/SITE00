/**
 * P0.VR.6R2 — Preset fidelity contract inheritance (exact presets never downgrade).
 */

import { SYSTEM_FIDELITY_PRESET_IDS } from '../p0vr7/constants.js';
import type { AuthorityMode, FidelityMode } from '../p0vr7/types.js';

export const EXACT_FIDELITY_PRESET_IDS = [
  SYSTEM_FIDELITY_PRESET_IDS.REPLICATE_PAGE_EXACTLY,
  SYSTEM_FIDELITY_PRESET_IDS.REPLICATE_MOBILE_EXACTLY,
  SYSTEM_FIDELITY_PRESET_IDS.REPLICATE_DESKTOP_EXACTLY,
  SYSTEM_FIDELITY_PRESET_IDS.EXTRACT_REPLACE_ASSETS_EXACTLY,
] as const;

export type PresetFidelityContract = {
  referenceAuthority: AuthorityMode;
  fidelityMode: FidelityMode;
  visualConvergence: 'REQUIRED' | 'OPTIONAL';
  overlayQa: 'REQUIRED' | 'OPTIONAL';
  regionDeltaAnalysis: 'REQUIRED' | 'OPTIONAL';
  correctionLoop: 'REQUIRED' | 'OPTIONAL';
};

export function resolvePresetFidelityContract(presetId: string): PresetFidelityContract {
  const isExact = EXACT_FIDELITY_PRESET_IDS.includes(presetId as (typeof EXACT_FIDELITY_PRESET_IDS)[number]);
  if (isExact) {
    return {
      referenceAuthority: 'DESIGN_AUTHORITY',
      fidelityMode: 'EXACT',
      visualConvergence: 'REQUIRED',
      overlayQa: 'REQUIRED',
      regionDeltaAnalysis: 'REQUIRED',
      correctionLoop: 'REQUIRED',
    };
  }
  return {
    referenceAuthority: 'DESIGN_AUTHORITY',
    fidelityMode: 'EXACT',
    visualConvergence: 'REQUIRED',
    overlayQa: 'REQUIRED',
    regionDeltaAnalysis: 'REQUIRED',
    correctionLoop: 'REQUIRED',
  };
}

export function learnedPresetInheritsGlobalFidelity(
  parentPresetId: string | null,
  learnedFidelityMode?: FidelityMode,
): FidelityMode {
  if (parentPresetId && EXACT_FIDELITY_PRESET_IDS.includes(parentPresetId as (typeof EXACT_FIDELITY_PRESET_IDS)[number])) {
    return 'EXACT';
  }
  if (learnedFidelityMode === 'INTERPRETIVE' && parentPresetId) {
    const parent = resolvePresetFidelityContract(parentPresetId);
    if (parent.fidelityMode === 'EXACT') return 'EXACT';
  }
  return learnedFidelityMode ?? 'EXACT';
}

export function presetCannotDowngradeExact(
  baseMode: FidelityMode,
  requestedMode: FidelityMode,
): FidelityMode {
  if (baseMode === 'EXACT' && requestedMode === 'INTERPRETIVE') return 'EXACT';
  return requestedMode;
}
