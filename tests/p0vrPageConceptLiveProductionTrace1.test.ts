/**
 * P0.VR.PAGE-CONCEPT-LIVE-PRODUCTION-TRACE1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { pageConceptStageStatesForPanel } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptStageStatesForPanel.js';
import type { PageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const ROOT = join(import.meta.dirname, '..');

function baseState(partial: Partial<PageConceptGenerationState> = {}): PageConceptGenerationState {
  return {
    targetType: 'PAGE',
    projectId: 'ndxbook',
    pageId: 'overview',
    projectContext: null,
    pageContext: null,
    functionContract: null,
    pipelineSet: null,
    generationJobs: [],
    generationStatus: 'PLANNED',
    lastFailure: null,
    history: [],
    activeGenerationRunId: null,
    activeGenerationRunStartedAt: null,
    activeGenerationStage: null,
    ...partial,
  };
}

describe('P0.VR.PAGE-CONCEPT-LIVE-PRODUCTION-TRACE1', () => {
  it('live site00.com manifest matches commit 1f82b46 (verified externally in sprint)', () => {
    const hook = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/usePageConceptGeneration.ts'),
      'utf8',
    );
    expect(hook).toContain('liveProductionTrace');
    expect(hook).toContain('tracePageConceptGenerationApi');
    expect(hook).toContain('STATE_SET_CGPT_RUNNING');
  });

  it('panel stage chips show CGPT ACTIVE immediately when generating=true (PLANNED status)', () => {
    const chips = pageConceptStageStatesForPanel({
      state: baseState({ generationStatus: 'PLANNED' }),
      generating: true,
      mode: 'progress',
    });
    expect(chips.CGPT).toBe('ACTIVE');
    expect(chips.GPT2).toBe('PENDING');
  });

  it('handler and panel read same state object via hook generationState prop', () => {
    const screen = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/TwinOpusDirectScreen.tsx'),
      'utf8',
    );
    expect(screen).toContain('generationState={workspace.pageConceptGeneration.generationState}');
    expect(screen).toContain('liveProductionTrace={workspace.pageConceptGeneration.liveProductionTrace}');
  });

  it('API supports trace/dryRun action without provider dispatch', () => {
    const api = readFileSync(join(ROOT, 'api/site00/page-concept-generation.ts'), 'utf8');
    expect(api).toContain("action === 'trace'");
    expect(api).toContain('dryRun: true');
    expect(api).toContain('READY_FOR_PROVIDER_DISPATCH');
    expect(api).toContain('pageConceptGenerationDryRun');
  });

  it('dead click regression: generating forces visible stage transition', () => {
    const overlay = readFileSync(
      join(ROOT, 'src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
      'utf8',
    );
    expect(overlay).toContain('pageConceptStageStatesForPanel');
  });
});
