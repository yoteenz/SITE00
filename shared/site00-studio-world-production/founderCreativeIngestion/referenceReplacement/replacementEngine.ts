/**
 * P0.CB.1A — Reference replacement orchestration (generic Studio World engine).
 */

import { randomUUID } from 'node:crypto';
import {
  applyNotebookGrammarToSpec,
  recompileNotebookGrammarForSlide,
} from '../adapters/ndxNotebookGrammarAdapter.js';
import {
  defaultPhotoSourceModeForSequence,
  MEET_NDX_SEQUENCE_ID,
  ndxGridForSequence,
  slideSeedsForSequence,
} from '../adapters/ndxLaunchRow01Pilot.js';
import {
  resolveReconstructionPhotographyModes,
} from '../ingestionEngine.js';
import { buildReferenceBoard, decomposeReferenceBoard } from '../referenceDecomposition.js';
import { buildSlideReconstructionSpec } from '../slideReconstructionSpec.js';
import { runSequenceLevelReview } from '../ingestionEngine.js';
import type { FounderCreativeIngestionState, SlideReference } from '../types.js';
import {
  applyCompatiblePhotoOverride,
  evaluatePhotographyOverrideCompatibility,
} from './photoOverrideCompatibility.js';
import {
  archiveActiveReferenceVersion,
  createDraftReferenceVersion,
  ensureReferenceVersioningInitialized,
  getActiveReferenceVersion,
  getArchiveForVersion,
  getDraftReferenceVersion,
  promoteDraftReferenceVersion,
  versionedReferenceAssetId,
} from './referenceVersioning.js';
import { computeCreativeReferenceDiff } from './structuralDiff.js';
import { invalidateSlideDownstream, siblingSlidesPreserved } from './selectiveInvalidation.js';
import type { CreativeReferenceDiff, PhotographyOverrideCompatibilityEvaluation } from './types.js';

export type NotebookGrammarAdapter = {
  recompileForSlide: typeof recompileNotebookGrammarForSlide;
  applyToSpec: typeof applyNotebookGrammarToSpec;
};

const defaultNotebookAdapter: NotebookGrammarAdapter = {
  recompileForSlide: recompileNotebookGrammarForSlide,
  applyToSpec: applyNotebookGrammarToSpec,
};

function decomposeAgainstAsset(
  state: FounderCreativeIngestionState,
  sequenceId: string,
  referenceAssetId: string,
  referenceVersionId: string,
): FounderCreativeIngestionState {
  const asset = state.referenceAssets.find((entry) => entry.assetId === referenceAssetId);
  if (!asset) throw new Error(`Reference asset ${referenceAssetId} not found`);

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
  }).map((slide) => ({
    ...slide,
    referenceAssetIds: [asset.assetId],
    boardId: board.boardId,
  }));

  const updatedBoard = {
    ...board,
    decomposedAt: new Date().toISOString(),
    slideReferenceIds: slideRefs.map((slide) => slide.slideReferenceId),
  };

  const parentSequences = state.parentSequences.map((entry) =>
    entry.sequenceId === sequenceId
      ? {
          ...entry,
          referenceBoardId: updatedBoard.boardId,
          reconstructionStatus: 'IN_PROGRESS' as const,
          referenceStatus: 'REDECOMPOSITION_READY' as const,
        }
      : entry,
  );

  const updatedVersions = state.referenceVersions.map((entry) =>
    entry.referenceVersionId === referenceVersionId ? { ...entry, boardId: updatedBoard.boardId } : entry,
  );

  return {
    ...state,
    workflowStep: 'DECOMPOSE',
    referenceBoards: [...state.referenceBoards.filter((entry) => entry.sequenceId !== sequenceId), updatedBoard],
    slideReferences: [...state.slideReferences.filter((entry) => entry.sequenceId !== sequenceId), ...slideRefs],
    parentSequences,
    referenceVersions: updatedVersions,
    updatedAt: new Date().toISOString(),
  };
}

