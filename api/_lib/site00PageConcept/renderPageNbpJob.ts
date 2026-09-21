import { PAGE_NBP_MODEL } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type { PageNbpRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptNbpRequestPackage.js';

export type PageNbpRenderInput = {
  package: PageNbpRequestPackage;
  width: number;
  height: number;
};

export type PageNbpRenderResult = {
  providerJobId: string;
  imageBase64: string;
  model: string;
  imageInputOrder: readonly string[];
};

function mockPng(label: string): string {
  return Buffer.from(`vitest-page-nbp:${label}`, 'utf8').toString('base64');
}

export async function renderPageNbpJob(input: PageNbpRenderInput): Promise<PageNbpRenderResult> {
  const { package: pkg } = input;
  const order = pkg.imageInputs.map((img) => img.role);

  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-page-nbp-${pkg.lineage.renditionSlot}-${pkg.lineage.viewport}`,
      imageBase64: mockPng(`${pkg.lineage.renditionSlot}-${pkg.lineage.viewport}`),
      model: 'vitest-page-nbp',
      imageInputOrder: order,
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('NBP_AUTH_FAILED: FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const image_urls: string[] = [];
  for (const img of pkg.imageInputs) {
    const bytes = Buffer.from(img.base64, 'base64');
    const refUrl = await fal.storage.upload(
      new File([bytes], `page-nbp-${img.role.toLowerCase()}.png`, { type: 'image/png' }),
    );
    image_urls.push(refUrl);
  }

  const result = (await fal.subscribe(PAGE_NBP_MODEL, {
    input: { prompt: pkg.prompt, image_urls, num_images: 1 },
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
    imageInputOrder: order,
  };
}
