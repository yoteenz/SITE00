/**
 * P0.VR.PAGE-SYSTEM-REVIEW-FAMILY-EXPANSION-AND-EXPERIENCE-REVIEW-PANEL1
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { buildPageSystemReviewModel } from '../shared/site00-design-workspace-production/designPageSystemReview.js';
import { buildPageFamilyReviewPresentation } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageFamilyReviewPresentation.js';
import { resolvePageFamilySkinStatus } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageFamilyBlueprint.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';

const PROJECT = 'ndxbook';
const TOD_CSS = readFileSync(resolve('src/site00/styles/site00-twin-opus-direct.css'), 'utf8');
const PCG_CSS = readFileSync(resolve('src/site00/styles/site00-page-concept-generator.css'), 'utf8');
const PSR_TSX = readFileSync(
  resolve('src/site00/components/designBench/opusDirect/DesignPageSystemReviewSection.tsx'),
  'utf8',
);
const INSPECTOR_TSX = readFileSync(
  resolve('src/site00/components/designBench/opusDirect/DesignPageFamilyInspector.tsx'),
  'utf8',
);
const EXP_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewPanel.tsx'),
  'utf8',
);
const EXP_SECTIONS_TSX = readFileSync(
  resolve('src/site00/components/designBench/pageConceptGenerator/experienceReview/ExperienceReviewSections.tsx'),
  'utf8',
);
const OVERLAY_TSX = readFileSync(
  resolve('src/site00/components/designBench/opusDirect/PageConceptGenerationOverlay.tsx'),
  'utf8',
);

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

async function pipelineThroughViewportApproval() {
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
    captureId: 'cap-psr-exp',
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
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'generateExperienceExpression' });
  const approvedAt = new Date().toISOString();
  const ps = r.state.pipelineSet!;
  r = {
    ...r,
    state: {
      ...r.state,
      pipelineSet: {
        ...ps,
        experienceExpressionAuthority: {
          ...ps.experienceExpressionAuthority!,
          status: 'APPROVED',
          approvedAt,
        },
        experienceExpressionContract: {
          ...ps.experienceExpressionContract!,
          approvedAt,
        },
        viewportAuthorityFamily: {
          ...ps.viewportAuthorityFamily!,
          experienceExpressionStatus: 'APPROVED',
          experienceApprovedAt: approvedAt,
        },
      },
    },
  };
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'runTabletInterpretation', dryRun: true });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'runDesktopInterpretation', dryRun: true });
  r = await runPageConceptViewportFamilyAction(r.state, { type: 'approveViewportFamily' });
  return r.state;
}

describe('P0.VR.PAGE-SYSTEM-REVIEW-FAMILY-EXPANSION-AND-EXPERIENCE-REVIEW-PANEL1', () => {
  beforeEach(() => {
    delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  });

  it('child and grandchild counts reflect blueprint coverage summary', async () => {
    const pageId = overviewPageId();
    const review = buildPageSystemReviewModel(PROJECT, pageId, 'MOBILE');
    const state = await pipelineThroughViewportApproval();
    const blueprint = state.pipelineSet!.pageFamilyBlueprint!;
    const presentation = buildPageFamilyReviewPresentation({
      model: review,
      blueprint,
      handoff: null,
    });
    expect(presentation.counts.childPageCount).toBe(blueprint.childCount);
    expect(presentation.counts.grandchildPageCount).toBe(blueprint.grandchildCount);
    expect(presentation.counts.totalPageCount).toBe(blueprint.totalPageCount);
    expect(presentation.counts.countsSource).toBe('PAGE_FAMILY_BLUEPRINT');
  });

  it('UI exposes interactive children/grandchildren cells and inspector tabs', () => {
    expect(PSR_TSX).toContain('data-testid="page-system-review-children-cell"');
    expect(PSR_TSX).toContain('data-testid="page-system-review-grandchildren-panel"');
    expect(INSPECTOR_TSX).toContain('data-testid="page-family-inspector"');
    expect(INSPECTOR_TSX).toContain('page-family-inspector-tab-${id.toLowerCase()}');
    expect(INSPECTOR_TSX).toContain('page-family-inspector-function');
    expect(INSPECTOR_TSX).toContain('page-family-inspector-design');
    expect(TOD_CSS).toContain('.tod-psr__metricCell');
  });

  it('family coverage shows covered total and undefined count', async () => {
    const state = await pipelineThroughViewportApproval();
    const presentation = buildPageFamilyReviewPresentation({
      model: buildPageSystemReviewModel(PROJECT, overviewPageId(), 'MOBILE'),
      blueprint: state.pipelineSet!.pageFamilyBlueprint!,
      handoff: null,
    });
    expect(presentation.counts.undefinedPages).toBe(0);
    expect(presentation.counts.coveredPages).toBe(presentation.counts.totalPageCount);
  });

  it('skin status is READY before approval and FINALIZED after', async () => {
    let state = await pipelineThroughViewportApproval();
    expect(
      resolvePageFamilySkinStatus({
        skinContractApprovedAt: state.pipelineSet!.pageFamilySkinBehaviorContract!.approvedAt,
        blueprintApprovedAt: null,
      }),
    ).toBe('READY_FOR_FOUNDER_APPROVAL');
    state = (await runPageConceptViewportFamilyAction(state, { type: 'approvePageFamilyBlueprint' })).state;
    expect(
      resolvePageFamilySkinStatus({
        skinContractApprovedAt: state.pipelineSet!.pageFamilySkinBehaviorContract!.approvedAt,
        blueprintApprovedAt: state.pipelineSet!.pageFamilyBlueprint!.approvedAt,
      }),
    ).toBe('FINALIZED');
  });

  it('experience review uses dedicated overlay surface with visual cards', () => {
    expect(OVERLAY_TSX).toContain('s00-pcg-layer--experience');
    expect(OVERLAY_TSX).toContain("mode === 'experience-review'");
    expect(EXP_SECTIONS_TSX).toContain('data-testid="experience-review-output-nav"');
    expect(EXP_SECTIONS_TSX).toContain('APPROVE PACKAGE');
    expect(EXP_TSX).toContain('data-testid="page-concept-experience-fullscreen"');
    expect(PCG_CSS).toContain('.s00-pcg-layer--experience');
  });

  it('grid and list views pass the same page family blueprint props', () => {
    const list = readFileSync(resolve('src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx'), 'utf8');
    const grid = readFileSync(
      resolve('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx'),
      'utf8',
    );
    expect(list).toContain('pageFamilyBlueprint={data.pageFamilyBlueprint}');
    expect(list).toContain('pageFamilyInteractionMap={data.pageFamilyInteractionMap}');
    expect(grid).toContain('pageFamilyBlueprint={data.pageFamilyBlueprint}');
    expect(grid).toContain('pageFamilyInteractionMap={data.pageFamilyInteractionMap}');
  });
});
