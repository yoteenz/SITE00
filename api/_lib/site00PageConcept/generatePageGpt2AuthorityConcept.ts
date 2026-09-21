import type {
  PageCreativeContext,
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
  ProjectCreativeContext,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  buildPageConceptGpt2AuthorityPackage,
  type PageConceptGpt2AuthorityPackage,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2AuthorityPackage.js';

export type PageGpt2Input = {
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  implementationCaptureNote?: string;
};

function vitestAuthority(input: PageGpt2Input): PageGPT2AuthorityConcept {
  const inj = input.injection;
  const now = new Date().toISOString();
  return {
    conceptId: `pg2-vitest-${inj.pageId}`,
    projectId: inj.projectId,
    pageId: inj.pageId,
    injectionId: inj.injectionId,
    name: 'Page authority concept',
    premise: inj.creativeThesis,
    hierarchyStrategy: inj.hierarchyDirection,
    compositionStrategy: inj.spatialDirection,
    visualLanguage: inj.visualOpportunity,
    interactionPresentation: 'Recessed controls · dominant hero',
    mobileIntent: inj.mobileDirection,
    desktopIntent: inj.desktopDirection,
    authorityArtifact: `data:image/png;base64,${Buffer.from('vitest-page-gpt2', 'utf8').toString('base64')}`,
    gpt2Provider: 'vitest',
    gpt2Model: 'mock-page-gpt2',
    createdAt: now,
    conceptRationale: 'Vitest authority',
    brandSignals: input.projectContext.brandTruth,
    groundingPackageVersion: 'page-gpt2-authority-v2-grounding',
  };
}

export function buildRuntimePageGpt2AuthorityPackage(input: PageGpt2Input): PageConceptGpt2AuthorityPackage {
  return buildPageConceptGpt2AuthorityPackage({
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    injection: input.injection,
    implementationCaptureNote: input.implementationCaptureNote,
  });
}

export async function generatePageGpt2AuthorityConcept(input: PageGpt2Input): Promise<PageGPT2AuthorityConcept> {
  if (process.env.VITEST === 'true') {
    return vitestAuthority(input);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('GPT2_AUTHORITY_FAILED: OPENAI_API_KEY not configured');

  const model = process.env.SITE00_PAGE_CONCEPT_GPT2_TEXT_MODEL?.trim() || 'gpt-4o-mini';
  const authorityPackage = buildRuntimePageGpt2AuthorityPackage(input);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Return exactly ONE JSON page authority concept object (requiredOutputShape). Never return arrays of concepts. Project identity and CGPT direction override implementation capture aesthetics.',
        },
        {
          role: 'user',
          content: JSON.stringify(authorityPackage.payload),
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`GPT2_AUTHORITY_FAILED: ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? '{}') as Record<string, unknown>;
  if (Array.isArray(parsed.concepts)) throw new Error('GPT2_AUTHORITY_FAILED: multi-concept rejected');

  const inj = input.injection;
  const now = new Date().toISOString();
  return {
    conceptId: `pg2-${Date.now()}`,
    projectId: inj.projectId,
    pageId: inj.pageId,
    injectionId: inj.injectionId,
    name: String(parsed.name ?? 'Page authority'),
    premise: String(parsed.premise ?? inj.creativeThesis),
    hierarchyStrategy: String(parsed.hierarchyStrategy ?? inj.hierarchyDirection),
    compositionStrategy: String(parsed.compositionStrategy ?? inj.spatialDirection),
    visualLanguage: String(parsed.visualLanguage ?? inj.visualOpportunity),
    interactionPresentation: String(parsed.interactionPresentation ?? ''),
    mobileIntent: String(parsed.mobileIntent ?? inj.mobileDirection),
    desktopIntent: String(parsed.desktopIntent ?? inj.desktopDirection),
    authorityArtifact: null,
    gpt2Provider: 'openai',
    gpt2Model: model,
    createdAt: now,
    conceptRationale: String(parsed.conceptRationale ?? ''),
    brandSignals: String(parsed.brandSignals ?? ''),
    imageStrategy: String(parsed.imageStrategy ?? ''),
    avoidList: String(parsed.avoidList ?? ''),
    groundingPackageVersion: authorityPackage.promptVersion,
  };
}
