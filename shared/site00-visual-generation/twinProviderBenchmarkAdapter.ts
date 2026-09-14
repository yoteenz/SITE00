import {
  buildGptImage2EditInput,
  buildGptImage2TextInput,
  isGptImage2Model,
  aspectRatioToGptImage2Size,
} from './falImageModels.js';
import { ensureFalAccessibleReferenceUrls } from './falEnsureReferenceUrls.js';
import type { FalReferenceImageJobResult } from './falReferenceImageJob.js';

export type TwinProviderBenchmarkAdapterInput = {
  jobKey: string;
  model: string;
  prompt: string;
  referenceImageUrls: string[];
  aspectRatio?: '9:16' | '16:9';
  outputWidthPx?: number;
  outputHeightPx?: number;
  providerSettings?: Record<string, unknown>;
};

function buildBenchmarkModelInput(params: TwinProviderBenchmarkAdapterInput, accessibleRefs: string[]): Record<string, unknown> {
  const settings = params.providerSettings ?? {};
  if (isGptImage2Model(params.model)) {
    if (accessibleRefs.length > 0) {
      return { ...buildGptImage2EditInput({ prompt: params.prompt, imageUrls: accessibleRefs }), ...settings };
    }
    return {
      ...buildGptImage2TextInput({ prompt: params.prompt, aspectRatio: params.aspectRatio ?? '9:16' }),
      ...settings,
    };
  }
  if (accessibleRefs.length > 0) {
    return {
      prompt: params.prompt,
      image_url: accessibleRefs[0],
      image_urls: accessibleRefs,
      image_size: aspectRatioToGptImage2Size(params.aspectRatio ?? '9:16'),
      num_images: 1,
      ...settings,
    };
  }
  return {
    prompt: params.prompt,
    image_size: aspectRatioToGptImage2Size(params.aspectRatio ?? '9:16'),
    num_images: 1,
    ...settings,
  };
}

function extractImageUrl(resultData: unknown): string | null {
  const data = resultData as { images?: { url?: string }[]; image?: { url?: string } };
  return data?.images?.[0]?.url ?? data?.image?.url ?? null;
}

/** Normalized Method A benchmark job — no silent model fallback. */
export async function runTwinProviderBenchmarkFalJob(
  input: TwinProviderBenchmarkAdapterInput,
): Promise<FalReferenceImageJobResult & { latencyMs: number }> {
  const started = Date.now();
  if (process.env.VITEST === 'true') {
    return {
      url: `vitest-fal://${input.jobKey}?model=${encodeURIComponent(input.model)}`,
      jobRef: `vitest-benchmark-${input.jobKey}-${Date.now()}`,
      model: input.model,
      normalizedInput: {
        prompt: input.prompt,
        image_urls: input.referenceImageUrls,
        jobKey: input.jobKey,
        benchmarkModel: input.model,
      },
      latencyMs: Date.now() - started,
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY_MISSING');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const accessibleRefs = await ensureFalAccessibleReferenceUrls(input.referenceImageUrls);
  const falInput = buildBenchmarkModelInput(input, accessibleRefs);

  const submitResult = await fal.queue.submit(input.model, { input: falInput });
  const requestId =
    (submitResult as { request_id?: string }).request_id ?? (submitResult as { requestId?: string }).requestId;
  if (!requestId) throw new Error(`FAL submit missing request_id (${input.jobKey})`);

  await fal.queue.subscribeToStatus(input.model, { requestId: String(requestId) });
  const result = await fal.queue.result(input.model, { requestId: String(requestId) });
  const url = extractImageUrl(result.data);
  if (!url) throw new Error(`FAL result missing url (${input.jobKey})`);

  return {
    url,
    jobRef: String(requestId),
    model: input.model,
    normalizedInput: { ...falInput, jobKey: input.jobKey, benchmarkModel: input.model },
    latencyMs: Date.now() - started,
  };
}
