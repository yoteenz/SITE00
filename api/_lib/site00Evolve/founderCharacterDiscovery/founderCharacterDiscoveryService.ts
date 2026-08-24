/**
 * P0.5E.4 — Founder Character Discovery Room service.
 */

import { buildCharacterSynthesisPreview } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/synthesisPreview.js';
import { evaluateExtendedHumanity } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import { applyVoiceLabJudgment } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/voiceLab.js';
import { evaluateNdxFounderCharacterCastingReadiness } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCastingReadinessBridge.js';
import { migrateFounderTraitPropositions } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderTraitPropositions.js';
import type {
  FounderDiscoveryJudgment,
  FounderRecognitionResponse,
  VisualHypothesisJudgment,
  VoiceLabChannel,
} from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/types.js';
import {
  applyFounderTraitJudgment,
  applyScenarioResponse,
  buildNdxFounderCharacterDiscoveryRun,
} from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxFounderDiscoveryRun.js';
import {
  migrateRunToCalibrationState,
  ndxApplyCalibrationReaction,
  ndxContinueCalibration,
  ndxGetHumanReadableSynthesis,
} from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/ndxCalibrationAdapter.js';
import type { FounderCalibrationReaction } from '../../../../shared/site00-studio-world-production/founderCharacterCalibration/types.js';
import type { FounderVoiceJudgment, FounderVoiceRecognitionResponse, PairwiseVoicePreference, UnseenLineRecognitionResponse } from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/types.js';
import {
  applyVoiceHypothesisJudgment,
  applyPairwiseVoicePreference,
} from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/voiceCalibrationEngine.js';
import {
  applyFounderVoiceRecognition,
  recordUnseenLineTest,
} from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/voiceContinuityQA.js';
import {
  ensureNdxVoiceCalibrationState,
  startNdxNeuralVoiceAudition,
  startNdxVoiceCalibrationRound,
} from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterVoice/ndxVoiceCalibrationAdapter.js';
import {
  applyHumanWomanTest,
  applyNeuralGenerationResults,
  estimateNeuralAudition,
} from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/neuralVoiceCalibrationEngine.js';
import type { HumanWomanTestResponse } from '../../../../shared/site00-studio-world-production/embodiedCharacterVoice/types.js';
import {
  generateNeuralVoiceClip,
  isNeuralProviderConfigured,
} from './neuralVoiceGenerationService.js';
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import * as store from './founderCharacterDiscoveryStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function refreshReadiness(run: NdxFounderCharacterDiscoveryRun): NdxFounderCharacterDiscoveryRun {
  const traitMigration = migrateFounderTraitPropositions({
    forensicReport: run.forensicReport,
    traitPropositionVersion: run.traitPropositionVersion,
  });
  let next: NdxFounderCharacterDiscoveryRun = traitMigration.migrated
    ? {
        ...run,
        forensicReport: traitMigration.forensicReport,
        traitPropositionVersion: traitMigration.traitPropositionVersion,
      }
    : run;
  const humanityEvaluation = evaluateExtendedHumanity({
    contradictions: next.contradictions,
    flawProfile: next.flawProfile,
    intelligenceMap: next.intelligenceMap,
    relationships: next.relationships,
    culturalBoundaries: next.culturalBoundaries,
    publicPrivate: next.publicPrivate,
    privateHumanityPresent: next.flawProfile.procrastinates.length > 0,
  });
  const castingReadiness = evaluateNdxFounderCharacterCastingReadiness({
    run: next,
    humanityEvaluation,
  });
  return { ...next, humanityEvaluation, castingReadiness, updatedAt: nowIso() };
}

function ensureCalibration(run: NdxFounderCharacterDiscoveryRun): NdxFounderCharacterDiscoveryRun {
  if (run.calibrationState?.interactions.length) return run;
  return {
    ...run,
    calibrationState: migrateRunToCalibrationState(run),
    calibrationVersion: run.calibrationVersion ?? 'FOUNDER_CHARACTER_CALIBRATION@P0.5E.4A',
  };
}

export async function continueFounderCharacterCalibration(params: {
  projectId: string;
}): Promise<{ run: NdxFounderCharacterDiscoveryRun; interaction: ReturnType<typeof ndxContinueCalibration>['interaction'] }> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureCalibration(existing);
  const { run, interaction } = ndxContinueCalibration(seeded);
  const refreshed = refreshReadiness(run);
  await store.saveFounderCharacterDiscoveryRun(refreshed);
  return { run: refreshed, interaction };
}

