import type {
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_GPT2_PROMPT_VERSION } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';

export type PageGpt2Input = {
  injection: PageCreativeInjection;
  functionContract: PageFunctionContract;
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
  };
}

export async function generatePageGpt2AuthorityConcept(input: PageGpt2Input): Promise<PageGPT2AuthorityConcept> {
  if (process.env.VITEST === 'true') {
    return vitestAuthority(input);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('GPT2_AUTHORITY_FAILED: OPENAI_API_KEY not configured');

  const model = process.env.SITE00_PAGE_CONCEPT_GPT2_TEXT_MODEL?.trim() || 'gpt-4o-mini';
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
            'Return exactly ONE JSON page authority concept. Never return arrays of concepts or territories.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            promptVersion: PAGE_GPT2_PROMPT_VERSION,
            injection: input.injection,
            functionContract: input.functionContract,
          }),
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
  };
}
