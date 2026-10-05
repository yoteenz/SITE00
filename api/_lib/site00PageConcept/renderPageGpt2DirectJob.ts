import type { PageGpt2DirectRenderPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2DirectRenderPackage.js';

export type PageGpt2DirectRenderInput = {
  package: PageGpt2DirectRenderPackage;
  width: number;
  height: number;
};

export type PageGpt2DirectRenderResult = {
  providerJobId: string;
  imageBase64: string;
  model: string;
};

function mockPng(label: string): string {
  return Buffer.from(`vitest-page-gpt2-direct:${label}`, 'utf8').toString('base64');
}

export async function renderPageGpt2DirectJob(input: PageGpt2DirectRenderInput): Promise<PageGpt2DirectRenderResult> {
  const { package: pkg } = input;
  const viewport = pkg.lineage.viewport;

  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-gpt2-direct-${viewport}`,
      imageBase64: mockPng(viewport),
      model: 'vitest-gpt2-direct',
    };
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('GPT2_DIRECT_RENDER_FAILED: OPENAI_API_KEY not configured');

  const model = process.env.SITE00_PAGE_CONCEPT_GPT2_IMAGE_MODEL?.trim() || 'gpt-image-1';
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: pkg.prompt.slice(0, 32000),
      size: input.width >= input.height ? '1536x1024' : '1024x1536',
      n: 1,
    }),
  });

  if (!res.ok) throw new Error(`GPT2_DIRECT_RENDER_FAILED: ${res.status}`);
  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('GPT2_DIRECT_RENDER_FAILED: no image');
  return {
    providerJobId: `openai-gpt2-direct-${Date.now()}`,
    imageBase64: b64,
    model,
  };
}