export async function saveFounderCharacterCalibrationReaction(params: {
  projectId: string;
  interactionId: string;
  reaction: FounderCalibrationReaction;
  revision?: string | null;
}): Promise<{ run: NdxFounderCharacterDiscoveryRun; nextInteraction: ReturnType<typeof ndxApplyCalibrationReaction>['nextInteraction'] }> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureCalibration(existing);
  const { run, nextInteraction } = ndxApplyCalibrationReaction(seeded, {
    interactionId: params.interactionId,
    reaction: params.reaction,
    revision: params.revision,
  });
  const refreshed = refreshReadiness(run);
  await store.saveFounderCharacterDiscoveryRun(refreshed);
  return { run: refreshed, nextInteraction };
}

export async function getFounderCharacterCalibrationSynthesis(params: {
  projectId: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const synthesis = ndxGetHumanReadableSynthesis(ensureCalibration(existing));
  const updated = refreshReadiness({
    ...existing,
    humanReadableSynthesis: synthesis,
    updatedAt: nowIso(),
  });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function getFounderCharacterDiscoveryState(params: {
  projectId: string;
}): Promise<NdxFounderCharacterDiscoveryRun | null> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) return null;
  const refreshed = refreshReadiness(existing);
  const readinessChanged =
    refreshed.castingReadiness.state !== existing.castingReadiness.state ||
    refreshed.castingReadiness.readyForCharacterSynthesis !== existing.castingReadiness.readyForCharacterSynthesis ||
    refreshed.castingReadiness.blockingGates.join('|') !== existing.castingReadiness.blockingGates.join('|') ||
    refreshed.traitPropositionVersion !== existing.traitPropositionVersion;
  if (readinessChanged) {
    return store.saveFounderCharacterDiscoveryRun(refreshed);
  }
  return refreshed;
}

