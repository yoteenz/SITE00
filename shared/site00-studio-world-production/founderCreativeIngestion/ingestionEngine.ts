/**
 * P0.CB.1 — Founder creative ingestion engine (orchestration).
 */

import { randomUUID } from 'node:crypto';
import {
  FOUNDER_CREATIVE_INGESTION_VERSION,
  INGESTION_WORKFLOW_STEPS,
  NDX_LAUNCH_ROW_01_CAMPAIGN_ID,
} from './constants.js';
import {
  buildNdxLaunchRow01ParentSequences,
  defaultPhotoSourceModeForSequence,
  ndxGridForSequence,
  ndxPilotReferenceAssetId,
  slideSeedsForSequence,
  MEET_NDX_SEQUENCE_ID,
} from './adapters/ndxLaunchRow01Pilot.js';
import { recordCreativeSignalLearning } from './creativeSignalLearning.js';
import {
  buildReferenceBoard,
  decomposeReferenceBoard,
  referenceRegionIsNotProductionAsset,
} from './referenceDecomposition.js';
import { applyPhotographySourceMode, replacePhotographyPreservesComposition } from './photographyPromptReverseEngineering.js';
import { dispatchPhotographyGeneration, compilePhotographyGenerationInstructions } from './realismLabBridge.js';
import { buildSlideReconstructionSpec, editReconstructionPrompt } from './slideReconstructionSpec.js';
import { evaluateSequenceReview } from './sequenceReview.js';
import type {
  CreativeReferenceAsset,
  FounderCreativeIngestionState,
  FounderCreativeParentSequence,
  PhotographySourceMode,
  ReconstructionReviewJudgment,
  SlideProductionAsset,
  SlideReconstructionSpec,
} from './types.js';

export function buildEmptyFounderCreativeIngestionState(): FounderCreativeIngestionState {
  return {
    ingestionVersion: FOUNDER_CREATIVE_INGESTION_VERSION,
    workflowStep: 'REFERENCE',
    campaignId: NDX_LAUNCH_ROW_01_CAMPAIGN_ID,
    campaignLabel: 'NDXBOOK — LAUNCH / ROW 01',
    parentSequences: [],
    referenceBoards: [],
    referenceAssets: [],
    slideReferences: [],
    reconstructionSpecs: [],
    productionAssets: [],
    rowPreview: [],
    creativeSignals: [],
    characterIdentity: {
      status: 'NOT_LOCKED',
      canonicalReferenceAssetId: null,
      message: 'CHARACTER IDENTITY NOT LOCKED — use approved reference; do not auto-promote to canon',
    },
    registeredOnCampaignBoard: false,
  falImageRequests: 0,
  falVideoRequests: 0,
  falGenerationTracking: null,
  updatedAt: new Date().toISOString(),
  };
}

