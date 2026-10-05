/**
 * P0.VR.NDXBOOK-OVERVIEW-FULL-EXPRESSION-COVERAGE-AND-EXPANDED-NAV-STATE1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as falExec from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionFal.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import {
  buildExperienceExpressionCoverageMap,
  validateExperienceExpressionCoverage,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experienceExpressionCoverageMap.js';
import { buildMenuExpandedNavHierarchyRefinementPromptBlock } from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookExpandedNavHierarchy.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

async function stateWithExperiencePackage() {
  delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  const pageId = overviewPageId();
  appendPageCapture({
    projectId: PROJECT,
    pageId,
    screenId: 'overview',
    route: '/projects/design/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK',
    captureId: 'cap-full-exp-cov',
    viewport: 'MOBILE',
    artifactPath: 'data:image/png;base64,aaaa',
  });
  let state = loadPageConceptGenerationState(PROJECT, pageId);
  const gen = await runPageConceptGeneration({
    state,
    founderConfirmedSpend: true,
    mobileCapture: { captureId: 'm1', artifactBase64: 'aaa', width: 390, height: 844 },
    desktopCapture: { captureId: 'd1', artifactBase64: 'bbb', width: 1440, height: 1024 },
  });
  state = {
    ...state,
    pipelineSet: gen.pipelineSet,
    generationJobs: [...gen.jobs],
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
  };
  const conceptId = gen.pipelineSet!.mobileConcepts![0]!.conceptId;
  let r = await runPageConceptViewportFamilyAction(state, { type: 'selectMobileConcept', conceptId });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'confirmMobileAuthority' });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression', dryRun: true });
  return r;
}

describe('P0.VR.NDXBOOK-OVERVIEW-FULL-EXPRESSION-COVERAGE-AND-EXPANDED-NAV-STATE1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('maps interactions to patterns without one-image-per-button (outputs <= 5)', async () => {
    const r = await stateWithExperiencePackage();
    const authority = r.state.pipelineSet!.experienceExpressionAuthority!;
    expect(authority.visualStates.length).toBeLessThanOrEqual(5);
    const map = buildExperienceExpressionCoverageMap({
      projectId: PROJECT,
      pageId: r.state.pageId,
      route: r.state.functionContract!.route,
      functionContract: r.state.functionContract!,
      authority,
      interactionMap: r.state.pipelineSet?.pageFamilyInteractionMap ?? null,
      blueprint: r.state.pipelineSet?.pageFamilyBlueprint ?? null,
    })!;
    expect(map.totalOverviewInteractions).toBeGreaterThan(5);
    expect(map.undefinedVisualPatterns).toBe(0);
    expect(map.finalExperienceOutputCount).toBeLessThanOrEqual(5);
    const validation = validateExperienceExpressionCoverage({ map, authority });
    expect(validation.ok).toBe(true);
    expect(validation.undefinedVisualPatterns).toBe(0);
  });

  it('menu output covers primary + nested nav; Content Ops expanded prompt directive present', async () => {
    vi.spyOn(falExec, 'renderExperienceExpressionFalTarget');
    let r = await stateWithExperiencePackage();
    const before = r.state.pipelineSet!.experienceExpressionAuthority!;
    r = await runPageConceptViewportFamilyAction(r.state, {
      type: 'regenerateExperienceExpressionState',
      stateId: 'menu',
      dryRun: true,
    });
    const map = r.state.pipelineSet!.experienceExpressionAuthority!.experienceExpressionCoverageMap!;
    expect(map.menuCoversPrimaryNav).toBe(true);
    expect(map.menuCoversNestedNav).toBe(true);
    expect(map.campaignBoardNested).toBe(true);
    const prompt = vi.mocked(falExec.renderExperienceExpressionFalTarget).mock.calls.at(-1)?.[0].target.prompt ?? '';
    expect(prompt).toContain('NESTED NAVIGATION EXPANSION');
    expect(prompt).toContain('CONTENT OPS IN ITS EXPANDED STATE');
    const otherUnchanged = before.visualStates
      .filter((s) => s.stateId !== 'menu')
      .every((s) => {
        const after = r.state.pipelineSet!.experienceExpressionAuthority!.visualStates.find((x) => x.stateId === s.stateId);
        return after?.previewImageUri === s.previewImageUri;
      });
    expect(otherUnchanged).toBe(true);
  });

  it('multiple controls inherit shared pattern bindings', async () => {
    const r = await stateWithExperiencePackage();
    const map = r.state.pipelineSet!.experienceExpressionAuthority!.experienceExpressionCoverageMap!;
    const menuBinding = map.patternBindings.find((b) => b.authorityStateId === 'menu');
    expect(menuBinding && menuBinding.interactionCount >= 1).toBe(true);
    expect(map.functionalOnlyInteractions).toBeGreaterThan(0);
    expect(buildMenuExpandedNavHierarchyRefinementPromptBlock({ hierarchyLines: ['003 CONTENT OPS', '    └ CAMPAIGN BOARD'] })).toContain(
      'PRIMARY NAVIGATION EXPANSION',
    );
  });
});