export async function initializeFounderCharacterDiscoveryRoom(params: {
  projectId: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const run = buildNdxFounderCharacterDiscoveryRun();
  return store.saveFounderCharacterDiscoveryRun(run);
}

export async function saveFounderCharacterDiscoveryTraitJudgment(params: {
  projectId: string;
  traitId: string;
  judgment: FounderDiscoveryJudgment;
  revision?: string;
  note?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const updated = refreshReadiness(
    applyFounderTraitJudgment(existing, {
      traitId: params.traitId,
      judgment: params.judgment,
      revision: params.revision,
      note: params.note,
    }),
  );
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderCharacterDiscoveryScenarioResponse(params: {
  projectId: string;
  scenarioId: string;
  response: string;
  judgment: FounderDiscoveryJudgment;
  notes?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const updated = refreshReadiness(
    applyScenarioResponse(existing, {
      scenarioId: params.scenarioId,
      response: params.response,
      judgment: params.judgment,
      notes: params.notes,
    }),
  );
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderVisualHypothesisJudgment(params: {
  projectId: string;
  hypothesisId: string;
  judgment: VisualHypothesisJudgment;
  note?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const visualHypothesisReviews = existing.visualHypothesisReviews.map((v) =>
    v.hypothesisId === params.hypothesisId
      ? { ...v, judgment: params.judgment, note: params.note ?? null }
      : v,
  );
  const updated = refreshReadiness({ ...existing, visualHypothesisReviews, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderCharacterRecognition(params: {
  projectId: string;
  response: FounderRecognitionResponse;
  note?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const founderRecognition = {
    ...existing.founderRecognition,
    response: params.response,
    note: params.note ?? null,
    evaluatedAt: nowIso(),
    inferred: false as const,
  };
  const updated = refreshReadiness({ ...existing, founderRecognition, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderVoiceLabJudgment(params: {
  projectId: string;
  sampleId: string;
  channel: VoiceLabChannel;
  judgment: FounderDiscoveryJudgment;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const voiceLabSamples = existing.voiceLabSamples.map((s) =>
    s.sampleId === params.sampleId ? applyVoiceLabJudgment(s, params.channel, params.judgment) : s,
  );
  const updated = refreshReadiness({ ...existing, voiceLabSamples, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

function ensureVoiceCalibration(run: NdxFounderCharacterDiscoveryRun): NdxFounderCharacterDiscoveryRun {
  const neuralConfigured = isNeuralProviderConfigured();
  const voiceCalibrationState = ensureNdxVoiceCalibrationState(run, neuralConfigured);
  const languageLabEvidenceCount = voiceCalibrationState.languageEvidence.length;
  if (
    run.voiceCalibrationState === voiceCalibrationState &&
    run.languageLabEvidenceCount === languageLabEvidenceCount
  ) {
    return run;
  }
  return { ...run, voiceCalibrationState, languageLabEvidenceCount };
}

export async function getNeuralVoiceCastingEstimate(params: {
  projectId: string;
}): Promise<{ estimate: Record<string, unknown>; neuralProviderConfigured: boolean }> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const neuralProviderConfigured = isNeuralProviderConfigured();
  const seeded = ensureVoiceCalibration(existing);
  const estimate = estimateNeuralAudition(seeded.voiceCalibrationState!);
  return { estimate: estimate as unknown as Record<string, unknown>, neuralProviderConfigured };
}

export async function startFounderNeuralVoiceAudition(params: {
  projectId: string;
}): Promise<{ run: NdxFounderCharacterDiscoveryRun; round: Record<string, unknown> }> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const neuralProviderConfigured = isNeuralProviderConfigured();
  if (!neuralProviderConfigured) {
    throw new Error('NEURAL_VOICE_PROVIDER_NOT_CONFIGURED');
  }
  const seeded = ensureVoiceCalibration(existing);
  const { run, round, contracts } = startNdxNeuralVoiceAudition(seeded, true);
  const results: Array<{ hypothesisId: string; audioUrl: string; durationMs: number; costUsd: number }> = [];
  for (const contract of contracts) {
    const generated = await generateNeuralVoiceClip(contract);
    results.push({
      hypothesisId: contract.hypothesisId,
      audioUrl: generated.audioUrl,
      durationMs: generated.durationMs,
      costUsd: generated.actualCostUsd,
    });
  }
  const voiceCalibrationState = applyNeuralGenerationResults(run.voiceCalibrationState!, round.roundId, results);
  const refreshed = refreshReadiness({ ...run, voiceCalibrationState, updatedAt: nowIso() });
  await store.saveFounderCharacterDiscoveryRun(refreshed);
  return { run: refreshed, round: round as unknown as Record<string, unknown> };
}

export async function saveFounderHumanWomanTest(params: {
  projectId: string;
  hypothesisId: string;
  response: HumanWomanTestResponse;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureVoiceCalibration(existing);
  const voiceCalibrationState = applyHumanWomanTest(
    seeded.voiceCalibrationState!,
    params.hypothesisId,
    params.response,
  );
  const updated = refreshReadiness({ ...seeded, voiceCalibrationState, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function startFounderVoiceCalibrationRound(params: {
  projectId: string;
}): Promise<{ run: NdxFounderCharacterDiscoveryRun; round: Record<string, unknown> }> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureVoiceCalibration(existing);
  const { run, round } = startNdxVoiceCalibrationRound(seeded);
  const refreshed = refreshReadiness(run);
  await store.saveFounderCharacterDiscoveryRun(refreshed);
  return { run: refreshed, round: round as unknown as Record<string, unknown> };
}

export async function saveFounderVoiceHypothesisJudgment(params: {
  projectId: string;
  hypothesisId: string;
  judgment: FounderVoiceJudgment;
  note?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureVoiceCalibration(existing);
  const voiceCalibrationState = applyVoiceHypothesisJudgment(
    seeded.voiceCalibrationState!,
    params.hypothesisId,
    params.judgment,
    params.note,
  );
  const updated = refreshReadiness({ ...seeded, voiceCalibrationState, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderPairwiseVoicePreference(params: {
  projectId: string;
  hypothesisAId: string;
  hypothesisBId: string;
  preference: PairwiseVoicePreference;
  customNote?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureVoiceCalibration(existing);
  const voiceCalibrationState = applyPairwiseVoicePreference(
    seeded.voiceCalibrationState!,
    params.hypothesisAId,
    params.hypothesisBId,
    params.preference,
    params.customNote,
  );
  const updated = refreshReadiness({ ...seeded, voiceCalibrationState, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderVoiceRecognition(params: {
  projectId: string;
  response: FounderVoiceRecognitionResponse;
  note?: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureVoiceCalibration(existing);
  const voiceCalibrationState = applyFounderVoiceRecognition(
    seeded.voiceCalibrationState!,
    params.response,
    params.note,
  );
  const updated = refreshReadiness({ ...seeded, voiceCalibrationState, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function saveFounderUnseenLineVoiceTest(params: {
  projectId: string;
  hypothesisId: string;
  spokenCopy: string;
  response: UnseenLineRecognitionResponse;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const seeded = ensureVoiceCalibration(existing);
  const voiceCalibrationState = recordUnseenLineTest(
    seeded.voiceCalibrationState!,
    params.hypothesisId,
    params.spokenCopy,
    params.response,
  );
  const updated = refreshReadiness({ ...seeded, voiceCalibrationState, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export async function previewFounderCharacterSynthesis(params: {
  projectId: string;
}): Promise<NdxFounderCharacterDiscoveryRun> {
  const existing = await store.getFounderCharacterDiscoveryRun(params.projectId);
  if (!existing) throw new Error('Founder character discovery room not initialized');
  const synthesisPreview = buildCharacterSynthesisPreview(existing);
  const updated = refreshReadiness({ ...existing, synthesisPreview, updatedAt: nowIso() });
  return store.saveFounderCharacterDiscoveryRun(updated);
}

export {
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../embodiedCharacterDiscovery/embodiedCharacterDiscoveryService.js';
