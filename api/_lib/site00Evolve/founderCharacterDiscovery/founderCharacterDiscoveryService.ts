/**
 * P0.5E.4 — Founder Character Discovery Room service.
 */

import { buildCharacterSynthesisPreview } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/synthesisPreview.js';
import { evaluateCharacterCastingReadiness } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/castingReadiness.js';
import { evaluateExtendedHumanity } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/humanityEvaluation.js';
import { applyVoiceLabJudgment } from '../../../../shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/voiceLab.js';
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
import type { NdxFounderCharacterDiscoveryRun } from '../../../../shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/types.js';
import * as store from './founderCharacterDiscoveryStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

function refreshReadiness(run: NdxFounderCharacterDiscoveryRun): NdxFounderCharacterDiscoveryRun {
  const visualReviewed = run.visualHypothesisReviews.some((v) => v.judgment !== null);
  const voiceEstablished = run.voiceLabSamples.some((s) => Object.keys(s.judgments).length > 0);
  const humanityEvaluation = evaluateExtendedHumanity({
    contradictions: run.contradictions,
    flawProfile: run.flawProfile,
    intelligenceMap: run.intelligenceMap,
    relationships: run.relationships,
    culturalBoundaries: run.culturalBoundaries,
    publicPrivate: run.publicPrivate,
    privateHumanityPresent: run.flawProfile.procrastinates.length > 0,
  });
  const castingReadiness = evaluateCharacterCastingReadiness({
    forensicReport: run.forensicReport,
    contradictions: run.contradictions,
    flawProfile: run.flawProfile,
    intelligenceMap: run.intelligenceMap,
    privateHumanityEstablished: run.flawProfile.procrastinates.length > 0,
    voiceDifferentiationEstablished: voiceEstablished,
    bookRelationshipEstablished: Boolean(run.bookDiscovery.whySheWritesThingsDown),
    culturalBoundaryEstablished: run.culturalBoundaries.length > 0,
    visualHypothesesReviewed: visualReviewed,
    humanityEvaluation,
    founderRecognition: run.founderRecognition,
  });
  return { ...run, humanityEvaluation, castingReadiness, updatedAt: nowIso() };
}

export async function getFounderCharacterDiscoveryState(params: {
  projectId: string;
}): Promise<NdxFounderCharacterDiscoveryRun | null> {
  return store.getFounderCharacterDiscoveryRun(params.projectId);
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
