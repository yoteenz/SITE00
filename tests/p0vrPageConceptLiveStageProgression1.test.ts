/**
 * P0.VR.PAGE-CONCEPT-LIVE-STAGE-PROGRESSION1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  buildCgptSubstepStatuses,
  buildPageConceptPanelProgress,
  derivePageConceptLiveProgress,
  inferCgptSubstepFromStage,
  pageConceptPanelProgressToStageStates,
  pageConceptProgressPatchForCgptSubstep,
  pageConceptProgressPatchForGpt2,
  pageConceptProgressPatchForNbp,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import { pageConceptStageStatesForPanel } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptStageStatesForPanel.js';
import { hydratePageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/readiness.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

describe('P0.VR.PAGE-CONCEPT-LIVE-STAGE-PROGRESSION1', () => {
  it('STEP 1 starts with PAGE INTELLIGENCE ACTIVE', () => {
    const map = buildCgptSubstepStatuses({ activeSubstep: 'page-intelligence' });
    expect(map['page-intelligence']).toBe('ACTIVE');
    expect(map['brand-context']).toBe('PENDING');
  });

  it('STEP 1 moves to BRAND CONTEXT after PAGE INTELLIGENCE COMPLETE', () => {
    const map = buildCgptSubstepStatuses({ activeSubstep: 'brand-context' });
    expect(map['page-intelligence']).toBe('COMPLETE');
    expect(map['brand-context']).toBe('ACTIVE');
  });

  it('progresses through all five CGPT substeps in order', () => {
    const order = [
      'page-intelligence',
      'brand-context',
      'key-messages',
      'visual-moodboard',
      'creative-direction',
    ] as const;
    for (const active of order) {
      const map = buildCgptSubstepStatuses({ activeSubstep: active });
      expect(map[active]).toBe('ACTIVE');
      const idx = order.indexOf(active);
      for (let i = 0; i < idx; i += 1) {
        expect(map[order[i]!]).toBe('COMPLETE');
      }
      for (let i = idx + 1; i < order.length; i += 1) {
        expect(map[order[i]!]).toBe('PENDING');
      }
    }
  });

  it('STEP 2 ACTIVE only after STEP 1 pipeline stage completes', () => {
    const gpt2 = pageConceptPanelProgressToStageStates(pageConceptProgressPatchForGpt2().panelProgress);
    expect(gpt2.CGPT).toBe('COMPLETE');
    expect(gpt2.GPT2).toBe('ACTIVE');
    expect(gpt2.NBP).toBe('PENDING');
  });

  it('STEP 3 ACTIVE only after GPT2 completes in stage model', () => {
    const nbp = pageConceptPanelProgressToStageStates(
      pageConceptProgressPatchForNbp('NBP_a_MOBILE').panelProgress,
    );
    expect(nbp.CGPT).toBe('COMPLETE');
    expect(nbp.GPT2).toBe('COMPLETE');
    expect(nbp.NBP).toBe('ACTIVE');
  });

  it('failure marks correct CGPT substep FAILED', () => {
    const map = buildCgptSubstepStatuses({
      activeSubstep: 'key-messages',
      failedSubstep: 'key-messages',
    });
    expect(map['key-messages']).toBe('FAILED');
    expect(map['creative-direction']).toBe('PENDING');
  });

  it('refresh restores substep from CGPT_SUB stage token', () => {
    expect(inferCgptSubstepFromStage('CGPT_SUB:brand-context')).toBe('brand-context');
    const progress = derivePageConceptLiveProgress({
      generationStatus: 'CGPT_RUNNING',
      generating: true,
      activeGenerationStage: 'CGPT_SUB:brand-context',
      panelProgress: null,
      cgptFailed: false,
    });
    expect(progress.currentSubstep).toBe('brand-context');
    expect(progress.substepStatusById['brand-context']).toBe('ACTIVE');
  });

  it('does not keep PAGE INTELLIGENCE ACTIVE when later substep is running', () => {
    const progress = buildPageConceptPanelProgress({
      currentStage: 'CGPT',
      activeCgptSubstep: 'creative-direction',
    });
    expect(progress.substepStatusById['page-intelligence']).toBe('COMPLETE');
    expect(progress.substepStatusById['creative-direction']).toBe('ACTIVE');
  });

  it('panel binds data-substep-state for live rows', () => {
    const panel = read('src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx');
    expect(panel).toContain('data-substep-state');
    expect(panel).toContain('cgptSubstepStates');
    const css = read('src/site00/styles/site00-page-concept-generator.css');
    expect(css).toContain("[data-substep-state='ACTIVE']");
  });

  it('mobile layout hooks remain intact', () => {
    const css = read('src/site00/styles/site00-page-concept-generator.css');
    expect(css).toContain('.s00-pcg-layer');
    expect(css).toContain('.s00-pcg__briefRow');
  });

  it('stageStatesForPanel uses live progress while generating', () => {
    const state = hydratePageConceptGenerationState('ndxbook', 'overview', {
      generationStatus: 'GPT2_RUNNING',
      liveProgress: pageConceptProgressPatchForGpt2().panelProgress,
    });
    const chips = pageConceptStageStatesForPanel({ state, generating: true, mode: 'progress' });
    expect(chips.CGPT).toBe('COMPLETE');
    expect(chips.GPT2).toBe('ACTIVE');
  });

  it('server emits CGPT_SUB progress tokens', () => {
    const cgpt = read('api/_lib/site00PageConcept/executePageConceptCgptStage.ts');
    const progress = read(
      'shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.ts',
    );
    expect(progress).toContain('CGPT_SUB:');
    expect(cgpt).toContain('panelProgress');
    expect(cgpt).toContain('runSubstepCheckpoint');
  });
});
