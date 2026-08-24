/**
 * P0.5E.5 — Character Continuity Pipeline service.
 */

import { assertProductionGenerationAllowed } from '../../../../shared/site00-studio-world-production/characterContinuityPipeline/preCastingMode.js';
import type { BibleSourceType } from '../../../../shared/site00-studio-world-production/characterContinuityPipeline/types.js';
import {
  buildNdxCharacterContinuityPipelineRun,
  compileNdxPipelinePreview,
  ingestNdxCharacterBibleFromSource,
  ingestNdxDiscoverySynthesisPreview,
  runNdxMockFixturePipelineTest,
} from '../../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/ndxCharacterContinuityRun.js';
import type { NdxCharacterContinuityPipelineRun } from '../../../../shared/site00-brand-lore/ndxCharacterContinuityPipeline/types.js';
import * as store from './characterContinuityStoreAdapter.js';

function nowIso(): string {
  return new Date().toISOString();
}

export async function getCharacterContinuityState(params: {
  projectId: string;
}): Promise<NdxCharacterContinuityPipelineRun | null> {
  return store.getCharacterContinuityRun(params.projectId);
}

export async function initializeCharacterContinuityPipeline(params: {
  projectId: string;
}): Promise<NdxCharacterContinuityPipelineRun> {
  const run = buildNdxCharacterContinuityPipelineRun(params.projectId);
  return store.saveCharacterContinuityRun(run);
}

export async function ingestCharacterBibleSource(params: {
  projectId: string;
  rawSource: string;
  sourceType: BibleSourceType;
  normalized?: Record<string, unknown>;
}): Promise<NdxCharacterContinuityPipelineRun> {
  const existing = await store.getCharacterContinuityRun(params.projectId);
  if (!existing) throw new Error('Character continuity pipeline not initialized');
  const updated = ingestNdxCharacterBibleFromSource(existing, {
    rawSource: params.rawSource,
    sourceType: params.sourceType,
    normalized: (params.normalized ?? {}) as Parameters<typeof ingestNdxCharacterBibleFromSource>[1]['normalized'],
  });
  return store.saveCharacterContinuityRun(updated);
}

export async function ingestCharacterDiscoverySynthesis(params: {
  projectId: string;
  whoSheIs: string;
  bookMeaning: string;
  whatMakesHerAnnoying: string;
}): Promise<NdxCharacterContinuityPipelineRun> {
  const existing = await store.getCharacterContinuityRun(params.projectId);
  if (!existing) throw new Error('Character continuity pipeline not initialized');
  const updated = ingestNdxDiscoverySynthesisPreview(existing, params);
  return store.saveCharacterContinuityRun(updated);
}

export async function previewCharacterGenerationContract(params: {
  projectId: string;
}): Promise<NdxCharacterContinuityPipelineRun> {
  const existing = await store.getCharacterContinuityRun(params.projectId);
  if (!existing) throw new Error('Character continuity pipeline not initialized');
  const gate = assertProductionGenerationAllowed(existing);
  if (gate.allowed) {
    throw new Error('Production generation must remain blocked in pre-casting mode');
  }
  const updated = compileNdxPipelinePreview({ ...existing, updatedAt: nowIso() });
  return store.saveCharacterContinuityRun(updated);
}

export async function runMockFixturePipelineTest(params: {
  projectId: string;
}): Promise<NdxCharacterContinuityPipelineRun> {
  const existing = await store.getCharacterContinuityRun(params.projectId);
  if (!existing) throw new Error('Character continuity pipeline not initialized');
  const updated = runNdxMockFixturePipelineTest(existing);
  return store.saveCharacterContinuityRun(updated);
}

export {
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../../../../shared/site00-studio-world-production/characterContinuityPipeline/pipelineRun.js';
