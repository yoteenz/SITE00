/**
 * C1.9R1 — Separate persistence for Meridian control vs FULL_REASONING runs.
 */

import type { MultiUnitBlindCampaignOutput } from './seniorCreativeJudgment/multiUnitCampaignArchitect.js';
import type { MeridianMaterialImprovementAssessment } from './meridianComparisonAssessment.js';

export type MeridianComparisonFounderJudgment =
  | 'FULL_REASONING_WINS'
  | 'DETERMINISTIC_WINS'
  | 'HYBRIDIZE'
  | 'NEITHER'
  | 'PUSH_FURTHER'
  | 'UNREVIEWED';

export type MeridianPersistedRun = {
  runId: string;
  label: 'CONTROL_A_DETERMINISTIC' | 'FULL_REASONING_B';
  campaign: MultiUnitBlindCampaignOutput;
  persistedAt: string;
  storeMode: 'MEMORY' | 'SUPABASE';
};

export type MeridianComparisonRecord = {
  comparisonId: string;
  briefId: string;
  controlRun: MeridianPersistedRun;
  fullReasoningRun: MeridianPersistedRun | null;
  fullReasoningBlocked: boolean;
  blockReason?: string;
  comparison: MeridianMaterialImprovementAssessment;
  founderJudgment: MeridianComparisonFounderJudgment;
  hybridSelections?: {
    campaignDirectionFrom?: 'CONTROL' | 'FULL';
    copyFrom?: 'CONTROL' | 'FULL';
    unitWinners?: Record<string, 'CONTROL' | 'FULL'>;
  };
  createdAt: string;
  updatedAt: string;
};

const comparisons = new Map<string, MeridianComparisonRecord>();
let latestComparisonId: string | null = null;
let preservedControlRun: MeridianPersistedRun | null = null;

export function resetMeridianLiveProofStore(): void {
  comparisons.clear();
  latestComparisonId = null;
  preservedControlRun = null;
}

export function getPreservedControlRun(): MeridianPersistedRun | null {
  return preservedControlRun;
}

export function persistMeridianRun(args: {
  label: MeridianPersistedRun['label'];
  campaign: MultiUnitBlindCampaignOutput;
  storeMode?: MeridianPersistedRun['storeMode'];
  preserveControl?: boolean;
}): MeridianPersistedRun {
  if (args.label === 'CONTROL_A_DETERMINISTIC' && args.preserveControl !== false && preservedControlRun) {
    return preservedControlRun;
  }

  const run: MeridianPersistedRun = {
    runId:
      args.label === 'CONTROL_A_DETERMINISTIC'
        ? `control_a_deterministic${args.preserveControl === false ? `-${Date.now()}` : ''}`
        : `${args.label.toLowerCase()}-${Date.now()}`,
    label: args.label,
    campaign: args.campaign,
    persistedAt: new Date().toISOString(),
    storeMode: args.storeMode ?? (process.env.VITEST === 'true' ? 'MEMORY' : 'MEMORY'),
  };

  if (args.label === 'CONTROL_A_DETERMINISTIC') {
    preservedControlRun = run;
  }

  return run;
}

export function persistMeridianComparison(record: Omit<MeridianComparisonRecord, 'comparisonId' | 'createdAt' | 'updatedAt'>): MeridianComparisonRecord {
  const comparisonId = `meridian-c19r1-${Date.now()}`;
  const full: MeridianComparisonRecord = {
    ...record,
    comparisonId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  comparisons.set(comparisonId, full);
  latestComparisonId = comparisonId;
  return full;
}

export function getLatestMeridianComparison(): MeridianComparisonRecord | null {
  if (!latestComparisonId) return null;
  return comparisons.get(latestComparisonId) ?? null;
}

export function recordMeridianFounderJudgment(args: {
  comparisonId?: string;
  judgment: MeridianComparisonFounderJudgment;
  hybridSelections?: MeridianComparisonRecord['hybridSelections'];
}): MeridianComparisonRecord | null {
  const id = args.comparisonId ?? latestComparisonId;
  if (!id) return null;
  const existing = comparisons.get(id);
  if (!existing) return null;
  const updated: MeridianComparisonRecord = {
    ...existing,
    founderJudgment: args.judgment,
    hybridSelections: args.hybridSelections ?? existing.hybridSelections,
    updatedAt: new Date().toISOString(),
  };
  comparisons.set(id, updated);
  return updated;
}
