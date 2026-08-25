/**
 * P0.5E.5 — Character Continuity Pipeline service.
 */

import { assertProductionGenerationAllowed } from '../../../../shared/site00-studio-world-production/characterContinuityPipeline/preCastingMode.js';
import { ingestCharacterBible } from '../../../../shared/site00-studio-world-production/characterContinuityPipeline/bibleIngestion.js';
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

const CASTING_ROLE_TO_REFERENCE_TYPE: Record<
  string,
  import('../../../../shared/site00-studio-world-production/characterContinuityPipeline/types.js').ReferenceType
> = {
  FACE: 'MASTER_HEADSHOT_FRONT',
  HAIR: 'APPROVED_HAIR_VARIANT',
  WARDROBE: 'MASTER_FULL_BODY',
  PRESENCE: 'NEUTRAL_EXPRESSION',
  FULL_LOOK: 'MASTER_FULL_BODY',
  MOOD: 'SERIOUS',
};

export async function ingestFounderCastingReferenceToContinuity(params: {
  projectId: string;
  reference: import('../../../../shared/site00-studio-world-production/characterVisualCasting/types.js').FounderCastingReference;
}): Promise<{ run: NdxCharacterContinuityPipelineRun; receiptId: string }> {
  let existing = await store.getCharacterContinuityRun(params.projectId);
  if (!existing) {
    existing = await initializeCharacterContinuityPipeline({ projectId: params.projectId });
  }

  const { buildReferenceEntry, evaluateReferencePackReadiness } = await import(
    '../../../../shared/site00-studio-world-production/characterContinuityPipeline/referencePack.js'
  );
  const { compileCharacterContinuityBible } = await import(
    '../../../../shared/site00-studio-world-production/characterContinuityPipeline/continuityBible.js'
  );
  const { auditCharacterBible } = await import(
    '../../../../shared/site00-studio-world-production/characterContinuityPipeline/bibleAudit.js'
  );
  const { buildEmptyEmbodiedCharacterBible } = await import(
    '../../../../shared/site00-studio-world-production/characterContinuityPipeline/embodiedCharacterBible.js'
  );

  const bible =
    existing.bible ??
    buildEmptyEmbodiedCharacterBible({
      projectId: params.projectId,
      brandId: 'ndxbook',
      characterId: 'ndx-embodied-character',
    });

  const refEntry = buildReferenceEntry({
    characterId: bible.characterId,
    referenceType: CASTING_ROLE_TO_REFERENCE_TYPE[params.reference.role] ?? 'MASTER_HEADSHOT_FRONT',
    identityStrength: params.reference.role === 'FACE' ? 'IDENTITY_HIGH' : 'IDENTITY_MEDIUM',
  });
  refEntry.assetId = params.reference.storagePath;
  refEntry.approvalState = 'APPROVED';
  refEntry.source = 'FOUNDER_CASTING_UPLOAD';
  refEntry.fingerprint = params.reference.referenceId;

  const referencePack = evaluateReferencePackReadiness({
    ...existing.referencePack,
    references: [...existing.referencePack.references, refEntry],
  });

  const rawSource = JSON.stringify({
    referenceId: params.reference.referenceId,
    role: params.reference.role,
    previewUrl: params.reference.previewUrl,
    storagePath: params.reference.storagePath,
    signals: params.reference.decomposedSignals,
  });

  const { bible: ingested, receipt } = ingestCharacterBible({
    bible,
    rawSource,
    sourceType: 'FOUNDER_AMENDMENT',
    normalized: {
      visualIdentity: {
        founderCastingReferences: [
          {
            referenceId: params.reference.referenceId,
            role: params.reference.role,
            previewUrl: params.reference.previewUrl,
            signals: params.reference.decomposedSignals,
          },
        ],
      },
      faceLogic:
        params.reference.role === 'FACE' || params.reference.role === 'FULL_LOOK'
          ? { founderReferenceSignals: params.reference.decomposedSignals }
          : bible.faceLogic,
      hairLogic:
        params.reference.role === 'HAIR' || params.reference.role === 'FULL_LOOK'
          ? { founderReferenceSignals: params.reference.decomposedSignals }
          : bible.hairLogic,
      wardrobeLogic:
        params.reference.role === 'WARDROBE' || params.reference.role === 'FULL_LOOK'
          ? { founderReferenceSignals: params.reference.decomposedSignals }
          : bible.wardrobeLogic,
    },
  });

  const continuityBible = compileCharacterContinuityBible(ingested);
  const bibleAudit = auditCharacterBible({ bible: ingested, referencePack, preCastingMode: true });

  const updated: NdxCharacterContinuityPipelineRun = {
    ...existing,
    bible: ingested,
    continuityBible,
    referencePack,
    bibleAudit,
    ingestionReceipts: [...existing.ingestionReceipts, receipt],
    updatedAt: new Date().toISOString(),
  };

  const saved = await store.saveCharacterContinuityRun(updated);
  return { run: saved, receiptId: receipt.receiptId };
}

export {
  brandCharacterImmutable,
  brandCanonUnchanged,
  productExpressionBlocked,
  worldFormationBlocked,
} from '../../../../shared/site00-studio-world-production/characterContinuityPipeline/pipelineRun.js';