function buildSpecsWithCurrentGrammar(
  state: FounderCreativeIngestionState,
  sequenceId: string,
  adapter: NotebookGrammarAdapter,
  priorSpecs: import('../types.js').SlideReconstructionSpec[],
): FounderCreativeIngestionState {
  const slideRefs = state.slideReferences.filter((entry) => entry.sequenceId === sequenceId);
  const priorByNumber = new Map<number, import('../types.js').SlideReconstructionSpec>();
  for (const spec of priorSpecs) {
    const ref = state.slideReferences.find((entry) => entry.slideReferenceId === spec.slideReferenceId);
    if (ref) priorByNumber.set(ref.slideNumber, spec);
  }

  const specs = slideRefs.map((slide) => {
    const base = buildSlideReconstructionSpec({
      slide,
      defaultPhotoSourceMode: defaultPhotoSourceModeForSequence(sequenceId),
      characterIdentityStatus: state.characterIdentity.status,
      canonicalCharacterRef: state.characterIdentity.canonicalReferenceAssetId,
    });
    const grammar = adapter.recompileForSlide({ slide, sequenceId });
    let compiled = adapter.applyToSpec(base, slide, grammar);
    const prior = priorByNumber.get(slide.slideNumber) ?? null;
    const photoEval = evaluatePhotographyOverrideCompatibility({
      slideId: compiled.slideId,
      slideNumber: slide.slideNumber,
      priorSpec: prior,
      newSlideRef: slide,
      sequenceId,
    });
    compiled = applyCompatiblePhotoOverride(compiled, photoEval);
    const changed =
      !prior ||
      prior.copy.exactText.join('|') !== compiled.copy.exactText.join('|') ||
      prior.composition.layoutGrammar !== compiled.composition.layoutGrammar;
    const { spec } = invalidateSlideDownstream({
      slideId: compiled.slideId,
      spec: compiled,
      photoEvaluation: photoEval,
      siblingSlideIds: slideRefs.map((entry) => entry.slideReferenceId),
      changedMaterially: changed,
    });
    return spec;
  });

  const parentSequences = state.parentSequences.map((entry) =>
    entry.sequenceId === sequenceId
      ? {
          ...entry,
          slideIds: specs.map((spec) => spec.slideId),
          referenceStatus: 'REVIEW_REQUIRED' as const,
        }
      : entry,
  );

  return {
    ...state,
    workflowStep: 'RECONSTRUCT',
    reconstructionSpecs: [
      ...state.reconstructionSpecs.filter((entry) => entry.sequenceId !== sequenceId),
      ...specs,
    ],
    parentSequences,
    updatedAt: new Date().toISOString(),
  };
}

export function uploadReplacementReferenceBoard(
  state: FounderCreativeIngestionState,
  params: {
    sequenceId: string;
    previewUrl: string | null;
    storagePath?: string | null;
    reason?: string | null;
    notes?: string | null;
    source?: import('./types.js').CreativeReferenceVersion['source'];
  },
): FounderCreativeIngestionState {
  let next = ensureReferenceVersioningInitialized(state);
  next = archiveActiveReferenceVersion(next, params.sequenceId);
  const { state: withDraft } = createDraftReferenceVersion(next, {
    sequenceId: params.sequenceId,
    previewUrl: params.previewUrl,
    storagePath: params.storagePath,
    source: params.source ?? 'FOUNDER_REPLACE',
    reason: params.reason,
    notes: params.notes,
  });
  return { ...withDraft, falGenerationTracking: null, updatedAt: new Date().toISOString() };
}

