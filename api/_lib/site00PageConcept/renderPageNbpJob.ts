import { PAGE_NBP_MODEL } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type {
  PageCreativeInjection,
  PageFunctionContract,
  PageGPT2AuthorityConcept,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import type { PageConceptRenditionSlotId } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export type PageNbpRenderInput = {
  gpt2Authority: PageGPT2AuthorityConcept;
  creativeInjection: PageCreativeInjection;
  renditionSlot: PageConceptRenditionSlotId;
  renditionDirective: string;
  viewport: 'MOBILE' | 'DESKTOP';
  referenceImageBase64: string;
  width: number;
  height: number;
  functionContract: PageFunctionContract;
};

export type PageNbpRenderResult = {
  providerJobId: string;
  imageBase64: string;
  model: string;
};

function mockPng(label: string): string {
  return Buffer.from(`vitest-page-nbp:${label}`, 'utf8').toString('base64');
}

export async function renderPageNbpJob(input: PageNbpRenderInput): Promise<PageNbpRenderResult> {
  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-page-nbp-${input.renditionSlot}-${input.viewport}`,
      imageBase64: mockPng(`${input.renditionSlot}-${input.viewport}`),
      model: 'vitest-page-nbp',
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('NBP_AUTH_FAILED: FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });
  const bytes = Buffer.from(input.referenceImageBase64, 'base64');
  const refUrl = await fal.storage.upload(new File([bytes], 'page-ref.png', { type: 'image/png' }));

  const prompt = [
    'SITE 00 PAGE DESIGN — NBP rendition (presentation only).',
    `Page ${input.gpt2Authority.pageId} · ${input.viewport}`,
    `Rendition ${input.renditionSlot}: ${input.renditionDirective}`,
    `CGPT: ${input.creativeInjection.creativeThesis}`,
    `GPT2 AUTHORITY (single concept — do not reinvent): ${input.gpt2Authority.name} — ${input.gpt2Authority.premise}`,
    `GPT2 VISUAL LANGUAGE: ${input.gpt2Authority.visualLanguage}`,
    input.gpt2Authority.brandSignals ? `BRAND SIGNALS: ${input.gpt2Authority.brandSignals}` : '',
    input.gpt2Authority.avoidList ? `AVOID: ${input.gpt2Authority.avoidList}` : '',
    'Reference image = functional/layout context ONLY. Project identity + GPT2 authority override screenshot palette.',
    `Contract ${input.functionContract.version}`,
  ]
    .filter(Boolean)
    .join('\n');

  const result = (await fal.subscribe(PAGE_NBP_MODEL, {
    input: { prompt, image_urls: [refUrl], num_images: 1 },
    logs: false,
  })) as { request_id?: string; data?: { images?: { url?: string }[] } };

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('NBP_JOB_FAILED: no image');
  const imgRes = await fetch(imageUrl);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  return {
    providerJobId: result.request_id ?? `fal-${Date.now()}`,
    imageBase64: buf.toString('base64'),
    model: PAGE_NBP_MODEL,
  };
}
