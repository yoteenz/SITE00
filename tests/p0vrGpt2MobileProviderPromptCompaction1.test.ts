/**
 * P0.VR.GPT2-PROMPT-COMPACTION-COMPILER1
 */

import { describe, expect, it } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import {
  buildPageGpt2MobileConceptRequestPackage,
  mobileConceptTerritoryDirective,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import {
  COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION,
  MAX_PROVIDER_PROMPT_CHARS,
  compileGpt2MobileProviderPrompt,
  validateCompiledProviderPrompt,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import { PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import type { PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function sampleInjection(pageId: string): PageCreativeInjection {
  return {
    injectionId: 'inj-compact-1',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'Cultural ledger overview inside DESIGN workspace with index register rhythm.',
    creativePremise: 'NDXBOOK Overview is the project home page — not a poster.',
    pageStory: 'Orient founder to entries and active cultural signal within SITE 00.',
    pagePurposeInterpretation: 'Project overview entry point',
    visualOpportunity: 'Editorial index with evidence plates',
    visualTerritory: 'NDX black archive register',
    hierarchyDirection: 'Title-first index',
    hierarchyStrategy: 'Monument title then structured entries',
    spatialDirection: 'Vertical scroll page',
    compositionStrategy: 'Region-based page stack',
    informationPriority: 'Entries before decoration',
    imageDataBalance: 'Evidence supports story',
    responsiveDirection: 'Mobile thumb reach',
    mobileDirection: 'Single column scroll with tappable entry rows',
    desktopDirection: 'Wide grid later',
    creativeLatitude: 'High within architecture',
    immutableRequirements: ['navigation', 'entries'],
    referenceStrategy: 'Archive',
    assetStrategy: 'Evidence collage in page body',
    imageryStrategy: 'Grain plates as content not hero poster',
    interactionCharacter: 'Tappable rows and promote affordances',
    distinctiveMove: 'Index declaration as page entry not flyer headline',
    typographyStrategy: 'Display + mono ledger',
    colorStrategy: 'NDX black field',
    materialStrategy: 'Matte archive',
    avoidList: ['generic SaaS dashboard', 'poster hero'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder orientation',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

describe('P0.VR.GPT2-PROMPT-COMPACTION-COMPILER1', () => {
  it('compiled provider prompt stays under safe limit with architecture preserved', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = sampleInjection(pageId);
    const cgptBrief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptCreativeBrief: cgptBrief,
    });
    const skin = compileProjectSkinContract(PROJECT);
    const compiled = compileGpt2MobileProviderPrompt({
      slot: 'MOBILE_CONCEPT_A',
      cgptBrief,
      pageArchitectureBrief: arch,
      skinContract: skin,
      functionContract,
      pageContext,
      injection,
      bottomContinuityApplied: true,
      mobileViewport: { width: 390, height: 844 },
    });
    expect(compiled.compiledPromptCharCount).toBeLessThan(MAX_PROVIDER_PROMPT_CHARS);
    expect(compiled.prompt).toMatch(/PAGE REGIONS/i);
    expect(compiled.prompt).toMatch(/NAVIGATION/i);
    expect(compiled.prompt).toMatch(/BOTTOM CONTINUITY/i);
    expect(compiled.prompt).toMatch(/VISUAL SYSTEM/i);
    expect(validateCompiledProviderPrompt(compiled.prompt).ok).toBe(true);
    expect(cgptBrief.briefId).toBeTruthy();
    expect(arch.briefId).toBeTruthy();
  });

  it('does not embed raw JSON handoff payload in provider prompt', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = sampleInjection(pageId);
    const cgptBrief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptCreativeBrief: cgptBrief,
    });
    const skin = compileProjectSkinContract(PROJECT);
    const pkg = buildPageGpt2MobileConceptRequestPackage({
      runId: 'pcgr-compact',
      slot: 'MOBILE_CONCEPT_A',
      conceptId: 'c1',
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief,
      pageArchitectureBrief: arch,
      skinContract: skin,
      bottomContinuityCaptureBase64: 'aaa',
      bottomContinuityApplied: true,
      pageContextSummary: '{"shouldNotAppearInPrompt":true}',
      mobileViewport: { width: 390, height: 844 },
    });
    expect(pkg.prompt).not.toContain('shouldNotAppearInPrompt');
    expect(pkg.prompt).not.toContain('CGPT + GPT2 HANDOFF PAYLOAD');
    expect(pkg.prompt.length).toBeGreaterThan(1500);
    expect(pkg.prompt.length).toBeLessThan(18_000);
    if (process.env.SITE00_LOG_GPT2_PROMPT_CHARS === '1') {
      // eslint-disable-next-line no-console
      console.log('NEW_PROMPT_CHAR_COUNT', pkg.prompt.length);
    }
  });

  it('validateCompiledProviderPrompt rejects prompts over safe ceiling', () => {
    const filler = 'PAGE REGIONS:\n1. x\nNAVIGATION:\n- y\nVISUAL SYSTEM:\nDISPLAY: a\nBOTTOM CONTINUITY:\nanchor\nOUTPUT FORMAT:\nframe\nSITE 00\n';
    const oversized = filler + 'z'.repeat(MAX_PROVIDER_PROMPT_CHARS + 1);
    const result = validateCompiledProviderPrompt(oversized);
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe('GPT2_PROVIDER_PROMPT_TOO_LONG');
    expect(result.compiledCharCount).toBeGreaterThan(MAX_PROVIDER_PROMPT_CHARS);
  });

  it('A/B/C share base hash; territory deltas differ', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = sampleInjection(pageId);
    const cgptBrief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptCreativeBrief: cgptBrief,
    });
    const skin = compileProjectSkinContract(PROJECT);
    const baseInput = {
      cgptBrief,
      pageArchitectureBrief: arch,
      skinContract: skin,
      functionContract,
      pageContext,
      injection,
      bottomContinuityApplied: false,
      mobileViewport: { width: 390, height: 844 },
    };
    const hashes = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) =>
      compileGpt2MobileProviderPrompt({ ...baseInput, slot }).sharedBaseHash,
    );
    expect(new Set(hashes).size).toBe(1);
    const territories = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) =>
      mobileConceptTerritoryDirective({ slot, injection, brief: cgptBrief }),
    );
    expect(new Set(territories).size).toBe(3);
  });

  it('stores compiled prompt lineage metadata on request package', () => {
    const pageId = overviewPageId();
    const projectContext = compileProjectCreativeContext(PROJECT)!;
    const pageContext = compilePageCreativeContext(PROJECT, pageId)!;
    const functionContract = compilePageFunctionContract(PROJECT, pageId)!;
    const injection = sampleInjection(pageId);
    const cgptBrief = compilePageConceptCgptCreativeBrief({
      injection,
      projectContext,
      pageContext,
      functionContract,
    });
    const arch = compilePageConceptPageArchitectureBrief({
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptCreativeBrief: cgptBrief,
    });
    const skin = compileProjectSkinContract(PROJECT);
    const pkg = buildPageGpt2MobileConceptRequestPackage({
      runId: 'pcgr-meta',
      slot: 'MOBILE_CONCEPT_B',
      conceptId: 'c2',
      projectContext,
      pageContext,
      functionContract,
      injection,
      cgptBrief,
      pageArchitectureBrief: arch,
      skinContract: skin,
      bottomContinuityCaptureBase64: '',
      bottomContinuityApplied: false,
      pageContextSummary: '{}',
      mobileViewport: { width: 390, height: 844 },
    });
    const meta = pkg.inspector.compiledProviderPrompt;
    expect(meta.compiledPromptVersion).toBe(COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION);
    expect(meta.compiledPromptHash).toMatch(/^[0-9a-f]{8}$/);
    expect(meta.sourceContractIds.pageArchitectureBriefId).toBe(arch.briefId);
    expect(meta.sourceContractIds.functionContractId).toBe(functionContract.contractId);
  });
});
