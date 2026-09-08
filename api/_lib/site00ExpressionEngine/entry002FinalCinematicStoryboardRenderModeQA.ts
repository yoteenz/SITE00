/**
 * Sprint B4.9R2 — Render-mode QA: ONE storyboard artifact, ZERO independent panel assets.
 */

import type {
  StoryboardGenerationMode,
  StoryboardRenderModeQAResult,
} from '../../../shared/site00-expression-engine/finalCinematicStoryboardTypes.js';

export function runStoryboardRenderModeQA(params: {
  generationMode: StoryboardGenerationMode;
  storyboardDispatchCount: number;
  storyboardRenderCount: number;
  storyboardAssetCount: number;
  independentStoryboardPanelAssetCount: number;
}): StoryboardRenderModeQAResult {
  const checks: StoryboardRenderModeQAResult['checks'] = [];
  const blockers: string[] = [];

  checks.push({
    check: 'storyboardGenerationMode === SINGLE_MULTI_PANEL_ARTIFACT',
    passed: params.generationMode === 'SINGLE_MULTI_PANEL_ARTIFACT',
  });
  checks.push({
    check: 'storyboardAssetCount === 1',
    passed: params.storyboardAssetCount === 1,
  });
  checks.push({
    check: 'independentStoryboardPanelAssetCount === 0',
    passed: params.independentStoryboardPanelAssetCount === 0,
  });
  checks.push({
    check: 'storyboardRenderCount === 1',
    passed: params.storyboardRenderCount === 1,
  });
  checks.push({
    check: 'no panel fan-out (panel renders must be 0)',
    passed: params.independentStoryboardPanelAssetCount === 0,
  });

  if (params.generationMode === 'PANEL_FAN_OUT') {
    checks.push({ check: 'B4.9R panel fan-out rejected', passed: false });
    blockers.push('PANEL_FAN_OUT_INSTEAD_OF_SINGLE_STORYBOARD_ARTIFACT');
  }

  for (const c of checks) {
    if (!c.passed) blockers.push(c.check);
  }

  return {
    passed: blockers.length === 0,
    result: blockers.length === 0 ? 'PASS' : 'FAIL',
    storyboardGenerationMode: params.generationMode,
    providerDispatchCount: params.storyboardDispatchCount,
    storyboardAssetCount: params.storyboardAssetCount,
    independentStoryboardPanelAssetCount: params.independentStoryboardPanelAssetCount,
    checks,
    blockers,
  };
}

/** B4.9R regression — 16 independent panel assets fail render-mode contract. */
export function evaluateB49RPanelFanOutRenderMode(params: {
  independentStoryboardPanelAssetCount: number;
  storyboardAssetCount: number;
}): StoryboardRenderModeQAResult {
  return runStoryboardRenderModeQA({
    generationMode: 'PANEL_FAN_OUT',
    storyboardDispatchCount: params.independentStoryboardPanelAssetCount,
    storyboardRenderCount: params.storyboardAssetCount,
    storyboardAssetCount: params.storyboardAssetCount,
    independentStoryboardPanelAssetCount: params.independentStoryboardPanelAssetCount,
  });
}
