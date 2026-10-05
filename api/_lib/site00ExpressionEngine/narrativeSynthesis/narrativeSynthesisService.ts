/**
 * C1.0 — Narrative Synthesis bootstrap orchestrator.
 */

import { seedChapter01Canon } from '../chapterStore.js';
import { buildEntry002ReelTreatmentAuthority } from '../entry002ReelTreatment.js';
import { evaluateEntry002GoldenFixture } from './entry002GoldenFixture.js';
import {
  buildCreativeThinkingHandoffForEntry002,
  buildEntry002NarrativeSynthesisInput,
} from './entry002NarrativeSynthesisInput.js';
import { seedEntry002NarrativeCorrections } from './narrativeCreativeCorrectionStore.js';
import { listGeneralizableNarrativeRules } from './narrativeCorrectionRules.js';
import { assertNoProviderDispatchDuringSynthesis, runNarrativeSelfRevisionLoop } from './narrativeSelfRevision.js';
import {
  buildTreatmentHandoffContract,
  assertTreatmentRespectsNarrativeAuthority,
} from './narrativeTreatmentHandoff.js';
import {
  applyNarrativeSynthesisFounderJudgment,
  getNarrativeSynthesis,
  listNarrativeSynthesisHistory,
  saveNarrativeSynthesis,
} from './narrativeSynthesisStore.js';

export async function bootstrapC1NarrativeSynthesis(options?: {
  entryId?: string;
  approveForTest?: boolean;
}) {
  process.env.EXPRESSION_ENGINE_MEMORY_STORE = process.env.EXPRESSION_ENGINE_MEMORY_STORE ?? '1';
  seedChapter01Canon();
  seedEntry002NarrativeCorrections();

  const entryId = options?.entryId ?? 'entry-002';
  const input = buildEntry002NarrativeSynthesisInput();
  const creativeThinkingHandoff = buildCreativeThinkingHandoffForEntry002();

  const { synthesis, revisionPasses } = runNarrativeSelfRevisionLoop(input);
  assertNoProviderDispatchDuringSynthesis(synthesis);

  const prior = getNarrativeSynthesis(entryId);
  const merged =
    prior && prior.founderJudgment !== 'UNREVIEWED'
      ? {
          ...synthesis,
          founderJudgment: prior.founderJudgment,
          narrativeAuthority: prior.narrativeAuthority,
          canon: prior.canon,
          approvedAt: prior.approvedAt,
          status: prior.status,
        }
      : synthesis;

  saveNarrativeSynthesis(merged);

  if (options?.approveForTest) {
    applyNarrativeSynthesisFounderJudgment({ entryId, founderJudgment: 'LOVE_IT' });
  }

  const stored = getNarrativeSynthesis(entryId)!;
  const golden = evaluateEntry002GoldenFixture(stored);
  const treatment = buildEntry002ReelTreatmentAuthority();
  const treatmentContract = buildTreatmentHandoffContract(stored);
  const treatmentAlignment = assertTreatmentRespectsNarrativeAuthority({
    synthesis: options?.approveForTest ? stored : null,
    treatmentCoreStory: treatment.coreStory,
  });

  return {
    sprint: 'C1.0_NARRATIVE_SYNTHESIS_ENGINE',
    architectureLayer: 'CREATIVE_THINKING → NARRATIVE_SYNTHESIS → DIRECTORIAL_TREATMENT',
    providerDispatchCount: 0 as const,
    creativeThinkingHandoff,
    narrativeSynthesis: stored,
    narrativeSynthesisHistory: listNarrativeSynthesisHistory(entryId),
    selfRevisionPasses: revisionPasses,
    goldenFixture: golden,
    generalizableRules: listGeneralizableNarrativeRules(),
    treatmentHandoff: treatmentContract,
    treatmentAlignmentWhenApproved: treatmentAlignment,
    productionOrderNote:
      'Narrative Synthesis is intellectual-only — no storyboard/image/video dispatch in this layer.',
    nextAction:
      stored.status === 'AWAITING_FOUNDER_REVIEW'
        ? 'FOUNDER REVIEW NARRATIVE SYNTHESIS — LOVE IT / PUSH FURTHER / REVISE'
        : stored.status === 'NEEDS_FOUNDER_DIRECTION'
          ? `NARRATIVE WEAKNESS: ${stored.qaStatus.failureClassifications.join(', ')}`
          : 'NARRATIVE AUTHORITY APPROVED — treatment must consume spine',
  };
}

export {
  applyNarrativeSynthesisFounderJudgment,
  getNarrativeSynthesis,
  resetNarrativeSynthesisStore,
} from './narrativeSynthesisStore.js';

export { recordNarrativeCreativeCorrection, listNarrativeCreativeCorrections } from './narrativeCreativeCorrectionStore.js';
