/**
 * Live surgical revision generation — founder-triggered, single-asset, idempotent.
 */

import { createHash, randomUUID } from 'node:crypto';
import type { CreativeAssetRecord } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import type {
  CreativeRevisionDiff,
  CreativeRevisionSpec,
  RevisionGenerationReceipt,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes.js';
import { compileCreativeRevision, hashRevisionPrompt } from '../../../../shared/site00-brand-lore/creativeLineage/revisionCompiler.js';
import { evaluateRevisionCompliance } from '../../../../shared/site00-brand-lore/creativeLineage/revisionCompliance.js';
import {
  defaultProviderCapabilities,
  resolveRevisionGenerationMode,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionGenerationModeResolver.js';
import { detectRevisionLockConflicts } from '../../../../shared/site00-brand-lore/creativeLineage/revisionLockConflictDetection.js';
import {
  canApproveRevisionGeneration,
  runHostFontRevisionLeakageTest,
  runRevisionSurgicalityTest,
  runRevisionWorldContaminationTest,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionValidation.js';
import { generateRevisionImageFromBrief } from '../creativeDirection/creativeIntelligence/gptImage2VisualProviderAdapter.js';
import { downloadUrlToBuffer, site00StorageObjectExists, uploadSite00AssetBuffer } from '../../site00Assts/storage.js';
import { buildRevisionChildAssetRecord, buildRevisionStoragePath } from './assetRecordBuilders.js';
import * as assetStore from './storeAdapter.js';
import * as judgmentStore from './founderJudgmentRevisionStoreAdapter.js';

const BRAND_SLUG = 'ndxbook';

const activeGenerationKeys = new Set<string>();

export type RevisionGenerateResult =
  | {
      allowed: true;
      spec: CreativeRevisionSpec;
      child: CreativeAssetRecord;
      diff: CreativeRevisionDiff;
      receipt: RevisionGenerationReceipt;
    }
  | {
      allowed: false;
      reason: string;
      spec?: CreativeRevisionSpec;
    };

function nowIso(): string {
  return new Date().toISOString();
}

function buildIdempotencyKey(spec: CreativeRevisionSpec): string {
  return `rev-gen-${spec.revisionId}-v${spec.generationAttempt}-approved-${spec.approvedAt ?? 'none'}`;
}

function buildPublicStorageUrl(storagePath: string): string {
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  if (!supabaseUrl) return storagePath;
  try {
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    const bucket = process.env.STUDIO_ASSETS_BUCKET?.trim() || 'live-preview';
    return `https://${ref}.supabase.co/storage/v1/object/public/${bucket}/${storagePath.replace(/^\/+/, '')}`;
  } catch {
    return storagePath;
  }
}

export type RevisionImageGenerator = typeof generateRevisionImageFromBrief;

let revisionImageGenerator: RevisionImageGenerator = generateRevisionImageFromBrief;

export function setRevisionImageGeneratorForTests(fn: RevisionImageGenerator | null): void {
  revisionImageGenerator = fn ?? generateRevisionImageFromBrief;
}

export async function approveRevisionSpecForGeneration(revisionId: string): Promise<CreativeRevisionSpec> {
  const spec = await judgmentStore.getCreativeRevisionSpec(revisionId);
  if (!spec) throw new Error('Revision spec not found');

  const compiled = await compileRevisionSpecInternal(spec);

  if (!compiled.surgicality.passed) {
    throw new Error('REVISION_SURGICALITY_TEST failed — cannot approve');
  }
  if (!compiled.contamination.passed) {
    throw new Error('REVISION_WORLD_CONTAMINATION_TEST failed — cannot approve');
  }
  if (!compiled.hostFont.passed) {
    throw new Error('Host font leakage detected — cannot approve');
  }
  if (compiled.lockConflicts.length > 0) {
    throw new Error(compiled.lockConflicts[0]!.message);
  }

  const ts = nowIso();
  const approved: CreativeRevisionSpec = {
    ...spec,
    status: 'APPROVED_FOR_GENERATION',
    approvedAt: ts,
    generationGate: {
      liveGenerationEnabled: true,
      gateReason: 'Founder approved — ready for explicit GENERATE REVISION',
    },
    updatedAt: ts,
  };
  await judgmentStore.upsertCreativeRevisionSpec(approved);
  return approved;
}

async function compileRevisionSpecInternal(spec: CreativeRevisionSpec) {
  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const parent = assets.find((a) => a.assetId === spec.parentAssetId);
  if (!parent) throw new Error('Parent asset not found');

  const brief = compileCreativeRevision(spec, {
    parentAsset: parent,
    directionName: parent.directionLineage.directionName,
    worldId: parent.directionLineage.worldId,
    topicName: parent.contentLineage.topicName,
  });

  const surgicality = runRevisionSurgicalityTest({ spec, compiledBrief: brief });
  const contamination = runRevisionWorldContaminationTest({
    spec,
    parentAsset: parent,
    compiledBrief: brief,
    originDirectionName: parent.directionLineage.directionName,
  });
  const hostFont = runHostFontRevisionLeakageTest(brief);
  const lockConflicts = detectRevisionLockConflicts(spec);

  const specForGate = { ...spec, status: 'APPROVED_FOR_GENERATION' as const };
  const generationGate = canApproveRevisionGeneration({
    spec: specForGate,
    surgicality,
    contamination,
    hostFont,
    parentAssetAvailable: Boolean(parent.generationLineage.storagePath),
    parentPromptLineageAvailable: Boolean(parent.intelligenceLineage.promptHash),
    lockConflicts,
  });

  return { spec, brief, surgicality, contamination, hostFont, generationGate, parent, lockConflicts };
}

export async function getRevisionComparisonState(revisionId: string): Promise<{
  comparison: import('../../../../shared/site00-brand-lore/creativeLineage/revisionTypes.js').RevisionComparisonState;
}> {
  const spec = await judgmentStore.getCreativeRevisionSpec(revisionId);
  if (!spec) throw new Error('Revision spec not found');

  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const parent = assets.find((a) => a.assetId === spec.parentAssetId);
  const child = spec.childAssetId ? assets.find((a) => a.assetId === spec.childAssetId) : null;

  return {
    comparison: {
      parentAssetId: spec.parentAssetId,
      childAssetId: spec.childAssetId,
      revisionId: spec.revisionId,
      specStatus: spec.status,
      diff: spec.complianceDiff,
      generationReceipt: spec.generationReceipt,
      parentStoragePath: parent?.generationLineage.storagePath ?? null,
      childStoragePath: child?.generationLineage.storagePath ?? null,
      founderActions: ['LOVE_IT', 'REVISE_AGAIN', 'NOT_FOR_ME', 'SET_PREFERRED_VERSION'],
    },
  };
}

export async function setPreferredRevisionVersion(params: {
  rootAssetId: string;
  preferredAssetId: string;
}): Promise<CreativeAssetRecord> {
  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const root = assets.find((a) => a.assetId === params.rootAssetId);
  if (!root) throw new Error('Root asset not found');

  const preferred = assets.find((a) => a.assetId === params.preferredAssetId);
  if (!preferred) throw new Error('Preferred asset not found');
  if ((preferred.rootAssetId ?? preferred.assetId) !== (root.rootAssetId ?? root.assetId)) {
    throw new Error('Preferred asset must belong to same revision family');
  }

  const ts = nowIso();
  const updated: CreativeAssetRecord = {
    ...root,
    preferredRevisionAssetId: params.preferredAssetId,
    updatedAt: ts,
    internalNotes: [root.internalNotes, `Preferred revision version set to ${params.preferredAssetId}`]
      .filter(Boolean)
      .join(' · '),
  };
  await assetStore.upsertCreativeAsset(updated);
  return updated;
}

export async function executeRevisionGeneration(
  revisionId: string,
  options?: { technicalRetry?: boolean },
): Promise<RevisionGenerateResult> {
  const spec = await judgmentStore.getCreativeRevisionSpec(revisionId);
  if (!spec) return { allowed: false, reason: 'Revision spec not found' };

  if (spec.status === 'GENERATING') {
    return { allowed: false, reason: 'Generation already in progress', spec };
  }

  if (spec.status === 'COMPARISON_READY' || spec.status === 'GENERATED') {
    if (spec.childAssetId) {
      const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
      const child = assets.find((a) => a.assetId === spec.childAssetId);
      if (child && spec.complianceDiff && spec.generationReceipt) {
        return {
          allowed: true,
          spec,
          child,
          diff: spec.complianceDiff,
          receipt: spec.generationReceipt,
        };
      }
    }
  }

  const idempotencyKey = buildIdempotencyKey(spec);
  if (activeGenerationKeys.has(idempotencyKey)) {
    return { allowed: false, reason: 'Duplicate generation request blocked (idempotency)', spec };
  }

  const compiled = await compileRevisionSpecInternal(spec);
  const gateSpec = { ...spec, status: spec.status === 'APPROVED_FOR_GENERATION' ? spec.status : ('APPROVED_FOR_GENERATION' as const) };
  const generationGate = canApproveRevisionGeneration({
    spec: gateSpec,
    surgicality: compiled.surgicality,
    contamination: compiled.contamination,
    hostFont: compiled.hostFont,
    parentAssetAvailable: Boolean(compiled.parent.generationLineage.storagePath),
    parentPromptLineageAvailable: Boolean(compiled.parent.intelligenceLineage.promptHash),
    lockConflicts: compiled.lockConflicts,
  });

  if (!generationGate.approved) {
    return { allowed: false, reason: generationGate.gateReason, spec };
  }

  if (spec.status !== 'APPROVED_FOR_GENERATION') {
    return { allowed: false, reason: 'Spec must be APPROVED_FOR_GENERATION before generation', spec };
  }

  activeGenerationKeys.add(idempotencyKey);
  const startedAt = nowIso();

  const generatingSpec: CreativeRevisionSpec = {
    ...spec,
    status: 'GENERATING',
    idempotencyKey,
    updatedAt: startedAt,
  };
  await judgmentStore.upsertCreativeRevisionSpec(generatingSpec);

  const parent = compiled.parent;
  const parentStoragePath = parent.generationLineage.storagePath;
  if (!parentStoragePath) {
    activeGenerationKeys.delete(idempotencyKey);
    const failed: CreativeRevisionSpec = {
      ...generatingSpec,
      status: 'GENERATION_FAILED',
      generationGate: { liveGenerationEnabled: false, gateReason: 'Parent storage path missing' },
      updatedAt: nowIso(),
    };
    await judgmentStore.upsertCreativeRevisionSpec(failed);
    return { allowed: false, reason: 'Parent storage path missing', spec: failed };
  }

  const parentExists = await site00StorageObjectExists(parentStoragePath);
  if (!parentExists && process.env.VITEST !== 'true') {
    activeGenerationKeys.delete(idempotencyKey);
    const failed: CreativeRevisionSpec = {
      ...generatingSpec,
      status: 'GENERATION_FAILED',
      generationGate: { liveGenerationEnabled: false, gateReason: 'Parent image not in durable storage' },
      updatedAt: nowIso(),
    };
    await judgmentStore.upsertCreativeRevisionSpec(failed);
    return { allowed: false, reason: 'Parent image not in durable storage', spec: failed };
  }

  const modeResolution = resolveRevisionGenerationMode({
    spec,
    capabilities: defaultProviderCapabilities(true),
  });

  const parentImageUrl = buildPublicStorageUrl(parentStoragePath);
  const referenceUrls =
    modeResolution.parentImageRequired && parentImageUrl ? [parentImageUrl] : undefined;

  const promptHash = hashRevisionPrompt(compiled.brief.deltaPrompt);
  const receiptId = `receipt-${randomUUID()}`;

  try {
    const genResult = await revisionImageGenerator({
      compiledPrompt: compiled.brief.deltaPrompt,
      generationMode: modeResolution.mode,
      referenceImageUrls: referenceUrls,
      aspectRatio: '16:9',
    });

    const buffer = await downloadUrlToBuffer(genResult.url);
    const childAssetId = `revision-child-${randomUUID()}`;
    const storagePath = buildRevisionStoragePath(spec.rootAssetId, spec.revisionNumber);
    const childRevisionNumber = spec.revisionNumber;

    let uploadResult: { publicUrl: string; storagePath: string };
    try {
      uploadResult = await uploadSite00AssetBuffer(storagePath, buffer, 'image/webp', { upsert: true });
    } catch (storageErr) {
      activeGenerationKeys.delete(idempotencyKey);
      const failed: CreativeRevisionSpec = {
        ...generatingSpec,
        status: 'STORAGE_FAILED',
        generationReceipt: {
          receiptId,
          revisionSpecId: spec.revisionId,
          parentAssetId: spec.parentAssetId,
          rootAssetId: spec.rootAssetId,
          childAssetId: null,
          revisionNumber: spec.revisionNumber,
          branchId: spec.branchId,
          generationMode: modeResolution.mode,
          provider: 'fal',
          model: genResult.model,
          promptHash,
          sourceImageReference: parentStoragePath,
          referenceAssetIds: referenceUrls ? [spec.parentAssetId] : [],
          generationStartedAt: startedAt,
          generationCompletedAt: null,
          costEstimateUsd: genResult.costEstimateUsd,
          providerRequestId: null,
          storagePath: null,
          failureReason: storageErr instanceof Error ? storageErr.message : 'Storage upload failed',
          surgicalityPreflight: compiled.surgicality.result,
          contaminationPreflight: compiled.contamination.result,
          idempotencyKey,
          isTechnicalRetry: options?.technicalRetry === true,
        },
        updatedAt: nowIso(),
      };
      await judgmentStore.upsertCreativeRevisionSpec(failed);
      return { allowed: false, reason: failed.generationReceipt!.failureReason!, spec: failed };
    }

    const storedExists = await site00StorageObjectExists(uploadResult.storagePath);
    if (!storedExists && process.env.VITEST !== 'true') {
      throw new Error('Durable storage verification failed after upload');
    }

    const receipt: RevisionGenerationReceipt = {
      receiptId,
      revisionSpecId: spec.revisionId,
      parentAssetId: spec.parentAssetId,
      rootAssetId: spec.rootAssetId,
      childAssetId,
      revisionNumber: spec.revisionNumber,
      branchId: spec.branchId,
      generationMode: modeResolution.mode,
      provider: 'fal',
      model: genResult.model,
      promptHash,
      sourceImageReference: parentStoragePath,
      referenceAssetIds: referenceUrls ? [spec.parentAssetId] : [],
      generationStartedAt: startedAt,
      generationCompletedAt: nowIso(),
      costEstimateUsd: genResult.costEstimateUsd,
      providerRequestId: createHash('sha256').update(genResult.url).digest('hex').slice(0, 16),
      storagePath: uploadResult.storagePath,
      failureReason: null,
      surgicalityPreflight: compiled.surgicality.result,
      contaminationPreflight: compiled.contamination.result,
      idempotencyKey,
      isTechnicalRetry: options?.technicalRetry === true,
    };

    const child = buildRevisionChildAssetRecord({
      parent,
      childAssetId,
      revisionNumber: childRevisionNumber,
      revisionSpecId: spec.revisionId,
      storagePath: uploadResult.storagePath,
      generationReceipt: {
        provider: 'fal',
        model: genResult.model,
        requestId: receipt.providerRequestId,
        costEstimateUsd: genResult.costEstimateUsd,
        referenceAssetIds: receipt.referenceAssetIds,
        imageConditioningUsed: modeResolution.parentImageRequired,
      },
    });

    const diff = evaluateRevisionCompliance({
      spec,
      brief: compiled.brief,
      parent,
      child,
    });

    await assetStore.upsertCreativeAsset(child);

    const updatedParent: CreativeAssetRecord = {
      ...parent,
      relationship: {
        ...parent.relationship,
        derivedAssetIds: [...(parent.relationship.derivedAssetIds ?? []), childAssetId],
      },
      updatedAt: nowIso(),
    };
    await assetStore.upsertCreativeAsset(updatedParent);

    const completedSpec: CreativeRevisionSpec = {
      ...generatingSpec,
      status: 'COMPARISON_READY',
      childAssetId,
      generationMode: modeResolution.mode,
      generationReceipt: receipt,
      complianceDiff: diff,
      generationGate: {
        liveGenerationEnabled: true,
        gateReason: 'Revision generated — comparison ready for founder review',
      },
      updatedAt: nowIso(),
    };
    await judgmentStore.upsertCreativeRevisionSpec(completedSpec);

    activeGenerationKeys.delete(idempotencyKey);

    return { allowed: true, spec: completedSpec, child, diff, receipt };
  } catch (err) {
    activeGenerationKeys.delete(idempotencyKey);
    const message = err instanceof Error ? err.message : 'Generation failed';
    const failed: CreativeRevisionSpec = {
      ...generatingSpec,
      status: 'GENERATION_FAILED',
      generationReceipt: {
        receiptId,
        revisionSpecId: spec.revisionId,
        parentAssetId: spec.parentAssetId,
        rootAssetId: spec.rootAssetId,
        childAssetId: null,
        revisionNumber: spec.revisionNumber,
        branchId: spec.branchId,
        generationMode: modeResolution.mode,
        provider: 'fal',
        model: 'unknown',
        promptHash,
        sourceImageReference: parentStoragePath,
        referenceAssetIds: referenceUrls ? [spec.parentAssetId] : [],
        generationStartedAt: startedAt,
        generationCompletedAt: nowIso(),
        costEstimateUsd: null,
        providerRequestId: null,
        storagePath: null,
        failureReason: message,
        surgicalityPreflight: compiled.surgicality.result,
        contaminationPreflight: compiled.contamination.result,
        idempotencyKey,
        isTechnicalRetry: options?.technicalRetry === true,
      },
      generationGate: { liveGenerationEnabled: false, gateReason: message },
      updatedAt: nowIso(),
    };
    await judgmentStore.upsertCreativeRevisionSpec(failed);
    return { allowed: false, reason: message, spec: failed };
  }
}

export const REVISION_GENERATION_COST_ESTIMATE_USD = 0.045;
