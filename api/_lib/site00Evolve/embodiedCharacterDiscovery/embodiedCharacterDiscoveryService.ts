/**
 * P0.5E.3 — Embodied Character Discovery service.
 */

import { applyFounderInterviewAnswer } from '../../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/discoveryInterview.js';
import type { DiscoveryRound } from '../../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/types.js';
import type { FounderCharacterJudgment } from '../../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/types.js';
import { buildEmbodiedCharacterSynthesis } from '../../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/synthesis.js';
import { evaluateCastingReadiness } from '../../../../shared/site00-studio-world-production/embodiedCharacterDiscovery/castingReadiness.js';
import {
  buildNdxEmbodiedCharacterDiscoveryRun,
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/ndxEmbodiedCharacterAdapter.js';
import type { NdxEmbodiedCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/types.js';
import * as store from './embodiedCharacterDiscoveryStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

export async function getEmbodiedCharacterDiscoveryState(params: {
  projectId: string;
}): Promise<NdxEmbodiedCharacterDiscoveryRun | null> {
  return store.getEmbodiedCharacterDiscoveryRun(params.projectId);
}

export async function initializeEmbodiedCharacterDiscovery(params: {
  projectId: string;
}): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  const run = buildNdxEmbodiedCharacterDiscoveryRun(params.projectId);
  return store.saveEmbodiedCharacterDiscoveryRun(run);
}

export async function saveEmbodiedCharacterDiscoveryInterviewRound(params: {
  projectId: string;
  round: DiscoveryRound;
  answer: string;
  rawWording?: string;
}): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  const existing = await store.getEmbodiedCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Embodied character discovery not initialized');

  const interviewRounds = applyFounderInterviewAnswer(
    existing.interviewRounds,
    params.round,
    params.answer,
    params.rawWording,
  );

  const updated = {
    ...existing,
    interviewRounds,
    updatedAt: nowIso(),
  };
  return store.saveEmbodiedCharacterDiscoveryRun(updated);
}

export async function saveEmbodiedCharacterDiscoveryJudgment(params: {
  projectId: string;
  judgment: FounderCharacterJudgment;
  dimension: string;
  note: string;
}): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  const existing = await store.getEmbodiedCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Embodied character discovery not initialized');

  const updated = {
    ...existing,
    founderJudgments: [
      ...existing.founderJudgments,
      { judgment: params.judgment, dimension: params.dimension, note: params.note, at: nowIso() },
    ],
    updatedAt: nowIso(),
  };
  return store.saveEmbodiedCharacterDiscoveryRun(updated);
}

export async function synthesizeEmbodiedCharacterDiscovery(params: {
  projectId: string;
}): Promise<NdxEmbodiedCharacterDiscoveryRun> {
  const existing = await store.getEmbodiedCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Embodied character discovery not initialized');

  const completedRounds = existing.interviewRounds.filter((r) => r.founderAnswer);
  const essence =
    completedRounds.length > 0
      ? `A psychologically coherent woman shaped by ${completedRounds.length} discovery rounds — ${existing.psychology.whatSheNotices.slice(0, 2).join('; ')}`
      : `Seed character: ${existing.intelligence.behavioralExpression.slice(0, 200)}`;

  const synthesis = buildEmbodiedCharacterSynthesis({
    characterEssence: essence,
    psychologicalLogic: existing.contradictions.majorContradictions.join(' · '),
    knownUnknowns: ['Final face undetermined', 'Exact age range TBD', 'Specific city context TBD'],
    visualImplications: existing.styleHypothesis.confirmedVsHypothetical.hypothetical.slice(0, 5),
    founderTriggered: true,
  });

  const castingReadiness = evaluateCastingReadiness({
    psychologyComplete: existing.psychology.whatSheNotices.length > 0,
    contradictionsComplete: existing.contradictions.majorContradictions.length >= 3,
    voiceComplete: existing.voice.innerVoice !== 'TBD — discovery',
    bookRelationshipComplete: existing.bookRelationship.whySheKeepsIt.length > 0,
    behaviorComplete: existing.physicalBehavior.researchBehaviors.length > 0,
    cameraComplete: existing.cameraRelationship.modes.length > 0,
    styleImplicationsPresent: existing.styleHypothesis.hairRange.length > 0,
    humanity: existing.humanityEvaluation,
    founderReviewRequired: completedRounds.length < 6,
  });

  const updated = {
    ...existing,
    synthesis,
    castingReadiness,
    anthropicRequests: existing.anthropicRequests + (process.env.ANTHROPIC_API_KEY ? 0 : 0),
    updatedAt: nowIso(),
  };
  return store.saveEmbodiedCharacterDiscoveryRun(updated);
}

export {
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
};