export function redecomposeFromDraftReference(
  state: FounderCreativeIngestionState,
  sequenceId: string,
  adapter: NotebookGrammarAdapter = defaultNotebookAdapter,
): { state: FounderCreativeIngestionState; diff: CreativeReferenceDiff | null } {
  let next = ensureReferenceVersioningInitialized(state);
  const draft = getDraftReferenceVersion(next, sequenceId);
  if (!draft) throw new Error('No draft reference — upload replacement board first');

  const active = getActiveReferenceVersion(next, sequenceId);
  const activeArchive = active ? getArchiveForVersion(next, active.referenceVersionId) : null;
  const oldSlides = activeArchive?.slideReferences ?? next.slideReferences.filter((entry) => entry.sequenceId === sequenceId);
  const priorSpecs = activeArchive?.reconstructionSpecs ?? next.reconstructionSpecs.filter((entry) => entry.sequenceId === sequenceId);

  next = decomposeAgainstAsset(next, sequenceId, draft.referenceAssetId, draft.referenceVersionId);
  next = buildSpecsWithCurrentGrammar(next, sequenceId, adapter, priorSpecs);
  next = resolveReconstructionPhotographyModes(next, sequenceId);

  const newSlides = next.slideReferences.filter((entry) => entry.sequenceId === sequenceId);
  const diff = computeCreativeReferenceDiff({
    parentSequenceId: sequenceId,
    oldReferenceVersionId: active?.referenceVersionId ?? null,
    newReferenceVersionId: draft.referenceVersionId,
    oldSlides,
    newSlides,
  });

  return {
    state: {
      ...next,
      referenceDiffs: [...next.referenceDiffs.filter((entry) => entry.parentSequenceId !== sequenceId), diff],
      falGenerationTracking: null,
      updatedAt: new Date().toISOString(),
    },
    diff,
  };
}

export function promoteDraftReference(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): FounderCreativeIngestionState {
  let next = ensureReferenceVersioningInitialized(state);
  next = archiveActiveReferenceVersion(next, sequenceId);
  next = promoteDraftReferenceVersion(next, sequenceId);
  return next;
}

