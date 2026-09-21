import { PAGE_NBP_MODEL } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type { PageGpt2MobileConceptRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { logPageConceptGpt2MobileEvent } from './pageConceptGpt2MobileObservability.js';

export type PageGpt2MobileConceptRenderInput = {
  package: PageGpt2MobileConceptRequestPackage;
  width: number;
  height: number;
};

export type PageGpt2MobileConceptRenderResult = {
  providerJobId: string;
  imageBase64: string;
  model: string;
  providerRequestId: string;
};

function mockPng(label: string): string {
  return Buffer.from(`vitest-gpt2-mobile:${label}`, 'utf8').toString('base64');
}

export async function renderPageGpt2MobileConceptJob(
  input: PageGpt2MobileConceptRenderInput,
): Promise<PageGpt2MobileConceptRenderResult> {
  const { package: pkg } = input;
  const slot = pkg.lineage.conceptSlot;

  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-gpt2-mobile-${slot}`,
      providerRequestId: `vitest-req-${slot}`,
      imageBase64: mockPng(slot),
      model: 'vitest-gpt2-mobile-fal',
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('GPT2_MOBILE_AUTH_FAILED: FAL_KEY not configured');

  logPageConceptGpt2MobileEvent('GPT2_MOBILE_DISPATCH_REQUESTED', {
    runId: pkg.lineage.runId,
    conceptSlot: slot,
  });

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const bytes = Buffer.from(pkg.functionalCaptureBase64, 'base64');
  const refUrl = await fal.storage.upload(
    new File([bytes], `gpt2-mobile-functional-${slot.toLowerCase()}.png`, { type: 'image/png' }),
  );

  const result = (await fal.subscribe(PAGE_NBP_MODEL, {
    input: { prompt: pkg.prompt, image_urls: [refUrl], num_images: 1 },
    logs: false,
  })) as { request_id?: string; data?: { images?: { url?: string }[] } };

  const providerJobId = result.request_id ?? `fal-gpt2-mobile-${Date.now()}`;
  logPageConceptGpt2MobileEvent('GPT2_MOBILE_PROVIDER_JOB_CREATED', {
    runId: pkg.lineage.runId,
    conceptSlot: slot,
    providerJobId,
  });

  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('GPT2_MOBILE_JOB_FAILED: no image');

  logPageConceptGpt2MobileEvent('GPT2_MOBILE_PROVIDER_RUNNING', {
    runId: pkg.lineage.runId,
    conceptSlot: slot,
    providerJobId,
  });

  const imgRes = await fetch(imageUrl);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  logPageConceptGpt2MobileEvent('GPT2_MOBILE_PROVIDER_COMPLETED', {
    runId: pkg.lineage.runId,
    conceptSlot: slot,
    providerJobId,
  });

  return {
    providerJobId,
    providerRequestId: providerJobId,
    imageBase64: buf.toString('base64'),
    model: PAGE_NBP_MODEL,
  };
}
