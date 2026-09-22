import { PAGE_GPT2_MOBILE_FAL_MODEL } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type { PageGpt2MobileConceptRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { assertGpt2MobilePackageNotNbpPath } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobilePageAuthority.js';
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
  return Buffer.from(`vitest-gpt2-mobile-page:${label}`, 'utf8').toString('base64');
}

export async function renderPageGpt2MobileConceptJob(
  input: PageGpt2MobileConceptRenderInput,
): Promise<PageGpt2MobileConceptRenderResult> {
  const { package: pkg } = input;
  const slot = pkg.lineage.conceptSlot;

  assertGpt2MobilePackageNotNbpPath({
    promptVersion: pkg.inspector.promptVersion,
    stageContract: pkg.inspector.stageContract,
    providerLabel: pkg.inspector.providerLabel,
  });

  if (process.env.VITEST === 'true') {
    return {
      providerJobId: `vitest-gpt2-mobile-page-${slot}`,
      providerRequestId: `vitest-req-${slot}`,
      imageBase64: mockPng(slot),
      model: 'vitest-gpt2-mobile-page-fal',
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

  const image_urls: string[] = [];
  if (pkg.inspector.bottomContinuityApplied && pkg.bottomContinuityCaptureBase64.trim()) {
    const bytes = Buffer.from(pkg.bottomContinuityCaptureBase64, 'base64');
    const refUrl = await fal.storage.upload(
      new File([bytes], `gpt2-mobile-bottom-continuity-${slot.toLowerCase()}.png`, { type: 'image/png' }),
    );
    image_urls.push(refUrl);
  }

  const falInput = {
    prompt: pkg.prompt,
    num_images: 1,
    image_urls,
  };

  const result = (await fal.subscribe(PAGE_GPT2_MOBILE_FAL_MODEL, {
    input: falInput,
    logs: false,
  })) as { request_id?: string; data?: { images?: { url?: string }[] } };

  const providerJobId = result.request_id ?? `fal-gpt2-mobile-page-${Date.now()}`;
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
    model: PAGE_GPT2_MOBILE_FAL_MODEL,
  };
}
