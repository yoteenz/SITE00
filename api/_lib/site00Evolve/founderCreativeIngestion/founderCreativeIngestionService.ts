/**
 * P0.CB.1 — Founder creative ingestion API service.
 */

import {
  initializeNdxLaunchRow01,
  registerReferenceUpload,
  decomposeSequenceReference,
  buildSequenceReconstructionSpecs,
  resolveReconstructionPhotographyModes,
  setPhotographySourceMode,
  editSlidePrompt,
  estimateSlideGeneration,
  replaceSlidePhotography,
  applySlideReviewJudgment,
  runSequenceLevelReview,
  registerOnCampaignBoard,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/ingestionEngine.js';
import {
  MEET_NDX_SEQUENCE_ID,
  PERSONAL_BRAND_SEQUENCE_ID,
  SAVED_THIS_WEEK_SEQUENCE_ID,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';
import type { MarketingCampaignProductionRun } from '../../../../shared/site00-studio-world-production/marketingCampaignProduction/types.js';
import type {
  FounderCreativeIngestionState,
  PhotographySourceMode,
  ReconstructionReviewJudgment,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/types.js';
import * as campaignStore from '../marketingCampaignProduction/marketingCampaignProductionStoreAdapter.js';
import { isNeuralProviderConfigured } from '../founderCharacterDiscovery/neuralVoiceGenerationService.js';
import {
  maybeResumeFounderCreativeGeneration,
  reconcileStaleFounderCreativeGeneration,
  startFounderCreativeFalBatch,
  startFounderCreativeSlideFal,
} from './founderCreativeFalBackgroundJob.js';
import {
  bulkRedecomposeDraftReferences,
  bulkUploadReplacementReferences,
  getActiveReferenceVersion,
  getArchiveForVersion,
  getDraftReferenceVersion,
  getPhotoCompatibilityForSequence,
  migrateLegacyIngestionToVersioning,
  promoteDraftReference,
  redecomposeFromDraftReference,
  replaceSingleSlideReference,
  rerunSequenceQAAfterRedecomposition,
  uploadReplacementReferenceBoard,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/replacementEngine.js';
import { uploadFounderReferenceBoardImage } from './referenceBoardUpload.js';

function falConfigured(): boolean {
  return isNeuralProviderConfigured();
}

async function ensureRun(projectId: string): Promise<MarketingCampaignProductionRun> {
  const existing = await campaignStore.getCampaignProductionRun(projectId);
  if (existing) return existing;
  return {
    runId: 'ndxbook-campaign-production',
    projectId,
    campaign: null,
    slate: null,
    board: null,
    sequenceContracts: [],
    approvals: [],
    revisionDeltas: [],
    reopenEvents: [],
    snapshots: [],
    completePackages: [],
    captions: [],
    rhythmEvaluation: null,
    accounting: {
      anthropicRequests: 0,
      anthropicEstimatedCostUsd: 0,
      falRequests: 0,
      falEstimatedCostUsd: 0,
      falActualCostUsd: 0,
      revisionCostUsd: 0,
      campaignTotalUsd: 0,
    },
    status: 'NOT_STARTED',
    error: null,
    founderCreativeIngestion: null,
    updatedAt: new Date().toISOString(),
  };
}

async function saveWithIngestion(
  projectId: string,
  run: MarketingCampaignProductionRun,
  ingestion: FounderCreativeIngestionState,
): Promise<MarketingCampaignProductionRun> {
  return campaignStore.saveCampaignProductionRun({
    ...run,
    founderCreativeIngestion: ingestion,
    updatedAt: new Date().toISOString(),
  });
}

async function hydrateRun(projectId: string): Promise<MarketingCampaignProductionRun> {
  let run = await ensureRun(projectId);
  if (run.founderCreativeIngestion) {
    const migrated = migrateLegacyIngestionToVersioning(run.founderCreativeIngestion);
    if (migrated !== run.founderCreativeIngestion) {
      run = await saveWithIngestion(projectId, run, migrated);
    }
  }
  run = await reconcileStaleFounderCreativeGeneration(run);
  run = await maybeResumeFounderCreativeGeneration(run);
  return run;
}

export async function getFounderCreativeIngestion(params: {
  projectId: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState | null; background?: boolean }> {
  const run = await hydrateRun(params.projectId);
  return {
    run,
    ingestion: run.founderCreativeIngestion ?? null,
    background:
      run.founderCreativeIngestion?.falGenerationTracking?.status === 'RUNNING' &&
      process.env.VITEST !== 'true',
  };
}

export async function initializeFounderCreativeRow01(params: {
  projectId: string;
  characterIdentityLocked?: boolean;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await ensureRun(params.projectId);
  const ingestion = initializeNdxLaunchRow01({
    characterIdentityLocked: params.characterIdentityLocked,
    canonicalCharacterRef: params.characterIdentityLocked ? 'ndx-hq-desk-photo' : null,
  });

  let state = ingestion;
  for (const seqId of [MEET_NDX_SEQUENCE_ID, PERSONAL_BRAND_SEQUENCE_ID, SAVED_THIS_WEEK_SEQUENCE_ID]) {
    state = registerReferenceUpload(state, {
      sequenceId: seqId,
      previewUrl: `/api/placeholder/founder-creative/reference/${seqId}`,
      notes: 'Founder-supplied composite mood board reference',
    });
  }

  const saved = await saveWithIngestion(params.projectId, run, state);
  return { run: saved, ingestion: state };
}

export async function decomposeFounderCreativeSequence(params: {
  projectId: string;
  sequenceId: string;
  dispatchFal?: boolean;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Initialize founder creative ingestion first');

  let ingestion = decomposeSequenceReference(run.founderCreativeIngestion, params.sequenceId);
  ingestion = buildSequenceReconstructionSpecs(ingestion, params.sequenceId);
  ingestion = resolveReconstructionPhotographyModes(ingestion, params.sequenceId);

  if ((params.dispatchFal ?? falConfigured()) && falConfigured()) {
    const batch = await startFounderCreativeFalBatch({
      projectId: params.projectId,
      run,
      ingestion,
    });
    return batch;
  }

  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function decomposeAllFounderCreativeSequences(params: {
  projectId: string;
  dispatchFal?: boolean;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  let run = await hydrateRun(params.projectId);
  let ingestion = run.founderCreativeIngestion;
  if (!ingestion) {
    ({ run, ingestion } = await initializeFounderCreativeRow01(params));
  }

  for (const seqId of [MEET_NDX_SEQUENCE_ID, PERSONAL_BRAND_SEQUENCE_ID, SAVED_THIS_WEEK_SEQUENCE_ID]) {
    ingestion = decomposeSequenceReference(ingestion, seqId);
    ingestion = buildSequenceReconstructionSpecs(ingestion, seqId);
    ingestion = resolveReconstructionPhotographyModes(ingestion, seqId);
  }

  if ((params.dispatchFal ?? falConfigured()) && falConfigured()) {
    return startFounderCreativeFalBatch({
      projectId: params.projectId,
      run,
      ingestion,
    });
  }

  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function setFounderCreativePhotoMode(params: {
  projectId: string;
  slideId: string;
  mode: PhotographySourceMode;
  assetId?: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  const ingestion = setPhotographySourceMode(
    run.founderCreativeIngestion,
    params.slideId,
    params.mode,
    params.assetId,
  );
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function editFounderCreativePrompt(params: {
  projectId: string;
  slideId: string;
  prompt: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  const ingestion = editSlidePrompt(run.founderCreativeIngestion, params.slideId, params.prompt);
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function estimateFounderCreativeGeneration(params: {
  projectId: string;
  slideId: string;
}) {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');
  return estimateSlideGeneration(run.founderCreativeIngestion, params.slideId, falConfigured());
}

export async function generateFounderCreativePhotography(params: {
  projectId: string;
  slideId: string;
  dispatchFal?: boolean;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  if (!(params.dispatchFal ?? falConfigured()) || !falConfigured()) {
    throw new Error('FAL_KEY not configured — cannot generate photography');
  }

  return startFounderCreativeSlideFal({
    projectId: params.projectId,
    run,
    ingestion: run.founderCreativeIngestion,
    slideId: params.slideId,
  });
}

export async function replaceFounderCreativePhoto(params: {
  projectId: string;
  slideId: string;
  assetId: string;
  previewUrl?: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  const ingestion = replaceSlidePhotography(
    run.founderCreativeIngestion,
    params.slideId,
    params.assetId,
    params.previewUrl,
  );
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function founderCreativeSlideJudgment(params: {
  projectId: string;
  slideId: string;
  judgment: ReconstructionReviewJudgment;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  const ingestion = applySlideReviewJudgment(
    run.founderCreativeIngestion,
    params.slideId,
    params.judgment,
  );
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function founderCreativeSequenceReview(params: {
  projectId: string;
  sequenceId: string;
}) {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  const { state, report } = runSequenceLevelReview(run.founderCreativeIngestion, params.sequenceId);
  const saved = await saveWithIngestion(params.projectId, run, state);
  return { run: saved, ingestion: state, report };
}

export async function registerFounderCreativeOnCampaignBoard(params: {
  projectId: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');

  const ingestion = registerOnCampaignBoard(run.founderCreativeIngestion);

  const slate = {
    slateId: 'ndx-launch-row-01-slate',
    campaignId: ingestion.campaignId,
    entries: ingestion.parentSequences.map((seq) => ({
      contentPieceId: seq.sequenceId,
      title: seq.title,
      topic: seq.role,
      thesisSummary: seq.notes ?? '',
      semanticRole: seq.role,
      channel: 'instagram',
      format: 'CAROUSEL_SEQUENCE',
      sequenceLength: seq.slideIds.length,
      researchDepth: null,
      emotionalTemperature: null,
      productionStatus: seq.reconstructionStatus === 'APPROVED' ? ('APPROVED' as const) : ('IN_PROGRESS' as const),
      approvalStatus: seq.sequenceReviewStatus === 'APPROVED' ? ('APPROVED' as const) : ('IN_PROGRESS' as const),
      contentStatus: seq.provenance.canonStatus,
    })),
    approvedAt: null,
    fingerprint: `row01-${Date.now()}`,
  };

  const campaign = run.campaign ?? {
    id: ingestion.campaignId,
    projectId: params.projectId,
    brandId: 'ndx',
    campaignId: ingestion.campaignId,
    name: ingestion.campaignLabel,
    description: 'NDXBOOK Launch Row 01 — founder creative ingestion pilot',
    startDate: null,
    endDate: null,
    channelIds: ['instagram'],
    contentPieceIds: ingestion.parentSequences.map((s) => s.sequenceId),
    strategyFingerprint: 'founder-creative-row-01',
    characterSystemFingerprint: 'unchanged',
    marketingExpressionFingerprint: 'founder-created',
    editorialSystemFingerprint: 'launch-row-01',
    status: 'IN_PRODUCTION' as const,
    planningState: 'ROW_01_REGISTERED',
    productionState: 'FOUNDER_CREATIVE_INGESTION',
    approvalState: 'PENDING',
    publishingState: 'NOT_SCHEDULED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const parentAssets = ingestion.parentSequences.map((seq) => ({
    assetId: `parent-${seq.sequenceId}`,
    campaignId: ingestion.campaignId,
    contentPieceId: seq.sequenceId,
    sequencePosition: 1,
    roundId: null,
    semanticRole: 'HERO' as const,
    status: 'IN_PROGRESS' as const,
    parentAssetId: null,
    contractId: null,
    generatedAssetUrl:
      ingestion.referenceAssets.find((a) => a.assetId === `ref-board-${seq.sequenceId}`)?.previewUrl ?? null,
    generatedAssetId: null,
    lockedAt: null,
    approvedAt: null,
    clientJudgment: null,
    internalJudgment: null,
    revisionDeltaId: null,
    fingerprint: seq.sequenceId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const board = {
    boardId: 'ndx-launch-row-01-board',
    campaignId: ingestion.campaignId,
    contentPieceIds: ingestion.parentSequences.map((s) => s.sequenceId),
    maxSequenceDepth: 1,
    sequenceDepthByPiece: Object.fromEntries(
      ingestion.parentSequences.map((s) => [s.sequenceId, s.slideIds.length]),
    ),
    assets: parentAssets,
    rounds: [],
    currentRoundSequencePosition: 1,
    fingerprint: `board-row01-${Date.now()}`,
  };

  const saved = await campaignStore.saveCampaignProductionRun({
    ...run,
    campaign,
    slate,
    board,
    founderCreativeIngestion: ingestion,
    status: 'INITIALIZED',
    updatedAt: new Date().toISOString(),
  });

  return { run: saved, ingestion };
}

export async function replaceFounderCreativeReferenceBoard(params: {
  projectId: string;
  sequenceId: string;
  previewUrl: string | null;
  storagePath?: string | null;
  reason?: string | null;
  notes?: string | null;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Initialize founder creative ingestion first');
  const ingestion = uploadReplacementReferenceBoard(run.founderCreativeIngestion, params);
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function redecomposeFounderCreativeDraftReference(params: {
  projectId: string;
  sequenceId: string;
}): Promise<{
  run: MarketingCampaignProductionRun;
  ingestion: FounderCreativeIngestionState;
  diff: import('../../../../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/types.js').CreativeReferenceDiff | null;
  qaReport: ReturnType<typeof rerunSequenceQAAfterRedecomposition>['report'] | null;
}> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');
  const { state, diff } = redecomposeFromDraftReference(run.founderCreativeIngestion, params.sequenceId);
  const { report } = rerunSequenceQAAfterRedecomposition(state, params.sequenceId);
  const saved = await saveWithIngestion(params.projectId, run, state);
  return { run: saved, ingestion: state, diff, qaReport: report };
}

export async function promoteFounderCreativeDraftReference(params: {
  projectId: string;
  sequenceId: string;
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');
  const ingestion = promoteDraftReference(run.founderCreativeIngestion, params.sequenceId);
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function replaceFounderCreativeSlideReference(params: {
  projectId: string;
  sequenceId: string;
  slideNumber: number;
  previewUrl: string | null;
  observableCopy?: string[];
  compositionNotes?: string[];
}): Promise<{ run: MarketingCampaignProductionRun; ingestion: FounderCreativeIngestionState }> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');
  const ingestion = replaceSingleSlideReference(run.founderCreativeIngestion, params);
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion };
}

export async function bulkReplaceFounderCreativeReferences(params: {
  projectId: string;
  uploads: Array<{ sequenceId: string; previewUrl: string | null; storagePath?: string | null; notes?: string | null }>;
  redecompose?: boolean;
}): Promise<{
  run: MarketingCampaignProductionRun;
  ingestion: FounderCreativeIngestionState;
  diffs: import('../../../../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/types.js').CreativeReferenceDiff[];
}> {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');
  let ingestion = bulkUploadReplacementReferences(run.founderCreativeIngestion, params.uploads);
  let diffs: import('../../../../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/types.js').CreativeReferenceDiff[] = [];
  if (params.redecompose !== false) {
    const result = bulkRedecomposeDraftReferences(
      ingestion,
      params.uploads.map((entry) => entry.sequenceId),
    );
    ingestion = result.state;
    diffs = result.diffs;
  }
  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion, diffs };
}

export async function uploadAndReplaceFounderCreativeReferenceBoard(params: {
  projectId: string;
  sequenceId: string;
  imageData: string;
  notes?: string | null;
}): Promise<{
  run: MarketingCampaignProductionRun;
  ingestion: FounderCreativeIngestionState;
  previewUrl: string;
  storagePath: string;
  diff: import('../../../../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/types.js').CreativeReferenceDiff | null;
  qaReport: ReturnType<typeof rerunSequenceQAAfterRedecomposition>['report'] | null;
}> {
  const { storagePath, previewUrl } = await uploadFounderReferenceBoardImage({
    projectId: params.projectId,
    sequenceId: params.sequenceId,
    imageData: params.imageData,
  });
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Initialize founder creative ingestion first');

  let ingestion = uploadReplacementReferenceBoard(run.founderCreativeIngestion, {
    sequenceId: params.sequenceId,
    previewUrl,
    storagePath,
    notes: params.notes ?? 'Founder uploaded reference board',
    reason: 'FOUNDER_UPLOAD',
    source: 'FOUNDER_UPLOAD',
  });

  const { state, diff } = redecomposeFromDraftReference(ingestion, params.sequenceId);
  ingestion = state;
  const { report } = rerunSequenceQAAfterRedecomposition(ingestion, params.sequenceId);

  const saved = await saveWithIngestion(params.projectId, run, ingestion);
  return { run: saved, ingestion, previewUrl, storagePath, diff, qaReport: report };
}

export async function getFounderCreativeReferenceComparison(params: {
  projectId: string;
  sequenceId: string;
}) {
  const run = await hydrateRun(params.projectId);
  if (!run.founderCreativeIngestion) throw new Error('Not initialized');
  const ingestion = run.founderCreativeIngestion;
  const active = getActiveReferenceVersion(ingestion, params.sequenceId);
  const draft = getDraftReferenceVersion(ingestion, params.sequenceId);
  const activeArchive = active ? getArchiveForVersion(ingestion, active.referenceVersionId) : null;
  const diff = ingestion.referenceDiffs.find((entry) => entry.parentSequenceId === params.sequenceId) ?? null;
  const photoCompatibility = getPhotoCompatibilityForSequence(ingestion, params.sequenceId);
  return {
    active,
    draft,
    activeArchive,
    diff,
    photoCompatibility,
    currentProduction: ingestion.reconstructionSpecs.filter((entry) => entry.sequenceId === params.sequenceId),
  };
}
