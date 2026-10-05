/**
 * P0.NDX.NARRATIVE-MOMENTUM-ENGINE1 — compile + store (zero provider dispatch).
 */

import { compileEntry002RetroactiveNarrativeMomentum } from '../../../../shared/site00-expression-engine/narrative-momentum/entry002RetroactiveIngest.js';
import {
  narrativeMomentumStoryboardHandoff,
} from '../../../../shared/site00-expression-engine/narrative-momentum/compileNarrativeMomentumPlan.js';
import { listNarrativeGrammars } from '../../../../shared/site00-expression-engine/narrative-momentum/grammarLibrary.js';
import type { NarrativeMomentumPlan, NarrativeMomentumStatus } from '../../../../shared/site00-expression-engine/narrative-momentum/types.js';
import {
  applyNarrativeMomentumFounderStatus,
  getNarrativeMomentumPlan,
  listNarrativeMomentumHistory,
  saveNarrativeMomentumPlan,
} from './narrativeMomentumStore.js';

export async function bootstrapNarrativeMomentumEngine(input: {
  entryId: string;
  retroactive?: boolean;
}): Promise<{
  plan: NarrativeMomentumPlan;
  grammarLibraryCount: number;
  storyboardHandoff: ReturnType<typeof narrativeMomentumStoryboardHandoff>;
  providerDispatchCount: 0;
}> {
  const prior = listNarrativeMomentumHistory(input.entryId);
  const current = getNarrativeMomentumPlan(input.entryId);
  const priorAll = [...prior, ...(current ? [current] : [])];

  let plan: NarrativeMomentumPlan;
  if (input.entryId === 'entry-002' || input.retroactive) {
    plan = compileEntry002RetroactiveNarrativeMomentum(priorAll);
  } else {
    throw new Error(`NARRATIVE_MOMENTUM_ENTRY_NOT_CONFIGURED:${input.entryId}`);
  }

  saveNarrativeMomentumPlan({ ...plan, founderStatus: 'FOUNDER_REVIEW' });
  const saved = getNarrativeMomentumPlan(input.entryId)!;

  return {
    plan: saved,
    grammarLibraryCount: listNarrativeGrammars().length,
    storyboardHandoff: narrativeMomentumStoryboardHandoff(saved),
    providerDispatchCount: 0,
  };
}

export function readNarrativeMomentumEngine(entryId: string): {
  plan: NarrativeMomentumPlan | null;
  history: NarrativeMomentumPlan[];
  grammarLibraryCount: number;
  storyboardHandoff: ReturnType<typeof narrativeMomentumStoryboardHandoff> | null;
} {
  const plan = getNarrativeMomentumPlan(entryId);
  return {
    plan,
    history: listNarrativeMomentumHistory(entryId),
    grammarLibraryCount: listNarrativeGrammars().length,
    storyboardHandoff: plan ? narrativeMomentumStoryboardHandoff(plan) : null,
  };
}

export function founderJudgmentNarrativeMomentum(input: {
  entryId: string;
  action: 'APPROVE_NARRATIVE' | 'REFINE_NARRATIVE' | 'CHANGE_GRAMMAR' | 'LOVE_IT' | 'PROMISING' | 'TOO_CLOSE' | 'NOT_NDXBOOK';
}): NarrativeMomentumPlan | null {
  const statusMap: Record<string, NarrativeMomentumStatus> = {
    APPROVE_NARRATIVE: 'APPROVED',
    REFINE_NARRATIVE: 'NEEDS_REVISION',
    CHANGE_GRAMMAR: 'NEEDS_REVISION',
    LOVE_IT: 'APPROVED',
    PROMISING: 'FOUNDER_REVIEW',
    TOO_CLOSE: 'NEEDS_REVISION',
    NOT_NDXBOOK: 'NEEDS_REVISION',
  };
  return applyNarrativeMomentumFounderStatus({
    entryId: input.entryId,
    founderStatus: statusMap[input.action] ?? 'FOUNDER_REVIEW',
  });
}
