/**
 * P0.VR.EXPERIENCE-PACKAGE-MULTI-OUTPUT-DISPATCH-AND-REVIEW-FIX1
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as falExec from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionFal.js';
import { executePageConceptExperienceExpressionGeneration } from '../api/_lib/site00PageConcept/executePageConceptExperienceExpressionGeneration.js';
import { runPageConceptGeneration } from '../api/_lib/site00PageConcept/runPageConceptGeneration.js';
import { runPageConceptViewportFamilyAction } from '../api/_lib/site00PageConcept/runPageConceptViewportFamilyAction.js';
import { pageConceptBeginExperienceExpressionGeneration } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportFamilyOrchestration.js';
import {
  mergePreservedExperienceVisualStates,
  validateExperiencePackageMaterialization,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/experiencePackageMaterialization.js';
import { isNdxbookOverviewExperiencePage } from '../shared/site00-design-workspace-production/pageConceptPipeline/ndxbookOverviewExperienceExpressionContentSpec.js';
import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  return listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview')!.pageId;
}

async function stateAfterMobileConfirmed() {
  delete process.env.SITE00_PAGE_CONCEPT_LEGACY_NBP;
  process.env.SITE00_PAGE_CONCEPT_CGPT_QA_STOP = 'false';
  process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
  const pageId = overviewPageId();
  appendPageCapture({
    projectId: PROJECT,
    pageId,
    screenId: 'overview',
    route: '/projects/ndxbook/overview',
    timestamp: new Date().toISOString(),
    buildVersion: 'vitest',
    createdBy: 'vitest',
    source: 'LOCAL_FALLBACK',
    captureId: 'cap-exp-multi',
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
  return r.state;
}

describe('P0.VR.EXPERIENCE-PACKAGE-MULTI-OUTPUT-DISPATCH-AND-REVIEW-FIX1', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('recognizes live NDXBOOK overview route /projects/ndxbook', () => {
    expect(
      isNdxbookOverviewExperiencePage({
        projectId: 'ndxbook',
        route: '/projects/ndxbook',
        pageId: overviewPageId(),
      }),
    ).toBe(true);
  });

  it('plans four visuals and three FAL jobs for live function contract route', async () => {
    const state = await stateAfterMobileConfirmed();
    expect(state.functionContract!.route).toBe('/projects/ndxbook');
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    expect(begun.authority.visualStates).toHaveLength(4);
    expect(begun.authority.packagingPlan!.groupedOutputs).toHaveLength(3);
    const labels = begun.authority.visualStates.map((v) => v.label);
    expect(labels).toContain('BASE PAGE');
    expect(labels).toContain('MENU / EXPANDED NAV');
    expect(labels).toContain('ENTRY DETAIL / PANEL');
    expect(labels).toContain('PROJECT ACCESS / OVERLAY');
  });

  it('dispatches three independent FAL jobs from approved authority (not chained)', async () => {
    const falSpy = vi.spyOn(falExec, 'renderExperienceExpressionFalTarget');
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const mobileUri = begun.mobileConcept.imageUri!;

    const result = await executePageConceptExperienceExpressionGeneration({
      authority: begun.authority,
      mobileAuthorityImageUri: mobileUri,
      planMeta: {
        projectId: PROJECT,
        pageId: state.pageId,
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: begun.mobileConcept.conceptId,
      },
      functionContract: state.functionContract!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      injection: state.pipelineSet!.creativeInjection!,
      dryRun: true,
    });

    expect(falSpy).toHaveBeenCalledTimes(3);
    for (const call of falSpy.mock.calls) {
      expect(call[0].mobileAuthorityImageUri).toBe(mobileUri);
    }
    const prompts = falSpy.mock.calls.map((c) => c[0].target.prompt);
    expect(new Set(prompts).size).toBe(3);
    expect(result.jobs).toHaveLength(3);
    expect(result.authority.generationJobs?.filter((j) => j.provider === 'FAL_EXPERIENCE')).toHaveLength(3);
    expect(validateExperiencePackageMaterialization(result.authority).ok).toBe(true);
  });

  it('preserves existing MENU output and dispatches only missing FAL states', async () => {
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const menuOnly = {
      ...begun.authority,
      visualStates: begun.authority.visualStates.map((v) =>
        v.stateId === 'menu' ?
          {
            ...v,
            previewImageUri: 'data:image/png;base64,existing-menu',
            generatedArtifactId: 'pcga-menu-preserved',
            materializationStatus: 'READY' as const,
          }
        : v,
      ),
    };
    const falSpy = vi.spyOn(falExec, 'renderExperienceExpressionFalTarget');
    await executePageConceptExperienceExpressionGeneration({
      authority: menuOnly,
      mobileAuthorityImageUri: begun.mobileConcept.imageUri!,
      planMeta: {
        projectId: PROJECT,
        pageId: state.pageId,
        captureSetId: state.pipelineSet!.captureSetId,
        projectContextVersion: state.projectContext!.contextVersion,
        pageContextVersion: state.pageContext!.contextVersion,
        functionContractId: state.functionContract!.contractId,
        creativeInjectionId: state.pipelineSet!.creativeInjection!.injectionId,
        selectedMobileConceptId: begun.mobileConcept.conceptId,
      },
      functionContract: state.functionContract!,
      cgptBrief: state.pipelineSet!.cgptCreativeBrief!,
      injection: state.pipelineSet!.creativeInjection!,
      dryRun: true,
    });
    expect(falSpy).toHaveBeenCalledTimes(2);
    expect(falSpy.mock.calls.every((c) => c[0].target.stateId !== 'menu')).toBe(true);
  });

  it('mergePreservedExperienceVisualStates keeps prior menu when re-beginning generation', async () => {
    const state = await stateAfterMobileConfirmed();
    const begun = pageConceptBeginExperienceExpressionGeneration(state);
    const withMenu = {
      ...begun.authority,
      visualStates: begun.authority.visualStates.map((v) =>
        v.stateId === 'menu' ? { ...v, previewImageUri: 'data:image/png;base64,menu-kept' } : v,
      ),
    };
    const nextBegin = pageConceptBeginExperienceExpressionGeneration(state);
    const merged = mergePreservedExperienceVisualStates(nextBegin.authority, withMenu);
    const menu = merged.visualStates.find((v) => v.stateId === 'menu')!;
    expect(menu.previewImageUri).toContain('menu-kept');
  });

  it('full pipeline CREATE EXPERIENCE yields four materialized visuals', async () => {
    const state = await stateAfterMobileConfirmed();
    const r = await runPageConceptViewportFamilyAction(state, {
      type: 'generateExperienceExpression',
      dryRun: true,
    });
    expect(r.state.pipelineSet?.experienceExpressionAuthority?.visualStates).toHaveLength(4);
    const receipt = validateExperiencePackageMaterialization(r.state.pipelineSet?.experienceExpressionAuthority);
    expect(receipt.plannedOutputCount).toBe(4);
    expect(receipt.materializedOutputCount).toBe(4);
    expect(receipt.inheritedOutputCount).toBe(1);
    expect(receipt.falOutputCount).toBe(3);
    expect(receipt.rootCauseOfSingleOutput).toBeNull();
  });
});
