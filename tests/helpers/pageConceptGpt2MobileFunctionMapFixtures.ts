import { compilePageFunctionContract } from '../../shared/site00-design-workspace-production/pageConceptPipeline/functionContract.js';
import { compileProjectCreativeContext, compilePageCreativeContext } from '../../shared/site00-design-workspace-production/pageConceptPipeline/contextCompilers.js';
import { compilePageConceptCgptCreativeBrief } from '../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCgptCreativeBrief.js';
import { compilePageConceptPageArchitectureBrief } from '../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js';
import { mockGpt2MobileProviderReferenceBundleForTest } from '../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileReferenceAuthority.js';
import { buildScreenshotFunctionalPageMapForTest } from '../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptScreenshotFunctionalPageMap.js';
import type { PageCreativeInjection } from '../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export function buildGpt2MobileScreenshotFunctionMapFixture(input: {
  projectId: string;
  pageId: string;
  injection: PageCreativeInjection;
  captureSetId?: string;
}) {
  const projectContext = compileProjectCreativeContext(input.projectId)!;
  const pageContext = compilePageCreativeContext(input.projectId, input.pageId)!;
  const functionContract = compilePageFunctionContract(input.projectId, input.pageId)!;
  const cgptBrief = compilePageConceptCgptCreativeBrief({
    injection: input.injection,
    projectContext,
    pageContext,
    functionContract,
  });
  const pageArchitectureBrief = compilePageConceptPageArchitectureBrief({
    projectContext,
    pageContext,
    functionContract,
    injection: input.injection,
    cgptCreativeBrief: cgptBrief,
    captureSetId: input.captureSetId ?? 'test-capture-set',
  });
  const providerReferences = mockGpt2MobileProviderReferenceBundleForTest();
  const screenshotFunctionalPageMap = buildScreenshotFunctionalPageMapForTest({
    captureSetId: input.captureSetId ?? 'test-capture-set',
    providerReferenceBundle: providerReferences,
    projectContext,
    pageContext,
    functionContract,
    pageArchitectureBrief,
  });
  return {
    projectContext,
    pageContext,
    functionContract,
    cgptBrief,
    pageArchitectureBrief,
    providerReferences,
    screenshotFunctionalPageMap,
  };
}
