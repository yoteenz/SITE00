import { buildFalImageInput } from './falImageModels.js';

export type FalReferenceImageJobResult = {
  url: string;
  jobRef: string;
  model: string;
  normalizedInput: Record<string, unknown>;
};

function extractImageUrl(resultData: unknown): string | null {
  const data = resultData as { images?: { url?: string }[]; image?: { url?: string } };
  return data?.images?.[0]?.url ?? data?.image?.url ?? null;
}

/** Single reference-conditioned FAL image job (no silent fallback). */
export async function runFalReferenceImageJob(input: {
  jobKey: string;
  prompt: string;
  referenceImageUrls: string[];
  aspectRatio?: '9:16' | '16:9';
}): Promise<FalReferenceImageJobResult> {
  if (process.env.VITEST === 'true') {
    const model = 'openai/gpt-image-2/edit';
    return {
      url: `vitest-fal://${input.jobKey}`,
      jobRef: `vitest-fal-ref-${input.jobKey}-${Date.now()}`,
      model,
      normalizedInput: {
        prompt: input.prompt,
        image_urls: input.referenceImageUrls,
        jobKey: input.jobKey,
      },
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY_MISSING');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const { model, input: falInput } = buildFalImageInput({
    prompt: input.prompt,
    aspectRatio: input.aspectRatio ?? '9:16',
    referenceImageUrls: input.referenceImageUrls,
  });

  const submitResult = await fal.queue.submit(model, { input: falInput });
  const requestId =
    (submitResult as { request_id?: string }).request_id ?? (submitResult as { requestId?: string }).requestId;
  if (!requestId) throw new Error(`FAL submit missing request_id (${input.jobKey})`);

  await fal.queue.subscribeToStatus(model, { requestId: String(requestId) });
  const result = await fal.queue.result(model, { requestId: String(requestId) });
  const url = extractImageUrl(result.data);
  if (!url) throw new Error(`FAL result missing url (${input.jobKey})`);

  return {
    url,
    jobRef: String(requestId),
    model,
    normalizedInput: { ...falInput, jobKey: input.jobKey },
  };
}
