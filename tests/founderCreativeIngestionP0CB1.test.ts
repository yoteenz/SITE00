/**
 * P0.CB.1 — Founder creative ingestion tests.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  initializeNdxLaunchRow01,
  registerReferenceUpload,
  decomposeSequenceReference,
  buildSequenceReconstructionSpecs,
  setPhotographySourceMode,
  editSlidePrompt,
  generateSlidePhotography,
  replaceSlidePhotography,
  applySlideReviewJudgment,
  runSequenceLevelReview,
  registerOnCampaignBoard,
  referenceIsNotProductionAsset,
  childSlidesUnderParent,
  topLevelShowsParentsOnly,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/ingestionEngine.js';
import {
  MEET_NDX_SEQUENCE_ID,
  PERSONAL_BRAND_SEQUENCE_ID,
  SAVED_THIS_WEEK_SEQUENCE_ID,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';
import {
  referenceRegionIsNotProductionAsset,
  decomposeReferenceBoard,
  buildReferenceBoard,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/referenceDecomposition.js';
import { meetNdxSlideSeeds } from '../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';
import {
  buildFounderCreativeAssetRecord,
  founderCreatedProvenancePersists,
  referenceAssetIsDistinctFromProduction,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/assetRecordBuilder.js';
import { NDX_FOUNDER_CREATIVE_PROVENANCE } from '../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';
import { learningPreservesVariationNotTemplateCloning, recordCreativeSignalLearning } from '../shared/site00-studio-world-production/founderCreativeIngestion/creativeSignalLearning.js';
import { realismLabReusedNotDuplicated } from '../shared/site00-studio-world-production/founderCreativeIngestion/realismLabBridge.js';
import { resolveCampaignBoardLanes } from '../src/site00/components/founderWorkspace/campaignBoardLaneSchema.js';
import {
  initializeFounderCreativeRow01,
  decomposeAllFounderCreativeSequences,
  registerFounderCreativeOnCampaignBoard,
} from '../api/_lib/site00Evolve/founderCreativeIngestion/founderCreativeIngestionService.js';
import { resetCampaignProductionMemory } from '../api/_lib/site00Evolve/marketingCampaignProduction/marketingCampaignProductionMemoryStore.js';

const ROOT = join(process.cwd());

describe('P0.CB.1 Founder Creative Ingestion', () => {
  beforeEach(() => {
    process.env.VITEST = 'true';
    resetCampaignProductionMemory();
  });

  it('FOUNDER_CREATED provenance persists', () => {
    expect(founderCreatedProvenancePersists(NDX_FOUNDER_CREATIVE_PROVENANCE)).toBe(true);
    expect(NDX_FOUNDER_CREATIVE_PROVENANCE.generationProvenance).toBe('EXTERNAL_CHATGPT_CREATIVE_SESSION');
  });

  it('reference != production asset', () => {
    expect(referenceAssetIsDistinctFromProduction('ref-1', 'prod-1')).toBe(true);
    const board = buildReferenceBoard({
      sequenceId: 'seq-1',
      referenceAssetId: 'ref-board',
      gridRows: 3,
      gridCols: 3,
      slideCount: 9,
    });
    const slides = decomposeReferenceBoard({ board, slideSeeds: meetNdxSlideSeeds() });
    expect(slides.every(referenceRegionIsNotProductionAsset)).toBe(true);
  });

  it('composite reference decomposes into slide references', () => {
    let state = initializeNdxLaunchRow01();
    state = registerReferenceUpload(state, {
      sequenceId: MEET_NDX_SEQUENCE_ID,
      previewUrl: '/ref/meet-ndx',
    });
    state = decomposeSequenceReference(state, MEET_NDX_SEQUENCE_ID);
    expect(state.slideReferences.filter((s) => s.sequenceId === MEET_NDX_SEQUENCE_ID)).toHaveLength(9);
  });

  it('photography source modes supported', () => {
    let state = initializeNdxLaunchRow01();
    state = registerReferenceUpload(state, { sequenceId: MEET_NDX_SEQUENCE_ID, previewUrl: '/ref' });
    state = decomposeSequenceReference(state, MEET_NDX_SEQUENCE_ID);
    state = buildSequenceReconstructionSpecs(state, MEET_NDX_SEQUENCE_ID);
    const slideId = state.reconstructionSpecs.find((s) => s.sequenceId === MEET_NDX_SEQUENCE_ID)!.slideId;

    for (const mode of [
      'REFERENCE_ONLY',
      'GENERATE_FROM_REFERENCE',
      'UPLOAD_HQ',
      'USE_EXISTING_ASSET',
      'REPLACE',
      'LOCK_CANONICAL',
    ] as const) {
      state = setPhotographySourceMode(state, slideId, mode, 'asset-test');
      expect(state.reconstructionSpecs.find((s) => s.slideId === slideId)!.photography.sourceMode).toBe(mode);
    }
  });

  it('replacing photography preserves composition and lineage', () => {
    let state = initializeNdxLaunchRow01();
    state = registerReferenceUpload(state, { sequenceId: PERSONAL_BRAND_SEQUENCE_ID, previewUrl: '/ref' });
    state = decomposeSequenceReference(state, PERSONAL_BRAND_SEQUENCE_ID);
    state = buildSequenceReconstructionSpecs(state, PERSONAL_BRAND_SEQUENCE_ID);
    const slideId = state.reconstructionSpecs.find((s) => s.sequenceId === PERSONAL_BRAND_SEQUENCE_ID)!.slideId;
    state = setPhotographySourceMode(state, slideId, 'GENERATE_FROM_REFERENCE');
    state = generateSlidePhotography(state, slideId, false, false);
    const beforeTypography = state.reconstructionSpecs.find((s) => s.slideId === slideId)!.layerModel.typography;
    state = replaceSlidePhotography(state, slideId, 'hq-photo-1');
    const after = state.reconstructionSpecs.find((s) => s.slideId === slideId)!;
    expect(after.layerModel.typography).toBe(beforeTypography);
    expect(after.photography.lineageAssetIds.length).toBeGreaterThan(0);
  });

  it('reconstruction prompt is founder editable', () => {
    let state = initializeNdxLaunchRow01();
    state = registerReferenceUpload(state, { sequenceId: MEET_NDX_SEQUENCE_ID, previewUrl: '/ref' });
    state = decomposeSequenceReference(state, MEET_NDX_SEQUENCE_ID);
    state = buildSequenceReconstructionSpecs(state, MEET_NDX_SEQUENCE_ID);
    const slideId = state.reconstructionSpecs[0]!.slideId;
    state = editSlidePrompt(state, slideId, 'Custom founder prompt');
    expect(state.reconstructionSpecs[0]!.photography.promptEditedByFounder).toBe(true);
  });

  it('generation is founder-triggered only — no auto on init', () => {
    const state = initializeNdxLaunchRow01();
    expect(state.falImageRequests).toBe(0);
    expect(state.falVideoRequests).toBe(0);
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectFounderCreativeIngestionPage.tsx'), 'utf8');
    const mountEffect = page.match(/useEffect\(\(\) => \{[\s\S]*?\}, \[reload\]\);/)?.[0] ?? '';
    expect(mountEffect).not.toContain('founderCreativeIngestionGeneratePhoto');
    expect(mountEffect).not.toContain('founderCreativeIngestionDecomposeAll');
    expect(page).toContain('GENERATE PHOTO (founder trigger)');
  });

  it('Realism Lab reused not duplicated', () => {
    expect(realismLabReusedNotDuplicated()).toBe(true);
  });

  it('three pilot posts as parent sequences + child slides preserved', async () => {
    const { ingestion } = await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    expect(ingestion.parentSequences).toHaveLength(3);
    expect(topLevelShowsParentsOnly(ingestion.parentSequences.length)).toBe(true);

    const { ingestion: decomposed } = await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    expect(decomposed.reconstructionSpecs).toHaveLength(9 + 12 + 12);
    expect(childSlidesUnderParent(decomposed)).toBe(true);
    expect(referenceIsNotProductionAsset(decomposed)).toBe(true);
  });

  it('campaign board shows three parents not flattened child slides', async () => {
    let { run } = await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    ({ run } = await registerFounderCreativeOnCampaignBoard({ projectId: 'ndxbook' }));

    const lanes = resolveCampaignBoardLanes(run);
    const pages = lanes.find((l) => l.laneId === 'PAGES')!;
    expect(pages.slots).toHaveLength(3);
    expect(pages.slots.map((s) => s.title)).toEqual([
      'MEET NDX',
      'EVERYBODY HAS A PERSONAL BRAND',
      'THINGS I SAVED THIS WEEK',
    ]);
    expect(run.board!.assets.every((a) => a.parentAssetId === null)).toBe(true);
  });

  it('learning signal records variation not template cloning', () => {
    const state = initializeNdxLaunchRow01();
    const registered = registerOnCampaignBoard(state);
    const signal = registered.creativeSignals[0]!;
    expect(learningPreservesVariationNotTemplateCloning(signal)).toBe(true);
    expect(signal.principles.some((p) => p.includes('DIFFERENT visual territories'))).toBe(true);
  });

  it('sequence QA runs after slide reconstruction', () => {
    let state = initializeNdxLaunchRow01();
    state = registerReferenceUpload(state, { sequenceId: MEET_NDX_SEQUENCE_ID, previewUrl: '/ref' });
    state = decomposeSequenceReference(state, MEET_NDX_SEQUENCE_ID);
    state = buildSequenceReconstructionSpecs(state, MEET_NDX_SEQUENCE_ID);
    for (const spec of state.reconstructionSpecs.filter((s) => s.sequenceId === MEET_NDX_SEQUENCE_ID)) {
      state = applySlideReviewJudgment(state, spec.slideId, 'APPROVE_SLIDE');
    }
    const { report } = runSequenceLevelReview(state, MEET_NDX_SEQUENCE_ID);
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.passed).toBe(true);
  });

  it('route and mobile workflow exist', () => {
    const routes = readFileSync(join(ROOT, 'src/site00/config/routes.ts'), 'utf8');
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-creative-ingestion.css'), 'utf8');
    expect(routes).toContain('founder-creative-ingest');
    expect(css).toContain('@media (min-width: 640px)');
    expect(css).toContain('overflow-x: auto');
  });

  it('builds CreativeAssetRecord with FOUNDER_UPLOAD source', () => {
    const record = buildFounderCreativeAssetRecord({
      asset: {
        assetId: 'prod-1',
        slideId: 'slide-1',
        sequenceId: MEET_NDX_SEQUENCE_ID,
        kind: 'PRODUCTION_ASSET',
        masterUrl: '/master',
        masterResolution: '2160x2700',
        derivativeUrls: {},
        approvedAt: new Date().toISOString(),
        lineageParentIds: ['ref-1'],
      },
      provenance: NDX_FOUNDER_CREATIVE_PROVENANCE,
      projectId: 'ndxbook',
      brandSlug: 'ndxbook',
    });
    expect(record.sourceType).toBe('FOUNDER_UPLOAD');
    expect(record.historicalSourceRef).toBe('EXTERNAL_CHATGPT_CREATIVE_SESSION');
  });

  it('reference image does not become character canon automatically', () => {
    const state = initializeNdxLaunchRow01();
    expect(state.characterIdentity.status).toBe('NOT_LOCKED');
    expect(state.characterIdentity.message).toContain('NOT LOCKED');
  });
});
