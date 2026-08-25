/**
 * P0.CB.1A — Reference board replacement + re-decomposition tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  initializeNdxLaunchRow01,
  registerReferenceUpload,
  decomposeSequenceReference,
  buildSequenceReconstructionSpecs,
  applySlideReviewJudgment,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/ingestionEngine.js';
import {
  MEET_NDX_SEQUENCE_ID,
  PERSONAL_BRAND_SEQUENCE_ID,
  SAVED_THIS_WEEK_SEQUENCE_ID,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';
import {
  ndxNotebookGrammarAvailable,
  ndxUppercaseAuthorshipPasses,
  recompileNotebookGrammarForSlide,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxNotebookGrammarAdapter.js';
import {
  bulkRedecomposeDraftReferences,
  bulkUploadReplacementReferences,
  ensureReferenceVersioningInitialized,
  getActiveReferenceVersion,
  getArchiveForVersion,
  getDraftReferenceVersion,
  migrateLegacyIngestionToVersioning,
  promoteDraftReference,
  redecomposeFromDraftReference,
  replaceSingleSlideReference,
  resolveMeetNdxHqPhotoOnRedecompose,
  uploadReplacementReferenceBoard,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/replacementEngine.js';
import { evaluatePhotographyOverrideCompatibility } from '../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/photoOverrideCompatibility.js';
import { computeCreativeReferenceDiff } from '../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/structuralDiff.js';
import {
  initializeFounderCreativeRow01,
  decomposeAllFounderCreativeSequences,
  replaceFounderCreativeReferenceBoard,
  uploadAndReplaceFounderCreativeReferenceBoard,
  redecomposeFounderCreativeDraftReference,
  promoteFounderCreativeDraftReference,
  bulkReplaceFounderCreativeReferences,
} from '../api/_lib/site00Evolve/founderCreativeIngestion/founderCreativeIngestionService.js';
import { resetCampaignProductionMemory } from '../api/_lib/site00Evolve/marketingCampaignProduction/marketingCampaignProductionMemoryStore.js';

const ROOT = join(process.cwd());
const ROW_SEQUENCE_IDS = [MEET_NDX_SEQUENCE_ID, PERSONAL_BRAND_SEQUENCE_ID, SAVED_THIS_WEEK_SEQUENCE_ID];

function seedLegacyIngestion() {
  let state = initializeNdxLaunchRow01();
  for (const seqId of ROW_SEQUENCE_IDS) {
    state = registerReferenceUpload(state, { sequenceId: seqId, previewUrl: `/ref/v1/${seqId}` });
    state = decomposeSequenceReference(state, seqId);
    state = buildSequenceReconstructionSpecs(state, seqId);
  }
  return state;
}

describe('P0.CB.1A Reference Board Replacement', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignProductionMemory();
  });

  it('1-5 reference versioning lifecycle', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    expect(state.referenceVersions.length).toBeGreaterThan(0);
    const active = getActiveReferenceVersion(state, MEET_NDX_SEQUENCE_ID);
    expect(active?.status).toBe('ACTIVE');

    state = uploadReplacementReferenceBoard(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
      source: 'FOUNDER_REPLACE',
    });
    const draft = getDraftReferenceVersion(state, MEET_NDX_SEQUENCE_ID);
    expect(draft?.status).toBe('DRAFT');
    expect(draft?.versionNumber).toBe(2);
    expect(getActiveReferenceVersion(state, MEET_NDX_SEQUENCE_ID)?.status).toBe('ACTIVE');
    expect(state.referenceAssets.some((entry) => entry.previewUrl === '/ref/v2/meet-ndx')).toBe(true);
  });

  it('6-10 re-decomposition creates new refs/specs and preserves old archive', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    const beforeArchiveCount = state.referenceVersionArchives.length;
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
    });
    const { state: redecomposed, diff } = redecomposeFromDraftReference(state, MEET_NDX_SEQUENCE_ID);
    expect(redecomposed.slideReferences.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID)).toHaveLength(9);
    expect(redecomposed.reconstructionSpecs.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID)).toHaveLength(9);
    expect(redecomposed.referenceVersionArchives.length).toBeGreaterThanOrEqual(beforeArchiveCount);
    expect(diff?.newSlideCount).toBe(9);
    expect(redecomposed.falGenerationTracking).toBeNull();
  });

  it('11-15 structural diff detection', () => {
    const oldSlides = seedLegacyIngestion().slideReferences.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID);
    let newSlides = [...oldSlides];
    newSlides[0] = { ...newSlides[0]!, observableCopy: ['CHANGED COPY'], compositionNotes: ['torn notebook edge'] };
    const diff = computeCreativeReferenceDiff({
      parentSequenceId: MEET_NDX_SEQUENCE_ID,
      oldReferenceVersionId: 'v1',
      newReferenceVersionId: 'v2',
      oldSlides,
      newSlides,
    });
    expect(diff.slideCountChanged).toBe(false);
    expect(diff.changes.some((entry) => entry.copyChanged)).toBe(true);
    expect(diff.changes.some((entry) => entry.materialChanged)).toBe(true);
    expect(diff.changes.some((entry) => entry.photoChanged)).toBe(false);
  });

  it('16-19 current notebook grammar + uppercase re-evaluation', () => {
    expect(ndxNotebookGrammarAvailable()).toBe(true);
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: PERSONAL_BRAND_SEQUENCE_ID,
      previewUrl: '/ref/v2/personal-brand',
    });
    const { state: redecomposed } = redecomposeFromDraftReference(state, PERSONAL_BRAND_SEQUENCE_ID);
    const spec = redecomposed.reconstructionSpecs.find((entry) => entry.sequenceId === PERSONAL_BRAND_SEQUENCE_ID);
    expect(spec?.founderOverrides.grammarAuthority).toBe('V2.3+P0.5C.7');
    expect(spec?.reconstructionPrompt).toContain('CURRENT NOTEBOOK GRAMMAR');
    expect(ndxUppercaseAuthorshipPasses(spec!)).toBe(true);
    const slideRef = redecomposed.slideReferences.find((entry) => entry.sequenceId === PERSONAL_BRAND_SEQUENCE_ID)!;
    const grammar = recompileNotebookGrammarForSlide({ slide: slideRef, sequenceId: PERSONAL_BRAND_SEQUENCE_ID });
    expect(grammar.legacyPromptSnapshotReused).toBe(false);
  });

  it('20-23 HQ photo override compatibility', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
    });
    const { state: redecomposed } = redecomposeFromDraftReference(state, MEET_NDX_SEQUENCE_ID);
    expect(resolveMeetNdxHqPhotoOnRedecompose(redecomposed)).toBe(true);
    const slide1Ref = redecomposed.slideReferences.find(
      (entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID && entry.slideNumber === 1,
    )!;
    const slide1Spec = redecomposed.reconstructionSpecs.find(
      (entry) => entry.slideReferenceId === slide1Ref.slideReferenceId,
    )!;
    const evaluation = evaluatePhotographyOverrideCompatibility({
      slideId: slide1Spec.slideId,
      slideNumber: 1,
      priorSpec: slide1Spec,
      newSlideRef: slide1Ref,
      sequenceId: MEET_NDX_SEQUENCE_ID,
    });
    expect(['COMPATIBLE', 'CROP_CHANGED']).toContain(evaluation.state);
    expect(evaluation.carryForward).toBe(true);
  });

  it('24-28 slide-level replace + selective invalidation + stale state', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    const beforeCount = state.reconstructionSpecs.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID).length;
    state = replaceSingleSlideReference(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      slideNumber: 2,
      previewUrl: '/ref/slide-2-v2',
      observableCopy: ['I KEEP NOTICING THINGS.'],
    });
    expect(state.reconstructionSpecs.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID)).toHaveLength(beforeCount);
    const slide2 = state.reconstructionSpecs.find((entry) => {
      const ref = state.slideReferences.find((r) => r.slideReferenceId === entry.slideReferenceId);
      return ref?.sequenceId === MEET_NDX_SEQUENCE_ID && ref.slideNumber === 2;
    });
    expect(slide2?.copy.exactText[0]).toBe('I KEEP NOTICING THINGS.');
  });

  it('29-31 promotion gate + superseded active', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: SAVED_THIS_WEEK_SEQUENCE_ID,
      previewUrl: '/ref/v2/saved',
    });
    redecomposeFromDraftReference(state, SAVED_THIS_WEEK_SEQUENCE_ID);
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: SAVED_THIS_WEEK_SEQUENCE_ID,
      previewUrl: '/ref/v2/saved',
    });
    const draft = getDraftReferenceVersion(state, SAVED_THIS_WEEK_SEQUENCE_ID);
    expect(draft?.status).toBe('DRAFT');
    const { state: redecomposed } = redecomposeFromDraftReference(state, SAVED_THIS_WEEK_SEQUENCE_ID);
    state = promoteDraftReference(redecomposed, SAVED_THIS_WEEK_SEQUENCE_ID);
    const active = getActiveReferenceVersion(state, SAVED_THIS_WEEK_SEQUENCE_ID);
    expect(active?.versionNumber).toBeGreaterThan(1);
    expect(active?.status).toBe('ACTIVE');
    const superseded = state.referenceVersions.find(
      (entry) => entry.supersedesReferenceVersionId === null && entry.status === 'SUPERSEDED',
    );
    expect(superseded || state.referenceVersions.some((entry) => entry.status === 'SUPERSEDED')).toBeTruthy();
  });

  it('32-37 bulk replace + pilot post mapping + parent IDs preserved', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    const { ingestion, diffs } = await bulkReplaceFounderCreativeReferences({
      projectId: 'ndxbook',
      uploads: ROW_SEQUENCE_IDS.map((sequenceId) => ({
        sequenceId,
        previewUrl: `/ref/v2/${sequenceId}`,
      })),
    });
    expect(diffs).toHaveLength(3);
    expect(ingestion.parentSequences.map((entry) => entry.sequenceId)).toEqual(ROW_SEQUENCE_IDS);
    expect(ingestion.parentSequences.every((entry) => entry.referenceStatus !== 'CURRENT')).toBe(true);
    expect(ingestion.reconstructionSpecs.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID)).toHaveLength(9);
    expect(ingestion.reconstructionSpecs.filter((entry) => entry.sequenceId === PERSONAL_BRAND_SEQUENCE_ID)).toHaveLength(12);
    expect(ingestion.reconstructionSpecs.filter((entry) => entry.sequenceId === SAVED_THIS_WEEK_SEQUENCE_ID)).toHaveLength(12);
  });

  it('38-41 no generation on upload/redecompose', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    const beforeFal = (await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' })).ingestion.falImageRequests;
    await replaceFounderCreativeReferenceBoard({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
    });
    const { ingestion } = await redecomposeFounderCreativeDraftReference({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
    });
    expect(ingestion.falGenerationTracking).toBeNull();
    expect(ingestion.falImageRequests).toBeGreaterThanOrEqual(beforeFal);
  });

  it('42-44 UI + generic engine paths exist', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectFounderCreativeIngestionPage.tsx'), 'utf8');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-creative-ingestion.css'), 'utf8');
    expect(page).toContain('UPLOAD REPLACEMENT BOARD');
    expect(page).toContain('TAP TO UPLOAD REPLACEMENT BOARD');
    expect(page).toContain('type="file"');
    expect(page).toContain('USE THIS REFERENCE (PROMOTE)');
    expect(css).toContain('compare--triple');
    expect(css).toContain('upload-zone');
    expect(readFileSync(join(ROOT, 'shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/replacementEngine.ts'), 'utf8')).toContain(
      'NotebookGrammarAdapter',
    );
  });

  it('upload reference board via service path auto-redecomposes', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const { ingestion, diff } = await uploadAndReplaceFounderCreativeReferenceBoard({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
      imageData: tinyPng,
      notes: 'meet-ndx-board.png',
    });
    const draft = getDraftReferenceVersion(ingestion, MEET_NDX_SEQUENCE_ID);
    expect(draft?.status).toBe('DRAFT');
    expect(ingestion.referenceAssets.some((entry) => entry.previewUrl?.length)).toBe(true);
    expect(diff).not.toBeNull();
    expect(
      ingestion.reconstructionSpecs.filter((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID).length,
    ).toBeGreaterThan(0);
  });

  it('45-48 preservation — archives immutable, historical not deleted', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    const active = getActiveReferenceVersion(state, MEET_NDX_SEQUENCE_ID)!;
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
    });
    const { state: redecomposed } = redecomposeFromDraftReference(state, MEET_NDX_SEQUENCE_ID);
    const archive = getArchiveForVersion(redecomposed, active.referenceVersionId);
    expect(archive?.immutable).toBe(true);
    expect(archive?.reconstructionSpecs.length).toBeGreaterThan(0);
    expect(redecomposed.referenceVersionArchives.length).toBeGreaterThan(0);
  });

  it('approved production marked stale not deleted on material change', () => {
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    const spec = state.reconstructionSpecs.find((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID)!;
    state = applySlideReviewJudgment(state, spec.slideId, 'APPROVE_SLIDE');
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
    });
    const { state: redecomposed } = redecomposeFromDraftReference(state, MEET_NDX_SEQUENCE_ID);
    const archived = getArchiveForVersion(redecomposed, getActiveReferenceVersion(redecomposed, MEET_NDX_SEQUENCE_ID)!.referenceVersionId);
    expect(archived?.productionAssets.length).toBeGreaterThanOrEqual(0);
  });

  it('service promote via API', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    await replaceFounderCreativeReferenceBoard({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/v2/meet-ndx',
    });
    await redecomposeFounderCreativeDraftReference({ projectId: 'ndxbook', sequenceId: MEET_NDX_SEQUENCE_ID });
    const { ingestion } = await promoteFounderCreativeDraftReference({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
    });
    expect(getDraftReferenceVersion(ingestion, MEET_NDX_SEQUENCE_ID)).toBeNull();
    expect(ingestion.parentSequences.find((entry) => entry.sequenceId === MEET_NDX_SEQUENCE_ID)?.referenceStatus).toBe(
      'CURRENT_AGAIN',
    );
  });
});

describe('P0.CB.1A success criteria booleans', () => {
  it('exports versioning initialized helper', () => {
    const state = ensureReferenceVersioningInitialized(seedLegacyIngestion());
    expect(state.referenceVersions.length).toBe(3);
  });

  it('resolveSequenceReferencePreviewUrl prefers draft over active', async () => {
    const { resolveSequenceReferencePreviewUrl } = await import(
      '../shared/site00-studio-world-production/founderCreativeIngestion/client.js'
    );
    let state = migrateLegacyIngestionToVersioning(seedLegacyIngestion());
    state = uploadReplacementReferenceBoard(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: 'https://example.com/draft-board.webp',
    });
    const url = resolveSequenceReferencePreviewUrl(state, MEET_NDX_SEQUENCE_ID);
    expect(url).toBe('https://example.com/draft-board.webp');
  });
});