export function initializeNdxLaunchRow01(params?: {
  characterIdentityLocked?: boolean;
  canonicalCharacterRef?: string | null;
}): FounderCreativeIngestionState {
  const parentSequences = buildNdxLaunchRow01ParentSequences();
  const rowPreview = [
    {
      rowId: 'row-01',
      rowNumber: 1,
      label: 'ROW 01',
      sequenceIds: parentSequences.map((s) => s.sequenceId),
    },
  ];

  return {
    ...buildEmptyFounderCreativeIngestionState(),
    workflowStep: 'REFERENCE',
    parentSequences,
    rowPreview,
    characterIdentity: {
      status: params?.characterIdentityLocked ? 'LOCKED' : 'NOT_LOCKED',
      canonicalReferenceAssetId: params?.canonicalCharacterRef ?? null,
      message: params?.characterIdentityLocked
        ? 'Canonical NDX character reference available'
        : 'CHARACTER IDENTITY NOT LOCKED',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function registerReferenceUpload(
  state: FounderCreativeIngestionState,
  params: {
    sequenceId: string;
    previewUrl: string | null;
    storagePath?: string | null;
    notes?: string | null;
  },
): FounderCreativeIngestionState {
  const asset: CreativeReferenceAsset = {
    assetId: ndxPilotReferenceAssetId(params.sequenceId),
    kind: 'REFERENCE_IMAGE',
    storagePath: params.storagePath ?? null,
    previewUrl: params.previewUrl,
    mimeType: 'image/jpeg',
    width: null,
    height: null,
    uploadedAt: new Date().toISOString(),
    notes: params.notes ?? null,
  };

  return {
    ...state,
    referenceAssets: [...state.referenceAssets, asset],
    workflowStep: 'REFERENCE',
    updatedAt: new Date().toISOString(),
  };
}

export function decomposeSequenceReference(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): FounderCreativeIngestionState {
  const asset =
    state.referenceAssets.find((entry) => entry.assetId === ndxPilotReferenceAssetId(sequenceId)) ??
    state.referenceAssets.find((entry) => entry.assetId.includes(sequenceId));
  if (!asset) throw new Error(`Reference asset required for sequence ${sequenceId}`);

  const grid = ndxGridForSequence(sequenceId);
  const board = buildReferenceBoard({
    sequenceId,
    referenceAssetId: asset.assetId,
    gridRows: grid.rows,
    gridCols: grid.cols,
    slideCount: grid.count,
  });

  const slideRefs = decomposeReferenceBoard({
    board: { ...board, decomposedAt: new Date().toISOString() },
    slideSeeds: slideSeedsForSequence(sequenceId),
  });

  const updatedBoard = {
    ...board,
    decomposedAt: new Date().toISOString(),
    slideReferenceIds: slideRefs.map((s) => s.slideReferenceId),
  };

  const parentSequences = state.parentSequences.map((s) =>
    s.sequenceId === sequenceId
      ? { ...s, referenceBoardId: updatedBoard.boardId, reconstructionStatus: 'IN_PROGRESS' as const }
      : s,
  );

  return {
    ...state,
    workflowStep: 'DECOMPOSE',
    referenceBoards: [...state.referenceBoards.filter((b) => b.sequenceId !== sequenceId), updatedBoard],
    slideReferences: [...state.slideReferences.filter((s) => s.sequenceId !== sequenceId), ...slideRefs],
    parentSequences,
    updatedAt: new Date().toISOString(),
  };
}

export function buildSequenceReconstructionSpecs(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): FounderCreativeIngestionState {
  const slideRefs = state.slideReferences.filter((s) => s.sequenceId === sequenceId);
  const specs = slideRefs.map((slide) =>
    buildSlideReconstructionSpec({
      slide,
      defaultPhotoSourceMode: defaultPhotoSourceModeForSequence(sequenceId),
      characterIdentityStatus: state.characterIdentity.status,
      canonicalCharacterRef: state.characterIdentity.canonicalReferenceAssetId,
    }),
  );

  const parentSequences = state.parentSequences.map((s) =>
    s.sequenceId === sequenceId ? { ...s, slideIds: specs.map((sp) => sp.slideId) } : s,
  );

  return {
    ...state,
    workflowStep: 'RECONSTRUCT',
    reconstructionSpecs: [
      ...state.reconstructionSpecs.filter((s) => s.sequenceId !== sequenceId),
      ...specs,
    ],
    parentSequences,
    updatedAt: new Date().toISOString(),
  };
}

export function setPhotographySourceMode(
  state: FounderCreativeIngestionState,
  slideId: string,
  mode: PhotographySourceMode,
  assetId?: string,
): FounderCreativeIngestionState {
  const specs = state.reconstructionSpecs.map((spec) =>
    spec.slideId === slideId
      ? {
          ...spec,
          photography: applyPhotographySourceMode(spec.photography, mode, assetId),
        }
      : spec,
  );
  return { ...state, reconstructionSpecs: specs, updatedAt: new Date().toISOString() };
}

export function editSlidePrompt(
  state: FounderCreativeIngestionState,
  slideId: string,
  prompt: string,
): FounderCreativeIngestionState {
  return {
    ...state,
    reconstructionSpecs: state.reconstructionSpecs.map((s) =>
      s.slideId === slideId ? editReconstructionPrompt(s, prompt) : s,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function estimateSlideGeneration(
  state: FounderCreativeIngestionState,
  slideId: string,
  falConfigured: boolean,
) {
  const spec = state.reconstructionSpecs.find((s) => s.slideId === slideId);
  if (!spec) throw new Error('Slide spec not found');
  return compilePhotographyGenerationInstructions({ spec, falConfigured });
}

export function resolveReconstructionPhotographyModes(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): FounderCreativeIngestionState {
  const slideRefs = state.slideReferences.filter((entry) => entry.sequenceId === sequenceId);
  const specs = state.reconstructionSpecs.filter((entry) => entry.sequenceId === sequenceId);

  const updatedSpecs = specs.map((spec) => {
    if (!spec.photography.required) return spec;
    const slideRef = slideRefs.find((entry) => entry.slideReferenceId === spec.slideReferenceId);
    if (!slideRef) return spec;

    if (sequenceId === MEET_NDX_SEQUENCE_ID && slideRef.slideNumber === 1) {
      return {
        ...spec,
        photography: applyPhotographySourceMode(
          spec.photography,
          'USE_EXISTING_ASSET',
          'ndx-hq-desk-photo-canonical',
        ),
      };
    }

    if (
      spec.photography.sourceMode === 'REFERENCE_ONLY' ||
      spec.photography.sourceMode === 'USE_EXISTING_ASSET'
    ) {
      return {
        ...spec,
        photography: applyPhotographySourceMode(spec.photography, 'GENERATE_FROM_REFERENCE'),
      };
    }
    return spec;
  });

  return {
    ...state,
    reconstructionSpecs: [
      ...state.reconstructionSpecs.filter((entry) => entry.sequenceId !== sequenceId),
      ...updatedSpecs,
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function slideIdsEligibleForFalBatch(state: FounderCreativeIngestionState): string[] {
  return state.reconstructionSpecs
    .filter(
      (spec) =>
        spec.photography.required &&
        (spec.photography.sourceMode === 'GENERATE_FROM_REFERENCE' ||
          spec.photography.sourceMode === 'UPLOAD_HQ'),
    )
    .map((spec) => spec.slideId);
}

export function slideIdsEligibleForExistingAsset(state: FounderCreativeIngestionState): string[] {
  return state.reconstructionSpecs
    .filter(
      (spec) =>
        spec.photography.required &&
        (spec.photography.sourceMode === 'USE_EXISTING_ASSET' ||
          spec.photography.sourceMode === 'LOCK_CANONICAL'),
    )
    .map((spec) => spec.slideId);
}

export function applySlidePhotographyFalResult(
  state: FounderCreativeIngestionState,
  slideId: string,
  params: { assetId: string; previewUrl: string },
): FounderCreativeIngestionState {
  const spec = state.reconstructionSpecs.find((entry) => entry.slideId === slideId);
  if (!spec) throw new Error('Slide spec not found');

  const updatedSpec: SlideReconstructionSpec = {
    ...spec,
    photography: {
      ...spec.photography,
      selectedAssetId: params.assetId,
      candidateAssetIds: [...spec.photography.candidateAssetIds, params.assetId],
      lineageAssetIds: [...spec.photography.lineageAssetIds, params.assetId],
    },
    layerModel: { ...spec.layerModel, photograph: params.assetId },
    productionMasterUrl: params.previewUrl,
    reviewStatus: 'RECONSTRUCTION_REVIEW',
  };

  const productionAsset: SlideProductionAsset = {
    assetId: params.assetId,
    slideId,
    sequenceId: spec.sequenceId,
    kind: 'PRODUCTION_ASSET',
    masterUrl: params.previewUrl,
    masterResolution: spec.targetResolution,
    derivativeUrls: {},
    approvedAt: null,
    lineageParentIds: spec.referenceAssetIds,
  };

  return {
    ...state,
    workflowStep: 'REVIEW',
    reconstructionSpecs: state.reconstructionSpecs.map((entry) =>
      entry.slideId === slideId ? updatedSpec : entry,
    ),
    productionAssets: [...state.productionAssets.filter((entry) => entry.slideId !== slideId), productionAsset],
    falImageRequests: state.falImageRequests + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function applyFounderCreativeBatchFailure(
  state: FounderCreativeIngestionState,
  errorMessage: string,
): FounderCreativeIngestionState {
  return {
    ...state,
    falGenerationTracking: state.falGenerationTracking
      ? { ...state.falGenerationTracking, status: 'FAILED', errorMessage, currentSlideId: null }
      : null,
    updatedAt: new Date().toISOString(),
  };
}

export function generateSlidePhotography(
  state: FounderCreativeIngestionState,
  slideId: string,
  falConfigured: boolean,
  dispatchFal = false,
): FounderCreativeIngestionState {
  const spec = state.reconstructionSpecs.find((s) => s.slideId === slideId);
  if (!spec) throw new Error('Slide spec not found');

  const result = dispatchPhotographyGeneration({ spec, falConfigured, dispatchFal });
  const specs = state.reconstructionSpecs.map((s) => (s.slideId === slideId ? result.spec : s));

  return {
    ...state,
    reconstructionSpecs: specs,
    falImageRequests: state.falImageRequests + (dispatchFal ? 1 : 0),
    falVideoRequests: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function replaceSlidePhotography(
  state: FounderCreativeIngestionState,
  slideId: string,
  newAssetId: string,
  previewUrl?: string,
): FounderCreativeIngestionState {
  const spec = state.reconstructionSpecs.find((s) => s.slideId === slideId);
  if (!spec) throw new Error('Slide spec not found');

  const preserved = replacePhotographyPreservesComposition(spec.layerModel, newAssetId);
  const priorSelected = spec.photography.selectedAssetId;
  const nextMode =
    spec.photography.sourceMode === 'USE_EXISTING_ASSET' || spec.photography.sourceMode === 'LOCK_CANONICAL'
      ? spec.photography.sourceMode
      : ('REPLACE' as const);

  const updatedSpec: SlideReconstructionSpec = {
    ...spec,
    photography: applyPhotographySourceMode(
      {
        ...spec.photography,
        lineageAssetIds: priorSelected
          ? [...spec.photography.lineageAssetIds, priorSelected]
          : spec.photography.lineageAssetIds,
      },
      nextMode,
      newAssetId,
    ),
    layerModel: { ...spec.layerModel, photograph: preserved.photograph },
    reviewStatus: 'RECONSTRUCTION_REVIEW',
  };

  const masterUrl = previewUrl ?? `/api/placeholder/founder-creative/hq/${newAssetId}`;
  const productionAsset: SlideProductionAsset = {
    assetId: newAssetId,
    slideId,
    sequenceId: spec.sequenceId,
    kind: 'PRODUCTION_ASSET',
    masterUrl,
    masterResolution: spec.targetResolution,
    derivativeUrls: {},
    approvedAt: null,
    lineageParentIds: priorSelected ? [priorSelected] : [],
  };

  return {
    ...state,
    reconstructionSpecs: state.reconstructionSpecs.map((s) =>
      s.slideId === slideId ? { ...updatedSpec, productionMasterUrl: masterUrl } : s,
    ),
    productionAssets: [...state.productionAssets.filter((a) => a.slideId !== slideId), productionAsset],
    updatedAt: new Date().toISOString(),
  };
}

export function applySlideReviewJudgment(
  state: FounderCreativeIngestionState,
  slideId: string,
  judgment: ReconstructionReviewJudgment,
): FounderCreativeIngestionState {
  const spec = state.reconstructionSpecs.find((s) => s.slideId === slideId);
  if (!spec) throw new Error('Slide spec not found');

  let reviewStatus = spec.reviewStatus;
  if (judgment === 'APPROVE_SLIDE' || judgment === 'MATCH') reviewStatus = 'APPROVED';
  else if (judgment === 'CLOSE_REVISE' || judgment === 'EDIT_COPY' || judgment === 'EDIT_PROMPT') reviewStatus = 'REVISE';
  else if (judgment === 'WRONG_INTERPRETATION') reviewStatus = 'PENDING';
  else reviewStatus = 'RECONSTRUCTION_REVIEW';

  const updated = { ...spec, reviewStatus };

  let productionAssets = state.productionAssets;
  if (reviewStatus === 'APPROVED') {
    const prodId = randomUUID();
    updated.productionAssetId = prodId;
    updated.productionMasterUrl = `/api/placeholder/founder-creative/slide/${prodId}`;
    productionAssets = [
      ...productionAssets.filter((a) => a.slideId !== slideId),
      {
        assetId: prodId,
        slideId,
        sequenceId: spec.sequenceId,
        kind: 'PRODUCTION_ASSET',
        masterUrl: updated.productionMasterUrl,
        masterResolution: spec.targetResolution,
        derivativeUrls: { instagram_4_5: updated.productionMasterUrl },
        approvedAt: new Date().toISOString(),
        lineageParentIds: spec.referenceAssetIds,
      },
    ];
  }

  return {
    ...state,
    workflowStep: 'REVIEW',
    reconstructionSpecs: state.reconstructionSpecs.map((s) => (s.slideId === slideId ? updated : s)),
    productionAssets,
    updatedAt: new Date().toISOString(),
  };
}

export function runSequenceLevelReview(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): { state: FounderCreativeIngestionState; report: ReturnType<typeof evaluateSequenceReview> } {
  const sequence = state.parentSequences.find((s) => s.sequenceId === sequenceId);
  if (!sequence) throw new Error('Sequence not found');

  const report = evaluateSequenceReview({
    sequence,
    specs: state.reconstructionSpecs,
  });

  const parentSequences = state.parentSequences.map((s) =>
    s.sequenceId === sequenceId
      ? {
          ...s,
          sequenceReviewStatus: report.passed ? ('APPROVED' as const) : ('IN_REVIEW' as const),
          reconstructionStatus: report.passed ? ('APPROVED' as const) : s.reconstructionStatus,
        }
      : s,
  );

  return {
    state: {
      ...state,
      workflowStep: 'SEQUENCE',
      parentSequences,
      updatedAt: new Date().toISOString(),
    },
    report,
  };
}

export function registerOnCampaignBoard(state: FounderCreativeIngestionState): FounderCreativeIngestionState {
  const signal = recordCreativeSignalLearning(state.parentSequences);
  return {
    ...state,
    workflowStep: 'CAMPAIGN',
    registeredOnCampaignBoard: true,
    creativeSignals: [...state.creativeSignals, signal],
    updatedAt: new Date().toISOString(),
  };
}

export function referenceIsNotProductionAsset(state: FounderCreativeIngestionState): boolean {
  return state.slideReferences.every(referenceRegionIsNotProductionAsset);
}

export function childSlidesUnderParent(state: FounderCreativeIngestionState): boolean {
  return state.parentSequences.every(
    (p) => p.slideIds.length > 0 && state.reconstructionSpecs.filter((s) => s.sequenceId === p.sequenceId).length === p.slideIds.length,
  );
}

export function topLevelShowsParentsOnly(parentCount: number): boolean {
  return parentCount === 3;
}

export function workflowStepOrder(): readonly string[] {
  return INGESTION_WORKFLOW_STEPS;
}

export function getParentSequencePresentation(sequences: FounderCreativeParentSequence[]) {
  return sequences.map((s) => ({
    sequenceId: s.sequenceId,
    title: s.title,
    role: s.role,
    slideCount: s.slideIds.length,
    origin: s.provenance.origin,
    status: s.provenance.canonStatus,
  }));
}