export function replaceSingleSlideReference(
  state: FounderCreativeIngestionState,
  params: {
    sequenceId: string;
    slideNumber: number;
    previewUrl: string | null;
    compositionNotes?: string[];
    observableCopy?: string[];
  },
  adapter: NotebookGrammarAdapter = defaultNotebookAdapter,
): FounderCreativeIngestionState {
  let next = ensureReferenceVersioningInitialized(state);
  const slideRefs = next.slideReferences.filter((entry) => entry.sequenceId === params.sequenceId);
  const target = slideRefs.find((entry) => entry.slideNumber === params.slideNumber);
  if (!target) throw new Error(`Slide ${params.slideNumber} not found`);

  const updatedRef: SlideReference = {
    ...target,
    slideReferenceId: randomUUID(),
    observableCopy: params.observableCopy ?? target.observableCopy,
    compositionNotes: params.compositionNotes ?? target.compositionNotes,
    confidence: 0.95,
  };

  const priorSpec = next.reconstructionSpecs.find(
    (entry) => entry.slideReferenceId === target.slideReferenceId,
  );

  next = {
    ...next,
    slideReferences: slideRefs.map((entry) => (entry.slideNumber === params.slideNumber ? updatedRef : entry)),
  };

  const base = buildSlideReconstructionSpec({
    slide: updatedRef,
    defaultPhotoSourceMode: defaultPhotoSourceModeForSequence(params.sequenceId),
    characterIdentityStatus: next.characterIdentity.status,
    canonicalCharacterRef: next.characterIdentity.canonicalReferenceAssetId,
  });
  const grammar = adapter.recompileForSlide({ slide: updatedRef, sequenceId: params.sequenceId });
  let compiled = adapter.applyToSpec(base, updatedRef, grammar);
  const photoEval = evaluatePhotographyOverrideCompatibility({
    slideId: compiled.slideId,
    slideNumber: params.slideNumber,
    priorSpec: priorSpec ?? null,
    newSlideRef: updatedRef,
    sequenceId: params.sequenceId,
  });
  compiled = applyCompatiblePhotoOverride(compiled, photoEval);
  const { spec } = invalidateSlideDownstream({
    slideId: compiled.slideId,
    spec: compiled,
    photoEvaluation: photoEval,
    siblingSlideIds: slideRefs.map((entry) => entry.slideReferenceId),
    changedMaterially: true,
  });

  siblingSlidesPreserved(next.reconstructionSpecs, [target.slideReferenceId], params.sequenceId);

  return {
    ...next,
    reconstructionSpecs: next.reconstructionSpecs.map((entry) =>
      entry.slideReferenceId === target.slideReferenceId ? spec : entry,
    ),
    parentSequences: next.parentSequences.map((entry) =>
      entry.sequenceId === params.sequenceId
        ? { ...entry, referenceStatus: 'REVIEW_REQUIRED' as const }
        : entry,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function bulkUploadReplacementReferences(
  state: FounderCreativeIngestionState,
  uploads: Array<{
    sequenceId: string;
    previewUrl: string | null;
    storagePath?: string | null;
    notes?: string | null;
  }>,
): FounderCreativeIngestionState {
  return uploads.reduce(
    (acc, upload) =>
      uploadReplacementReferenceBoard(acc, {
        sequenceId: upload.sequenceId,
        previewUrl: upload.previewUrl,
        storagePath: upload.storagePath,
        notes: upload.notes,
        source: 'BULK_REPLACE',
      }),
    state,
  );
}

export function bulkRedecomposeDraftReferences(
  state: FounderCreativeIngestionState,
  sequenceIds: string[],
  adapter: NotebookGrammarAdapter = defaultNotebookAdapter,
): { state: FounderCreativeIngestionState; diffs: CreativeReferenceDiff[] } {
  let next = state;
  const diffs: CreativeReferenceDiff[] = [];
  for (const sequenceId of sequenceIds) {
    const result = redecomposeFromDraftReference(next, sequenceId, adapter);
    next = result.state;
    if (result.diff) diffs.push(result.diff);
  }
  return { state: next, diffs };
}

export function rerunSequenceQAAfterRedecomposition(
  state: FounderCreativeIngestionState,
  sequenceId: string,
) {
  return runSequenceLevelReview(state, sequenceId);
}

export function getPhotoCompatibilityForSequence(
  state: FounderCreativeIngestionState,
  sequenceId: string,
): PhotographyOverrideCompatibilityEvaluation[] {
  const specs = state.reconstructionSpecs.filter((entry) => entry.sequenceId === sequenceId);
  const active = getActiveReferenceVersion(state, sequenceId);
  const archive = active ? getArchiveForVersion(state, active.referenceVersionId) : null;
  const priorSpecs = archive?.reconstructionSpecs ?? [];

  return specs.map((spec) => {
    const slideRef = state.slideReferences.find((entry) => entry.slideReferenceId === spec.slideReferenceId);
    const prior = priorSpecs.find((entry) => {
      const priorRef = archive?.slideReferences.find((ref) => ref.slideReferenceId === entry.slideReferenceId);
      return priorRef?.slideNumber === slideRef?.slideNumber;
    });
    return evaluatePhotographyOverrideCompatibility({
      slideId: spec.slideId,
      slideNumber: slideRef?.slideNumber ?? 0,
      priorSpec: prior ?? null,
      newSlideRef: slideRef!,
      sequenceId,
    });
  });
}

export function resolveMeetNdxHqPhotoOnRedecompose(state: FounderCreativeIngestionState): boolean {
  const specs = state.reconstructionSpecs.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID);
  const slide1Ref = state.slideReferences.find(
    (entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID && entry.slideNumber === 1,
  );
  const slide1Spec = specs.find((entry) => entry.slideReferenceId === slide1Ref?.slideReferenceId);
  return slide1Spec?.photography.sourceMode === 'USE_EXISTING_ASSET';
}

/** Initial migration helper — uses legacy decompose then seeds v1 archive */
export function migrateLegacyIngestionToVersioning(
  state: FounderCreativeIngestionState,
): FounderCreativeIngestionState {
  return ensureReferenceVersioningInitialized(state);
}

export {
  ensureReferenceVersioningInitialized,
  getActiveReferenceVersion,
  getDraftReferenceVersion,
  getArchiveForVersion,
  versionedReferenceAssetId,
};
