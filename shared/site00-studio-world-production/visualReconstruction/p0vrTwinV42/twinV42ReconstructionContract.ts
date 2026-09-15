import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { TWIN_V42_CRITICAL_REGION_IDS } from './constants.js';
import {
  PRIOR_LIVE_REJECTION_REASON,
  PRIOR_LIVE_STATUS,
  TWIN_V42_RECONSTRUCTION_CONTRACT_KEY,
} from './constants.js';

export type TwinV42RegionId = (typeof TWIN_V42_CRITICAL_REGION_IDS)[number];

export type TwinV42LayoutTokens = {
  headerTitlePx: number;
  headerRulePx: number;
  specTableFontPx: number;
  specTableRowPx: number;
  specTableColGapPx: number;
  leftPanelInsetPx: number;
  paletteSwatchPx: number;
  paletteGapPx: number;
  notesLinePx: number;
  dividerWeightPx: number;
  blueprintBandPx: number;
};

export type TwinV42ReconstructionContract = {
  layoutVersion: 'V42R1_FORENSIC';
  priorLiveStatus: typeof PRIOR_LIVE_STATUS;
  priorLiveRejectionReason: typeof PRIOR_LIVE_REJECTION_REASON;
  correctionGeneration: number;
  regionSteps: Record<TwinV42RegionId, number>;
  tokens: TwinV42LayoutTokens;
  filesChanged: string[];
  selectorsChanged: string[];
  componentsChanged: string[];
};

const memoryContract: { value: TwinV42ReconstructionContract | null } = { value: null };

export function defaultTwinV42LayoutTokens(): TwinV42LayoutTokens {
  return {
    headerTitlePx: 14,
    headerRulePx: 2,
    specTableFontPx: 9,
    specTableRowPx: 14,
    specTableColGapPx: 8,
    leftPanelInsetPx: 12,
    paletteSwatchPx: 18,
    paletteGapPx: 6,
    notesLinePx: 11,
    dividerWeightPx: 1,
    blueprintBandPx: 72,
  };
}

export function createInitialTwinV42ReconstructionContract(): TwinV42ReconstructionContract {
  return {
    layoutVersion: 'V42R1_FORENSIC',
    priorLiveStatus: PRIOR_LIVE_STATUS,
    priorLiveRejectionReason: PRIOR_LIVE_REJECTION_REASON,
    correctionGeneration: 0,
    regionSteps: {
      TITLE_HEADER: 0,
      LEFT_MAIN_BLUEPRINT: 0,
      RIGHT_SPEC_TABLE: 0,
      LOWER_COLOR_PALETTE: 0,
      LOWER_TYPOGRAPHY_KEY: 0,
      LOWER_DIVIDER_SPECS: 0,
      LOWER_NOTES_CONTEXT: 0,
    },
    tokens: defaultTwinV42LayoutTokens(),
    filesChanged: ['TwinV42ForensicLiveCanvas.tsx', 'twinV42ReconstructionContract.ts'],
    selectorsChanged: ['.site00-twin-v42-forensic'],
    componentsChanged: ['TwinV42ForensicLiveCanvas'],
  };
}

export function hashTwinV42Implementation(contract: TwinV42ReconstructionContract): string {
  return fnv1aHex(JSON.stringify(contract));
}

export function readTwinV42ReconstructionContract(): TwinV42ReconstructionContract {
  if (memoryContract.value) return memoryContract.value;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(TWIN_V42_RECONSTRUCTION_CONTRACT_KEY);
      if (raw) {
        memoryContract.value = JSON.parse(raw) as TwinV42ReconstructionContract;
        return memoryContract.value;
      }
    } catch {
      /* reset */
    }
  }
  const initial = createInitialTwinV42ReconstructionContract();
  writeTwinV42ReconstructionContract(initial);
  return initial;
}

export function writeTwinV42ReconstructionContract(contract: TwinV42ReconstructionContract): void {
  memoryContract.value = contract;
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TWIN_V42_RECONSTRUCTION_CONTRACT_KEY, JSON.stringify(contract));
}

export function applyCorrectionGenerationToContract(generation: number): TwinV42ReconstructionContract {
  const base = readTwinV42ReconstructionContract();
  if (base.correctionGeneration === generation) return base;
  const next = { ...base, correctionGeneration: generation };
  writeTwinV42ReconstructionContract(next);
  return next;
}

export function clearTwinV42ReconstructionContractForTests(): void {
  memoryContract.value = null;
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(TWIN_V42_RECONSTRUCTION_CONTRACT_KEY);
}
