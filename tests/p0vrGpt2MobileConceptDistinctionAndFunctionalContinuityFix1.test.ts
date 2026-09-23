/**
 * P0.VR.GPT2-MOBILE-CONCEPT-DISTINCTION-AND-FUNCTIONAL-CONTINUITY-FIX1
 */

import { describe, expect, it } from 'vitest';

import { appendPageCapture } from '../shared/site00-design-workspace-production/designPageCapture.js';
import { listSiteDesignPagesForProject } from '../shared/site00-design-workspace-production/designProjectBinding/index.js';
import { compilePageFunctionContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { compileProjectSkinContract } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import {
  COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION,
  MAX_PROVIDER_PROMPT_CHARS,
  compileGpt2MobileProviderPrompt,
  validateCompiledProviderPrompt,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileProviderPromptCompiler.js';
import {
  evaluateGpt2MobileConceptHandoffValidity,
  gpt2MobileConceptTerritoryDelta,
  resolveGpt2MobileConceptTerritorySpec,
} from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileConceptContracts.js';
import { PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS } from '../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import type { PageCreativeInjection } from '../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

const PROJECT = 'ndxbook';

function overviewPageId(): string {
  const overview = listSiteDesignPagesForProject(PROJECT).find((p) => p.screenId === 'overview');
  if (!overview) throw new Error('overview missing');
  return overview.pageId;
}

function sampleInjection(pageId: string): PageCreativeInjection {
  return {
    injectionId: 'inj-distinction-1',
    projectId: PROJECT,
    pageId,
    projectContextVersion: '1',
    pageContextVersion: '1',
    functionContractVersion: '1',
    creativeThesis: 'NDXBOOK overview as real mobile product page.',
    creativePremise: 'Overview orients founder within NDXBOOK.',
    pageStory: 'Project home with entries and state.',
    pagePurposeInterpretation: 'Overview',
    visualOpportunity: 'Light editorial product page',
    visualTerritory: 'NDX archive light field',
    hierarchyDirection: 'Title-first',
    hierarchyStrategy: 'Monument then entries',
    spatialDirection: 'Vertical scroll',
    compositionStrategy: 'Regions',
    informationPriority: 'Entries',
    imageDataBalance: 'Evidence supports story',
    responsiveDirection: 'Mobile',
    mobileDirection: 'Single column scroll',
    desktopDirection: 'Wide later',
    creativeLatitude: 'High within architecture',
    immutableRequirements: ['navigation', 'bottom continuity'],
    referenceStrategy: 'Capture-first',
    assetStrategy: 'Evidence plates',
    imageryStrategy: 'Archival plates',
    interactionCharacter: 'Tappable rows',
    distinctiveMove: 'Index register',
    typographyStrategy: 'Uppercase display + mono',
    colorStrategy: 'Light field + black/lime',
    materialStrategy: 'Paper and concrete',
    avoidList: ['poster', 'full black page'],
    mandatoryBrandSignals: ['NDXBOOK'],
    audienceIntent: 'Founder',
    createdAt: new Date().toISOString(),
    cgptProvider: 'vitest',
    cgptModel: 'vitest',
  };
}

describe('P0.VR.GPT2-MOBILE-CONCEPT-DISTINCTION-AND-FUNCTIONAL-CONTINUITY-FIX1', () => {
  it('compiled prompt enforces uppercase, light family, bottom nav inheritance, and stays under safe limit', () => {
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
      referenceImageRoleSummary: 'Image A 390×844 · Image B continuity',
    });
    expect(compiled.compiledPromptVersion).toBe(COMPILED_GPT2_MOBILE_PROVIDER_PROMPT_VERSION);
    expect(compiled.compiledPromptCharCount).toBeLessThan(MAX_PROVIDER_PROMPT_CHARS);
    expect(compiled.prompt).toMatch(/UPPERCASE TYPOGRAPHY/i);
    expect(compiled.prompt).toMatch(/LIGHT-THEME FAMILY/i);
    expect(compiled.prompt).toMatch(/BOTTOM NAV/i);
    expect(compiled.prompt).toMatch(/inventing new tabs/i);
    expect(validateCompiledProviderPrompt(compiled.prompt).ok).toBe(true);
    expect(evaluateGpt2MobileConceptHandoffValidity(compiled.prompt).ok).toBe(true);
  });

  it('A/B/C share base hash but territories and theme classes differ', () => {
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
      bottomContinuityApplied: true,
      mobileViewport: { width: 390, height: 844 },
    };
    const compiled = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) =>
      compileGpt2MobileProviderPrompt({ ...baseInput, slot }),
    );
    const baseHashes = new Set(compiled.map((c) => c.sharedBaseHash));
    expect(baseHashes.size).toBe(1);
    const themes = compiled.map((c) => c.conceptThemeClass);
    expect(themes.filter((t) => t === 'LIGHT').length).toBeGreaterThanOrEqual(2);
    const deltas = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map((slot) => gpt2MobileConceptTerritoryDelta(slot));
    expect(new Set(deltas).size).toBe(3);
    expect(resolveGpt2MobileConceptTerritorySpec('MOBILE_CONCEPT_A').themeClass).toBe('LIGHT');
    expect(resolveGpt2MobileConceptTerritorySpec('MOBILE_CONCEPT_C').themeClass).toBe('LIGHT_HYBRID');
  });
});
