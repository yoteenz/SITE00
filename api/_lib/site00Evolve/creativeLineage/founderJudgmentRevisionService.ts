/**
 * Founder creative judgment + surgical revision lineage service.
 */

import { randomUUID } from 'node:crypto';
import type { CreativeAssetRecord } from '../../../../shared/site00-brand-lore/creativeLineage/types.js';
import { extractPreferenceEvidenceFromRevision } from '../../../../shared/site00-brand-lore/creativeLineage/preferenceEvidence.js';
import { runJudgmentForensicAudit } from '../../../../shared/site00-brand-lore/creativeLineage/judgmentForensicAudit.js';
import { resolveCreativeValueFromJudgment } from '../../../../shared/site00-brand-lore/creativeLineage/assetLifecycleDimensions.js';
import { eventKindForCreativeValue } from '../../../../shared/site00-brand-lore/creativeLineage/assetLifecycleEvents.js';
import {
  applyFounderJudgmentToAsset,
  buildRevisionChildAssetDefaults,
  normalizeBrandLineageFields,
  type FounderSlideJudgment,
} from '../../../../shared/site00-brand-lore/creativeLineage/founderJudgmentLineage.js';
import { NDXBOOK_ORG_ID } from '../creativeDirection/creativeIntelligence/founderComparisonSet.js';
import * as assetStore from './storeAdapter.js';
import * as judgmentStore from './founderJudgmentRevisionStoreAdapter.js';
import { appendAssetLifecycleEvent } from './assetLifecycleEventStore.js';
import {
  crossBrandEligibilityForAction,
  dispositionForAction,
  normalizeFounderAction,
  type BrandAssetDispositionRecord,
  type FounderCreativeJudgment,
  type FounderJudgmentHistoryEntry,
} from '../../../../shared/site00-brand-lore/creativeLineage/founderCreativeJudgmentTypes.js';
import type {
  CreativeRevisionSpec,
  RevisionBranch,
  RevisionCategoryNotes,
  RevisionElementKey,
  RevisionGenerationBrief,
  RevisionSeverity,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionTypes.js';
import {
  compileCreativeRevision,
  defaultRevisionSeverity,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionCompiler.js';
import {
  canApproveRevisionGeneration,
  runHostFontRevisionLeakageTest,
  runRevisionSurgicalityTest,
  runRevisionWorldContaminationTest,
} from '../../../../shared/site00-brand-lore/creativeLineage/revisionValidation.js';
import { detectRevisionLockConflicts } from '../../../../shared/site00-brand-lore/creativeLineage/revisionLockConflictDetection.js';
import { severityDefaultMode } from '../../../../shared/site00-brand-lore/creativeLineage/revisionGenerationModeResolver.js';
import {
  approveRevisionSpecForGeneration,
  executeRevisionGeneration,
  getRevisionComparisonState,
  REVISION_GENERATION_COST_ESTIMATE_USD,
  setPreferredRevisionVersion,
} from './revisionGenerationService.js';

const BRAND_SLUG = 'ndxbook';

function nowIso(): string {
  return new Date().toISOString();
}

export async function recordFounderCreativeJudgment(params: {
  assetId: string;
  founderAction: FounderSlideJudgment;
  judgmentReason?: string | null;
  carouselRunGenerating?: boolean;
}): Promise<{
  asset: CreativeAssetRecord;
  judgment: FounderCreativeJudgment;
  disposition: BrandAssetDispositionRecord;
}> {
  const creativeValue = resolveCreativeValueFromJudgment(params.founderAction);
  const action = normalizeFounderAction(params.founderAction);
  if (!action) throw new Error('Founder action required');

  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const existing = assets.find((a) => a.assetId === params.assetId);
  if (!existing) throw new Error(`Asset not found: ${params.assetId}`);

  const ts = nowIso();
  const prior = await judgmentStore.getFounderCreativeJudgment(BRAND_SLUG, params.assetId);
  const previousAction = prior?.founderAction ?? null;

  const historyEntry: FounderJudgmentHistoryEntry = {
    judgmentId: `judgment-event-${randomUUID()}`,
    founderAction: action,
    previousJudgment: previousAction,
    judgmentReason: params.judgmentReason ?? null,
    createdAt: ts,
  };

  const judgment: FounderCreativeJudgment = {
    judgmentId: prior?.judgmentId ?? `judgment-${randomUUID()}`,
    assetId: params.assetId,
    brandSlug: BRAND_SLUG,
    projectId: existing.projectId,
    directionId: existing.directionLineage.directionId,
    worldId: existing.directionLineage.worldId,
    founderAction: action,
    previousJudgment: previousAction,
    judgmentReason: params.judgmentReason ?? null,
    judgmentHistory: [...(prior?.judgmentHistory ?? []), historyEntry],
    createdAt: prior?.createdAt ?? ts,
    updatedAt: ts,
  };

  const disposition: BrandAssetDispositionRecord = {
    dispositionId: `disposition-${params.assetId}`,
    assetId: params.assetId,
    brandSlug: BRAND_SLUG,
    projectId: existing.projectId,
    brandDisposition: dispositionForAction(action),
    crossBrandReuseEligibility: crossBrandEligibilityForAction(action),
    reason: params.judgmentReason ?? null,
    createdAt: ts,
    updatedAt: ts,
  };

  let updatedAsset = applyFounderJudgmentToAsset(existing, params.founderAction, ts);
  updatedAsset = {
    ...updatedAsset,
    rootAssetId: updatedAsset.rootAssetId ?? updatedAsset.assetId,
  };

  if (params.carouselRunGenerating) {
    updatedAsset.internalNotes = [
      updatedAsset.internalNotes,
      'Judgment recorded during active Experiment C generation — does not alter generation inputs',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  await judgmentStore.upsertFounderCreativeJudgment(judgment);
  await judgmentStore.upsertBrandAssetDisposition(disposition);
  await assetStore.upsertCreativeAsset(updatedAsset);

  const eventKind = eventKindForCreativeValue(creativeValue);
  if (eventKind) {
    await appendAssetLifecycleEvent({
      eventId: `event-${randomUUID()}`,
      assetId: params.assetId,
      brandSlug: BRAND_SLUG,
      kind: eventKind,
      creativeValue,
      productionDestiny: updatedAsset.productionDestiny,
      detail: params.judgmentReason ?? null,
      createdAt: ts,
    });
  }

  return { asset: updatedAsset, judgment, disposition };
}

export async function createRevisionSpecDraft(params: {
  parentAssetId: string;
  founderOriginalNote?: string;
  categoryNotes?: RevisionCategoryNotes;
  lockedElements?: RevisionElementKey[];
  mutableElements?: RevisionElementKey[];
  severity?: RevisionSeverity;
  branchId?: string | null;
}): Promise<CreativeRevisionSpec> {
  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const parent = assets.find((a) => a.assetId === params.parentAssetId);
  if (!parent) throw new Error('Parent asset not found');

  const rootAssetId = parent.rootAssetId ?? parent.assetId;
  const existing = await judgmentStore.listCreativeRevisionSpecs({
    brandSlug: BRAND_SLUG,
    rootAssetId,
  });
  const revisionNumber = existing.length + 1;
  const ts = nowIso();
  const branchId = params.branchId ?? `branch-${rootAssetId}`;
  const severity = params.severity ?? defaultRevisionSeverity();

  const priorBranch = await judgmentStore.getRevisionBranch(branchId);
  const branch: RevisionBranch = {
    branchId,
    rootAssetId,
    brandSlug: BRAND_SLUG,
    label: priorBranch?.label ?? `Revision branch ${revisionNumber}`,
    revisionIds: priorBranch?.revisionIds ?? [],
    parentBranchId: priorBranch?.parentBranchId ?? null,
    createdAt: priorBranch?.createdAt ?? ts,
    updatedAt: ts,
  };

  const spec: CreativeRevisionSpec = {
    revisionId: `revision-${randomUUID()}`,
    parentAssetId: parent.assetId,
    rootAssetId: parent.rootAssetId ?? parent.assetId,
    revisionNumber,
    branchId,
    brandSlug: BRAND_SLUG,
    projectId: parent.projectId,
    directionId: parent.directionLineage.directionId,
    worldId: parent.directionLineage.worldId,
    creativeFamilyId: parent.creativeFamilyId,
    severity,
    founderOriginalNote: params.founderOriginalNote ?? '',
    categoryNotes: params.categoryNotes ?? {},
    elementStates: {},
    lockedElements: params.lockedElements ?? [],
    mutableElements: params.mutableElements ?? [],
    preserveUnspecified: true,
    requestedAssetExchange: [],
    requestedCopyChanges: [],
    requestedColorChanges: [],
    requestedTypographyChanges: [],
    status: 'DRAFT',
    generationMode: severityDefaultMode(severity),
    generationGate: {
      liveGenerationEnabled: false,
      gateReason: 'Save spec is free — explicit founder approval required before generation',
    },
    childAssetId: null,
    generationReceipt: null,
    complianceDiff: null,
    idempotencyKey: null,
    approvedAt: null,
    generationAttempt: 1,
    createdAt: ts,
    updatedAt: ts,
  };

  branch.revisionIds = [...existing.map((s) => s.revisionId), spec.revisionId];
  await judgmentStore.upsertRevisionBranch(branch);
  await judgmentStore.upsertCreativeRevisionSpec(spec);

  const updatedParent: CreativeAssetRecord = {
    ...normalizeBrandLineageFields(parent),
    revisionPending: true,
    brandDisposition: 'REVISION_PENDING',
    reviewState: 'REVISE',
    currentRevisionId: spec.revisionId,
    updatedAt: ts,
  };
  await assetStore.upsertCreativeAsset(updatedParent);

  for (const ev of extractPreferenceEvidenceFromRevision(spec, BRAND_SLUG, parent.projectId)) {
    await judgmentStore.upsertPreferenceEvidence(ev);
  }

  return spec;
}

function buildElementStates(
  locked: RevisionElementKey[],
  mutable: RevisionElementKey[],
): Partial<Record<RevisionElementKey, 'LOCKED' | 'MUTABLE' | 'UNSPECIFIED'>> {
  const states: Partial<Record<RevisionElementKey, 'LOCKED' | 'MUTABLE' | 'UNSPECIFIED'>> = {};
  for (const key of locked) states[key] = 'LOCKED';
  for (const key of mutable) states[key] = key in states ? states[key] : 'MUTABLE';
  return states;
}

export async function updateCreativeRevisionSpec(params: {
  revisionId: string;
  founderOriginalNote?: string;
  categoryNotes?: RevisionCategoryNotes;
  lockedElements?: RevisionElementKey[];
  mutableElements?: RevisionElementKey[];
  severity?: RevisionSeverity;
  requestedAssetExchange?: CreativeRevisionSpec['requestedAssetExchange'];
  requestedCopyChanges?: string[];
  requestedColorChanges?: string[];
  requestedTypographyChanges?: string[];
  status?: CreativeRevisionSpec['status'];
}): Promise<CreativeRevisionSpec> {
  const spec = await judgmentStore.getCreativeRevisionSpec(params.revisionId);
  if (!spec) throw new Error('Revision spec not found');

  if (spec.status === 'GENERATING') {
    throw new Error('Cannot update spec while generation is in progress');
  }

  const locked = params.lockedElements ?? spec.lockedElements;
  const mutable = params.mutableElements ?? spec.mutableElements;
  const ts = nowIso();
  const severity = params.severity ?? spec.severity;

  const updated: CreativeRevisionSpec = {
    ...spec,
    founderOriginalNote: params.founderOriginalNote ?? spec.founderOriginalNote,
    categoryNotes: params.categoryNotes ?? spec.categoryNotes,
    lockedElements: locked,
    mutableElements: mutable,
    elementStates: buildElementStates(locked, mutable),
    severity,
    generationMode: severityDefaultMode(severity),
    requestedAssetExchange: params.requestedAssetExchange ?? spec.requestedAssetExchange,
    requestedCopyChanges: params.requestedCopyChanges ?? spec.requestedCopyChanges,
    requestedColorChanges: params.requestedColorChanges ?? spec.requestedColorChanges,
    requestedTypographyChanges: params.requestedTypographyChanges ?? spec.requestedTypographyChanges,
    status: params.status ?? (spec.status === 'COMPARISON_READY' ? spec.status : 'DRAFT'),
    updatedAt: ts,
  };

  await judgmentStore.upsertCreativeRevisionSpec(updated);

  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const parent = assets.find((a) => a.assetId === spec.parentAssetId);
  if (parent) {
    for (const ev of extractPreferenceEvidenceFromRevision(updated, BRAND_SLUG, parent.projectId)) {
      await judgmentStore.upsertPreferenceEvidence(ev);
    }
  }

  return updated;
}

export async function compileRevisionSpec(revisionId: string): Promise<{
  spec: CreativeRevisionSpec;
  brief: RevisionGenerationBrief;
  surgicality: ReturnType<typeof runRevisionSurgicalityTest>;
  contamination: ReturnType<typeof runRevisionWorldContaminationTest>;
  hostFont: ReturnType<typeof runHostFontRevisionLeakageTest>;
  lockConflicts: ReturnType<typeof detectRevisionLockConflicts>;
  generationGate: ReturnType<typeof canApproveRevisionGeneration>;
  costEstimateUsd: number;
}> {
  const spec = await judgmentStore.getCreativeRevisionSpec(revisionId);
  if (!spec) throw new Error('Revision spec not found');

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

  const generationGate = canApproveRevisionGeneration({
    spec,
    surgicality,
    contamination,
    hostFont,
    parentAssetAvailable: Boolean(parent.generationLineage.storagePath),
    parentPromptLineageAvailable: Boolean(parent.intelligenceLineage.promptHash),
    lockConflicts,
  });

  const nextStatus: CreativeRevisionSpec['status'] =
    surgicality.passed && contamination.passed && hostFont.passed && lockConflicts.length === 0
      ? 'READY_FOR_REVIEW'
      : spec.status;

  const updated: CreativeRevisionSpec = {
    ...spec,
    status: nextStatus,
    generationGate: {
      liveGenerationEnabled: generationGate.approved,
      gateReason: generationGate.gateReason,
    },
    updatedAt: nowIso(),
  };
  await judgmentStore.upsertCreativeRevisionSpec(updated);

  return {
    spec: updated,
    brief,
    surgicality,
    contamination,
    hostFont,
    lockConflicts,
    generationGate,
    costEstimateUsd: REVISION_GENERATION_COST_ESTIMATE_USD,
  };
}

export async function getRevisionHistory(assetId: string): Promise<{
  rootAssetId: string;
  revisions: CreativeRevisionSpec[];
  branches: RevisionBranch[];
}> {
  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const asset = assets.find((a) => a.assetId === assetId);
  if (!asset) throw new Error('Asset not found');
  const rootAssetId = asset.rootAssetId ?? asset.assetId;
  const revisions = await judgmentStore.listCreativeRevisionSpecs({ brandSlug: BRAND_SLUG, rootAssetId });
  const branchIds = [...new Set(revisions.map((r) => r.branchId))];
  const branches: RevisionBranch[] = [];
  for (const branchId of branchIds) {
    const branch = await judgmentStore.getRevisionBranch(branchId);
    if (branch) branches.push(branch);
  }
  return {
    rootAssetId,
    revisions: revisions.sort((a, b) => a.revisionNumber - b.revisionNumber),
    branches,
  };
}

export async function runFounderJudgmentForensicAudit() {
  const assets = await assetStore.listCreativeAssets(BRAND_SLUG);
  const judgments = await judgmentStore.listFounderCreativeJudgments(BRAND_SLUG);
  const revisionSpecs = await judgmentStore.listCreativeRevisionSpecs({ brandSlug: BRAND_SLUG });
  return runJudgmentForensicAudit({ brandSlug: BRAND_SLUG, assets, judgments, revisionSpecs });
}

export async function attemptGenerateRevision(
  revisionId: string,
  options?: { technicalRetry?: boolean },
) {
  return executeRevisionGeneration(revisionId, options);
}

export {
  approveRevisionSpecForGeneration,
  getRevisionComparisonState,
  setPreferredRevisionVersion,
  buildRevisionChildAssetDefaults,
  REVISION_GENERATION_COST_ESTIMATE_USD,
};

export { NDXBOOK_ORG_ID };
