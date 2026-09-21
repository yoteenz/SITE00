/**
 * P0.VR.PAGE-CONCEPT-CGPT-BRIEF-INSPECTOR1
 */

import { describe, expect, it } from 'vitest';

import { useLegacyPageConceptNbpPipeline } from './helpers/pageConceptLegacyNbpTestEnv.js';

import { executePageConceptGeneration } from '../api/_lib/site00PageConcept/executePageConceptGenerationRun.js';
import { generatePageCreativeInjection } from '../api/_lib/site00PageConcept/generatePageCreativeInjection.js';
import { loadPageConceptGenerationState } from '../shared/site00-design-workspace-production/pageConceptPipeline/store.js';
import { compilePageCreativeContext, compileProjectCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import {
  compilePageConceptCgptCreativeBrief,
  verifyGpt2HandoffContextIntegrity,
  buildPageConceptGpt2HandoffViewModel,
  PAGE_CGPT_BRIEF_VERSION,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { buildPageConceptGpt2AuthorityPackage } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';
import { buildCgptBriefRows } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGeneratorBinding.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';

const PROJECT = 'ndxbook';

function fixtures() {
  const pageId =
    listSiteDesignPagesForProject(PROJECT).find((p) => p.pageId === 'overview')?.pageId ??
    listSiteDesignPagesForProject(PROJECT)[0]!.pageId;
  const projectContext = compileProjectCreativeContext(PROJECT)!;
  const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
  const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
  return { pageId, projectContext, pageContext, functionContract };
}

describe('P0.VR PAGE-CONCEPT CGPT BRIEF INSPECTOR', () => {
  useLegacyPageConceptNbpPipeline();

  it('persists runtime CGPT output into creative brief with stable id', async () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    process.env.VITEST = 'true';
    const injection = await generatePageCreativeInjection({
      projectContext,
      pageContext,
      functionContract,
    });
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    expect(brief.briefId).toBe(`pcgb-${injection.injectionId}`);
    expect(brief.version).toBe(PAGE_CGPT_BRIEF_VERSION);
    expect(brief.injectionId).toBe(injection.injectionId);
    expect(brief.creativePremise).toBe(injection.creativePremise ?? injection.creativeThesis);
  });

  it('shows skin and identity signals from runtime skin contract', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    process.env.VITEST = 'true';
    const injection = {
      injectionId: 'pinj-test',
      projectId: PROJECT,
      pageId: pageContext.pageId,
      projectContextVersion: projectContext.contextVersion,
      pageContextVersion: pageContext.contextVersion,
      functionContractVersion: functionContract.version,
      creativeThesis: 'Editorial intelligence premise',
      pagePurposeInterpretation: 'Overview intelligence',
      visualOpportunity: 'High contrast field',
      hierarchyDirection: 'Display-led',
      spatialDirection: 'Asymmetric editorial',
      informationPriority: 'Evidence first',
      imageDataBalance: 'Image-led',
      responsiveDirection: 'Distinct viewports',
      mobileDirection: 'Stack',
      desktopDirection: 'Split',
      creativeLatitude: 'High within identity',
      immutableRequirements: ['Preserve nav'],
      distinctiveMove: 'Archival plate hero',
      avoidList: ['generic SaaS dashboard'],
      referenceStrategy: 'Authority refs',
      assetStrategy: 'Archival imagery',
      createdAt: new Date().toISOString(),
      cgptProvider: 'test',
      cgptModel: 'test',
    };
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    expect(brief.identitySignals.length).toBeGreaterThan(0);
    expect(brief.skinSignals.some((s) => s.includes('DISPLAY FONT'))).toBe(true);
    expect(brief.skinSignals.some((s) => s.includes('NDX'))).toBe(true);
    expect(brief.avoidList.join(' ')).toMatch(/SaaS|generic/i);
    expect(brief.currentImplementationRole).toBe('FUNCTIONAL_REFERENCE_ONLY');
    expect(brief.aestheticAuthorityFromCapture).toBe('NO');
  });

  it('GPT2 handoff preserves required brief fields', async () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    process.env.VITEST = 'true';
    const injection = await generatePageCreativeInjection({
      projectContext,
      pageContext,
      functionContract,
    });
    const brief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const pkg = buildPageConceptGpt2AuthorityPackage({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief: brief,
    });
    const integrity = verifyGpt2HandoffContextIntegrity({ brief, package: pkg });
    expect(integrity.ok).toBe(true);
    expect(integrity.errorCode).toBeNull();

    const vm = buildPageConceptGpt2HandoffViewModel({
      brief,
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    expect(vm.handoff.cgptBriefId).toBe(brief.briefId);
    expect(vm.diagnostic.gpt2Handoff).toBe('COMPLETE');
  });

  it('dry-run attaches same briefId to GPT2 authority lineage', async () => {
    process.env.SITE00_PAGE_CONCEPT_REQUIRE_GPT2_REVIEW = 'false';
    const { pageId } = fixtures();
    const state = loadPageConceptGenerationState(PROJECT, pageId);
    const result = await executePageConceptGeneration(
      {
        founderConfirmedSpend: true,
        dryRun: true,
        state,
        mobileCapture: { captureId: 'm1', width: 390, height: 844, artifactBase64: 'm' },
        desktopCapture: { captureId: 'd1', width: 1440, height: 900, artifactBase64: 'd' },
      },
      { dryRun: true },
    );
    const brief = result.pipelineSet.cgptCreativeBrief;
    const gpt2 = result.pipelineSet.gpt2AuthorityConcept;
    expect(brief?.briefId).toBeTruthy();
    expect(gpt2?.cgptBriefId).toBe(brief?.briefId);
    expect(brief?.injectionId).toBe(result.pipelineSet.creativeInjection?.injectionId);
  });

  it('compact summary rows include distinctive move and avoid list', () => {
    const { projectContext, pageContext, functionContract } = fixtures();
    const brief = compilePageConceptCgptCreativeBrief({
      injection: {
        injectionId: 'x',
        projectId: PROJECT,
        pageId: pageContext.pageId,
        projectContextVersion: 'p',
        pageContextVersion: 'pg',
        functionContractVersion: 'fc',
        creativeThesis: 'Premise',
        pagePurposeInterpretation: 'Story',
        visualOpportunity: 'Visual',
        hierarchyDirection: 'H',
        spatialDirection: 'C',
        informationPriority: 'K',
        imageDataBalance: 'I',
        responsiveDirection: 'R',
        mobileDirection: 'M',
        desktopDirection: 'D',
        creativeLatitude: 'L',
        immutableRequirements: [],
        distinctiveMove: 'Move',
        avoidList: ['Avoid this'],
        referenceStrategy: 'R',
        assetStrategy: 'A',
        createdAt: new Date().toISOString(),
        cgptProvider: 't',
        cgptModel: 't',
      },
      projectContext,
      pageContext,
      functionContract,
    });
    const rows = buildCgptBriefRows(brief);
    expect(rows.some((r) => r.label === 'DISTINCTIVE MOVE')).toBe(true);
    expect(rows.some((r) => r.label === 'DO NOT DO')).toBe(true);
  });
});
