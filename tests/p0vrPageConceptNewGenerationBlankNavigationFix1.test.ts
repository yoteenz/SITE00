/**
 * P0.VR.PAGE-CONCEPT-NEW-GENERATION-BLANK-NAVIGATION-FIX1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { applyPageConceptNewGenerationBranchReset } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNewGenerationBranch.js';
import { pageConceptPostRunConfirmMessage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPostRunControls.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const ROOT = join(import.meta.dirname, '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

function completedState(): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'overview',
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: {
      pipelineSetId: 'pps-old',
      projectId: 'ndxbook',
      pageId: 'overview',
      targetType: 'PAGE',
      captureSetId: 'cap',
      functionContractId: 'fc',
      creativeInjection: { injectionId: 'inj-old' } as never,
      gpt2AuthorityConcept: { conceptId: 'gpt2-old' } as never,
      renditions: [],
      createdAt: new Date().toISOString(),
    },
    generationJobs: [
      {
        artifactId: 'pcga-RENDITION_A-MOBILE',
        status: 'READY',
      } as never,
    ],
    generationStatus: 'READY_FOR_FOUNDER_REVIEW',
    lastFailure: null,
    history: [],
    activeGenerationRunId: 'pcgr-old',
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    liveProgress: null,
    cgptSubsteps: null,
    archivedRuns: [],
    activeReviewRunId: null,
  };
}

describe('P0.VR NEW GENERATION blank navigation fix', () => {
  it('branch reset archives prior run and clears active jobs without touching project/page ids', () => {
    const next = applyPageConceptNewGenerationBranchReset(completedState());
    expect(next.archivedRuns?.length).toBe(1);
    expect(next.archivedRuns![0]!.generationJobs.length).toBe(1);
    expect(next.generationJobs).toEqual([]);
    expect(next.pipelineSet).toBeNull();
    expect(next.projectId).toBe('ndxbook');
    expect(next.pageId).toBe('overview');
    expect(next.activeReviewRunId).toBe('pps-old');
    expect(next.generationStatus).toBe('PLANNED');
  });

  it('NEW GENERATION handler does not call openGenerationConfirm', () => {
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    const fnStart = hook.indexOf('const requestNewPageConceptGeneration = useCallback');
    expect(fnStart).toBeGreaterThan(-1);
    const fnEnd = hook.indexOf('const requestRegenerateCgpt', fnStart);
    const block = hook.slice(fnStart, fnEnd);
    expect(block).toContain('runPostSpendDispatch');
    expect(block).not.toContain('openGenerationConfirm');
    expect(block).toContain('NEW GENERATION COULD NOT START');
  });

  it('NEW GENERATION button is type=button', () => {
    const panel = read('src/site00/components/designBench/pageConceptGenerator/PageConceptGeneratorPanel.tsx');
    expect(panel).toContain('data-testid={postRunSecondaryAction.testId}');
    expect(panel).toMatch(/postRunSecondaryAction[\s\S]*?type="button"/);
  });

  it('confirm message is spend-only (no navigation)', () => {
    const msg = pageConceptPostRunConfirmMessage({
      id: 'new_generation',
      label: 'NEW GENERATION',
      spendNote: '1 CGPT',
      testId: 'page-concept-new-generation',
    });
    expect(msg).toContain('Expected provider spend');
    expect(msg.toLowerCase()).not.toContain('href');
  });

  it('hook path has no location navigation in new generation block', () => {
    const hook = read('src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts');
    const fnStart = hook.indexOf('const requestNewPageConceptGeneration = useCallback');
    expect(fnStart).toBeGreaterThan(-1);
    const fnEnd = hook.indexOf('const requestRegenerateCgpt', fnStart);
    const block = hook.slice(fnStart, fnEnd);
    expect(block).not.toMatch(/location\.(href|assign|replace|reload)/);
    expect(block).not.toContain('navigate(');
  });
});
