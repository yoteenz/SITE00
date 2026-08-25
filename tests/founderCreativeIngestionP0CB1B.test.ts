/**
 * P0.CB.1B — Guided creative ingestion workflow tests.
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
} from '../shared/site00-studio-world-production/founderCreativeIngestion/adapters/ndxLaunchRow01Pilot.js';
import {
  countApprovedSlides,
  countUnresolvedSlides,
  deriveSlideDisplayStatus,
  firstUnresolvedSlideIndex,
  getSequenceSpecs,
  inferGuidedWorkflowStep,
  judgmentFounderLabel,
  photoModeFounderLabel,
  sequenceReviewBlocked,
  GUIDED_WORKFLOW_STEPS,
  GUIDED_WORKFLOW_STEP_LABELS,
} from '../shared/site00-studio-world-production/founderCreativeIngestion/guidedWorkflow.js';
import {
  uploadAndReplaceFounderCreativeReferenceBoard,
  initializeFounderCreativeRow01,
  decomposeAllFounderCreativeSequences,
  promoteFounderCreativeDraftReference,
} from '../api/_lib/site00Evolve/founderCreativeIngestion/founderCreativeIngestionService.js';
import { getDraftReferenceVersion } from '../shared/site00-studio-world-production/founderCreativeIngestion/referenceReplacement/replacementEngine.js';
import { resetCampaignProductionMemory } from '../api/_lib/site00Evolve/marketingCampaignProduction/marketingCampaignProductionMemoryStore.js';

const ROOT = process.cwd();

function seedDecomposedState() {
  let state = initializeNdxLaunchRow01();
  state = registerReferenceUpload(state, { sequenceId: MEET_NDX_SEQUENCE_ID, previewUrl: '/ref/meet-ndx' });
  state = decomposeSequenceReference(state, MEET_NDX_SEQUENCE_ID);
  state = buildSequenceReconstructionSpecs(state, MEET_NDX_SEQUENCE_ID);
  return state;
}

describe('P0.CB.1B guided workflow logic', () => {
  it('exports five canonical guided steps', () => {
    expect(GUIDED_WORKFLOW_STEPS).toEqual([
      'INGEST',
      'DECOMPOSE',
      'SLIDE_REVIEW',
      'SEQUENCE_REVIEW',
      'COMPLETE',
    ]);
    expect(GUIDED_WORKFLOW_STEP_LABELS.INGEST).toBe('Upload Reference Board');
    expect(GUIDED_WORKFLOW_STEP_LABELS.SLIDE_REVIEW).toBe('Review Slide');
  });

  it('infers INGEST when no specs exist', () => {
    const state = initializeNdxLaunchRow01();
    expect(inferGuidedWorkflowStep(state, MEET_NDX_SEQUENCE_ID)).toBe('INGEST');
  });

  it('infers SLIDE_REVIEW after decomposition', () => {
    const state = seedDecomposedState();
    expect(inferGuidedWorkflowStep(state, MEET_NDX_SEQUENCE_ID)).toBe('SLIDE_REVIEW');
  });

  it('infers SEQUENCE_REVIEW when all slides approved', () => {
    let state = seedDecomposedState();
    for (const spec of getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID)) {
      state = applySlideReviewJudgment(state, spec.slideId, 'APPROVE_SLIDE');
    }
    expect(inferGuidedWorkflowStep(state, MEET_NDX_SEQUENCE_ID)).toBe('SEQUENCE_REVIEW');
    expect(countUnresolvedSlides(getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID))).toBe(0);
  });

  it('blocks sequence review while unresolved slides remain', () => {
    const state = seedDecomposedState();
    const specs = getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID);
    expect(sequenceReviewBlocked(specs)).toBe(true);
    expect(firstUnresolvedSlideIndex(specs)).toBe(0);
  });

  it('maps founder-facing photo and judgment labels', () => {
    expect(photoModeFounderLabel('UPLOAD_HQ')).toBe('Upload HQ Photo');
    expect(judgmentFounderLabel('APPROVE_SLIDE')).toBe('Approve Slide');
  });

  it('derives slide display statuses', () => {
    const state = seedDecomposedState();
    const spec = getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID)[0]!;
    expect(deriveSlideDisplayStatus(spec, null)).toBe('DECOMPOSED');
  });
});

describe('P0.CB.1B workflow automation + preservation', () => {
  beforeEach(() => {
    resetCampaignProductionMemory();
  });

  it('upload automatically starts decomposition and yields slide specs', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const { ingestion, diff } = await uploadAndReplaceFounderCreativeReferenceBoard({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
      imageData: tinyPng,
    });
    expect(getDraftReferenceVersion(ingestion, MEET_NDX_SEQUENCE_ID)?.status).toBe('DRAFT');
    expect(diff).not.toBeNull();
    expect(getSequenceSpecs(ingestion, MEET_NDX_SEQUENCE_ID).length).toBeGreaterThan(0);
    expect(inferGuidedWorkflowStep(ingestion, MEET_NDX_SEQUENCE_ID)).toBe('SLIDE_REVIEW');
  });

  it('does not auto-promote draft reference on upload', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const { ingestion } = await uploadAndReplaceFounderCreativeReferenceBoard({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
      imageData: tinyPng,
    });
    expect(getDraftReferenceVersion(ingestion, MEET_NDX_SEQUENCE_ID)).not.toBeNull();
    expect(ingestion.referenceVersions.some((entry) => entry.status === 'ACTIVE')).toBe(true);
  });

  it('promote remains explicit founder action', async () => {
    await initializeFounderCreativeRow01({ projectId: 'ndxbook' });
    await decomposeAllFounderCreativeSequences({ projectId: 'ndxbook' });
    const tinyPng =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    await uploadAndReplaceFounderCreativeReferenceBoard({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
      imageData: tinyPng,
    });
    const { ingestion } = await promoteFounderCreativeDraftReference({
      projectId: 'ndxbook',
      sequenceId: MEET_NDX_SEQUENCE_ID,
    });
    expect(getDraftReferenceVersion(ingestion, MEET_NDX_SEQUENCE_ID)).toBeNull();
  });
});

describe('P0.CB.1B UI architecture', () => {
  it('page uses guided workflow shell and stages', () => {
    const page = readFileSync(join(ROOT, 'src/site00/pages/ProjectFounderCreativeIngestionPage.tsx'), 'utf8');
    const workflow = readFileSync(
      join(ROOT, 'src/site00/components/founderCreativeIngestion/FounderCreativeIngestionWorkflow.tsx'),
      'utf8',
    );
    const css = readFileSync(join(ROOT, 'src/site00/styles/site00-founder-creative-ingestion.css'), 'utf8');

    expect(page).toContain('FounderCreativeIngestionWorkflow');
    expect(page).toContain('GUIDED CREATIVE INGESTION');
    expect(workflow).toContain('FounderCreativeSlideReviewStage');
    expect(workflow).toContain('FounderCreativeSequenceReviewStage');
    expect(workflow).toContain('FounderCreativeInspectDrawer');
    expect(workflow).not.toContain('PHOTOGRAPHY_SOURCE_MODES');
    expect(css).toContain('site00-fci-gw__stepper');
    expect(css).toContain('site00-fci-gw__mobile-bar');
  });

  it('inspect drawer holds methodology details', () => {
    const inspect = readFileSync(
      join(ROOT, 'src/site00/components/founderCreativeIngestion/FounderCreativeInspectDrawer.tsx'),
      'utf8',
    );
    expect(inspect).toContain('Inspect Methodology + System');
    expect(inspect).toContain('Photo modes (internal)');
  });

  it('slide review exposes HQ upload action', () => {
    const slideStage = readFileSync(
      join(ROOT, 'src/site00/components/founderCreativeIngestion/stages/FounderCreativeSlideReviewStage.tsx'),
      'utf8',
    );
    expect(slideStage).toContain('Upload HQ Photo');
    expect(slideStage).toContain('Approve slide');
  });
});

describe('P0.CB.1B success criteria booleans', () => {
  it('approval counts support sequence completion gating', () => {
    let state = seedDecomposedState();
    const specs = getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID);
    expect(countApprovedSlides(specs)).toBe(0);
    state = applySlideReviewJudgment(state, specs[0]!.slideId, 'APPROVE_SLIDE');
    expect(countApprovedSlides(getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID))).toBe(1);
    expect(sequenceReviewBlocked(getSequenceSpecs(state, MEET_NDX_SEQUENCE_ID))).toBe(true);
  });
});
