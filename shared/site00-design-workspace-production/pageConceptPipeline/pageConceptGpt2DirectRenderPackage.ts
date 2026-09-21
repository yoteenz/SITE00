/**
 * P0.VR.PAGE-CONCEPT-DUAL-RENDER-ENGINE-TEST1 — GPT2 direct render lane package.
 */

import type {
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
} from './types.js';
import type { ProjectSkinContract } from './pageConceptProjectSkinContract.js';
import { parseAuthorityArtifactBase64 } from './pageConceptNbpRequestPackage.js';
import { pageConceptNbpOmitCurrentScreenshot } from './pageConceptNbpAuthorityPolicy.js';

export const PAGE_GPT2_DIRECT_RENDER_PROMPT_VERSION = 'page-gpt2-direct-render-v1-dual-test';

export type PageGpt2DirectRenderPackage = {
  prompt: string;
  authorityBase64: string;
  inspector: {
    visualAuthorityPresent: boolean;
    skinContractVersion: string;
    cgptDirectionId: string;
    functionContractVersion: string;
    currentScreenshotRole: 'FUNCTIONAL_REFERENCE_ONLY' | 'OMITTED';
    promptVersion: string;
  };
  lineage: {
    renderLaneType: 'GPT2_DIRECT';
    renderMode: 'DUAL_RENDER_TEST';
    viewport: 'MOBILE' | 'DESKTOP';
    authorityArtifactId: string;
    authoritySourceRunId: string;
  };
};

export function buildPageGpt2DirectRenderPackage(input: {
  gpt2Authority: PageGPT2AuthorityConcept;
  creativeInjection: PageCreativeInjection;
  functionContract: PageFunctionContract;
  skinContract: ProjectSkinContract;
  viewport: 'MOBILE' | 'DESKTOP';
  currentImplementationBase64: string | null;
  pageContextSummary: string;
  authoritySourceRunId: string;
}): PageGpt2DirectRenderPackage {
  const authorityB64 = parseAuthorityArtifactBase64(input.gpt2Authority.authorityArtifact);
  if (!authorityB64) {
    throw new Error('GPT2_DIRECT_BLOCKED: GPT2_AUTHORITY_IMAGE_REQUIRED');
  }

  const omitCurrent = pageConceptNbpOmitCurrentScreenshot() || !input.currentImplementationBase64?.trim();
  const viewportDirection =
    input.viewport === 'MOBILE' ? input.creativeInjection.mobileDirection : input.creativeInjection.desktopDirection;

  const prompt = [
    'GPT2 DIRECT RENDER LANE — reconstruct a presentational page concept image from the APPROVED GPT2 AUTHORITY.',
    'THE AUTHORITY IMAGE IS PRIORITY 1 VISUAL INPUT. Do not restyle or trace the current implementation screenshot.',
    `VIEWPORT: ${input.viewport}`,
    `VIEWPORT DIRECTION: ${viewportDirection}`,
    '',
    'PROJECT IDENTITY + SKIN (mandatory):',
    input.skinContract.brandSignals.join(' · '),
    input.skinContract.palette.join(' · '),
    input.skinContract.typography.displayFont,
    `FORBIDDEN DRIFT: ${input.skinContract.forbiddenDrift.join(' · ')}`,
    '',
    'CGPT SYNTHESIS:',
    input.creativeInjection.creativeThesis,
    input.creativeInjection.pagePurposeInterpretation,
    input.creativeInjection.visualOpportunity,
    '',
    'FUNCTION CONTRACT (preserve function, not current visual design):',
    input.functionContract.regions.join(' · '),
    input.pageContextSummary,
    '',
    omitCurrent ?
      'CURRENT IMPLEMENTATION CAPTURE: OMITTED (functional-only policy).'
    : 'CURRENT IMPLEMENTATION CAPTURE: functional reference only — required modules/actions only; do NOT copy aesthetics.',
    '',
    'Output: one strong concept frame — not a raw UI screenshot, not a generic admin dashboard.',
  ].join('\n');

  return {
    prompt,
    authorityBase64: authorityB64,
    inspector: {
      visualAuthorityPresent: true,
      skinContractVersion: input.skinContract.version,
      cgptDirectionId: input.creativeInjection.injectionId,
      functionContractVersion: input.functionContract.version,
      currentScreenshotRole: omitCurrent ? 'OMITTED' : 'FUNCTIONAL_REFERENCE_ONLY',
      promptVersion: PAGE_GPT2_DIRECT_RENDER_PROMPT_VERSION,
    },
    lineage: {
      renderLaneType: 'GPT2_DIRECT',
      renderMode: 'DUAL_RENDER_TEST',
      viewport: input.viewport,
      authorityArtifactId: input.gpt2Authority.conceptId,
      authoritySourceRunId: input.authoritySourceRunId,
    },
  };
}
