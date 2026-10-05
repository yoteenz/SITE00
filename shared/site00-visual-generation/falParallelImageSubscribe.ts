import { buildFalImageInput } from './falImageModels.js';

export type FalParallelImageJobSpec = {
  jobKey: string;
  prompt: string;
  aspectRatio: '9:16' | '16:9';
};

export type FalParallelImageJobResult = {
  jobKey: string;
  url: string;
  jobRef: string;
  enqueueOffsetMs: number;
};

function extractImageUrl(resultData: unknown): string | null {
  const data = resultData as { images?: { url?: string }[]; image?: { url?: string } };
  return data?.images?.[0]?.url ?? data?.image?.url ?? null;
}

/**
 * Submit all FAL image jobs to the queue in parallel, then wait for all results in parallel.
 * (Avoids wrapping subscribe in serial awaits — enqueue spread visible in providerTrace.)
 */
export async function runFalImageJobsParallel(
  jobs: FalParallelImageJobSpec[],
): Promise<{ results: FalParallelImageJobResult[]; providerTrace: string[] }> {
  const batchStartMs = Date.now();
  const trace: string[] = [`FAL_PARALLEL_BATCH startMs=${batchStartMs} jobCount=${jobs.length}`];

  if (jobs.length === 0) {
    return { results: [], providerTrace: trace };
  }

  if (process.env.VITEST === 'true') {
    const results = jobs.map((job, index) => ({
      jobKey: job.jobKey,
      url: `vitest://${job.jobKey}`,
      jobRef: `vitest-fal-parallel-${job.jobKey}-${batchStartMs}-${index}`,
      enqueueOffsetMs: 0,
    }));
    trace.push('FAL_PARALLEL_ENQUEUE spreadMs=0 (vitest)');
    trace.push(`FAL_PARALLEL_COMPLETE elapsedMs=${Date.now() - batchStartMs}`);
    return { results, providerTrace: trace };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('FAL_KEY_MISSING');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const specs = jobs.map((job) => ({
    jobKey: job.jobKey,
    ...buildFalImageInput({ prompt: job.prompt, aspectRatio: job.aspectRatio }),
  }));

  const enqueued = await Promise.all(
    specs.map((spec) => {
      const submitStartedMs = Date.now();
      return fal.queue
        .submit(spec.model, { input: spec.input })
        .then((submitResult) => {
          const enqueuedAtMs = Date.now();
          const requestId =
            (submitResult as { request_id?: string }).request_id ??
            (submitResult as { requestId?: string }).requestId;
          if (!requestId) throw new Error(`FAL submit missing request_id (${spec.jobKey})`);
          return {
            jobKey: spec.jobKey,
            model: spec.model,
            requestId: String(requestId),
            enqueueOffsetMs: enqueuedAtMs - batchStartMs,
            submitLatencyMs: enqueuedAtMs - submitStartedMs,
          };
        });
    }),
  );

  const offsets = enqueued.map((e) => e.enqueueOffsetMs);
  const spreadMs = Math.max(...offsets) - Math.min(...offsets);
  trace.push(`FAL_PARALLEL_ENQUEUE spreadMs=${spreadMs} (${jobs.length} simultaneous submits)`);
  for (const row of enqueued) {
    trace.push(
      `ENQUEUED ${row.jobKey} requestId=${row.requestId} offsetMs=${row.enqueueOffsetMs} submitMs=${row.submitLatencyMs}`,
    );
  }

  const completed = await Promise.all(
    enqueued.map(async (row) => {
      await fal.queue.subscribeToStatus(row.model, { requestId: row.requestId });
      const result = await fal.queue.result(row.model, { requestId: row.requestId });
      const url = extractImageUrl(result.data);
      if (!url) throw new Error(`FAL result missing url (${row.jobKey})`);
      return {
        jobKey: row.jobKey,
        url,
        jobRef: row.requestId,
        enqueueOffsetMs: row.enqueueOffsetMs,
      };
    }),
  );

  trace.push(`FAL_PARALLEL_COMPLETE elapsedMs=${Date.now() - batchStartMs}`);
  return { results: completed, providerTrace: trace };
}
