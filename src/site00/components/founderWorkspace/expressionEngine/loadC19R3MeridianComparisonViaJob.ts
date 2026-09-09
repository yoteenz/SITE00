/**
 * C19R3 Meridian comparison loader — non-blocking workspace hydration.
 * Never auto-starts a live job on page load (that blocked the whole Expression Engine for ~2min+).
 */

import { apiFetch } from '../../../../utils/api.js';
import type { MeridianComparisonViewData } from './MeridianDeterministicVsLiveComparison.js';

const POLL_MS = 3_000;
const BACKGROUND_POLL_MAX_MS = 180_000;
const LIVE_JOB_MAX_MS = 20 * 60_000;

type MeridianJobPollBody = {
  jobId?: string;
  status?: string;
  asyncRequired?: boolean;
  view?: MeridianComparisonViewData;
  latestJob?: {
    jobId?: string;
    status?: string;
    view?: MeridianComparisonViewData;
  } | null;
  errorMessage?: string;
};

function extractView(body: MeridianJobPollBody): MeridianComparisonViewData | null {
  return body.view ?? null;
}

async function pollMeridianJob(
  jobId: string,
  maxWaitMs: number,
): Promise<MeridianComparisonViewData | null> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < maxWaitMs) {
    const pollRes = await apiFetch(
      `/api/site00/expression-engine?phase=C1.9R3&jobId=${encodeURIComponent(jobId)}`,
    );
    if (!pollRes.ok && pollRes.status !== 202) {
      return null;
    }

    const body = (await pollRes.json()) as MeridianJobPollBody;
    if (body.status === 'FAILED') {
      throw new Error(body.errorMessage ?? 'Meridian live job failed');
    }
    const view = extractView(body);
    if (view) return view;

    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return null;
}

/** GET latest completed C19R3 snapshot or poll an in-flight job — never starts a new job. */
export async function loadMeridianComparisonSnapshot(): Promise<MeridianComparisonViewData | null> {
  const snapRes = await apiFetch('/api/site00/expression-engine?phase=C1.9R3');
  if (!snapRes.ok && snapRes.status !== 202) {
    return null;
  }

  const body = (await snapRes.json()) as MeridianJobPollBody;
  const direct = extractView(body);
  if (direct) return direct;

  const latest = body.latestJob;
  if (latest?.view) return latest.view;

  if (latest?.jobId && (latest.status === 'QUEUED' || latest.status === 'RUNNING')) {
    return pollMeridianJob(latest.jobId, BACKGROUND_POLL_MAX_MS);
  }

  return null;
}

/** Fallback deterministic Meridian proof (sync bootstrap, no job queue). */
export async function loadMeridianComparisonFallback(): Promise<MeridianComparisonViewData | null> {
  const res = await apiFetch('/api/site00/expression-engine?phase=C1.9R1');
  if (!res.ok) return null;
  const body = (await res.json()) as { view?: MeridianComparisonViewData };
  return body.view ?? null;
}

/** Explicit live job start + poll (founder-triggered only). */
export async function startMeridianLiveComparisonJob(): Promise<MeridianComparisonViewData | null> {
  const startRes = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'START_C19R3_MERIDIAN_LIVE_JOB' }),
  });

  if (!startRes.ok) {
    return null;
  }

  const started = (await startRes.json()) as { jobId?: string };
  if (!started.jobId) return null;

  const view = await pollMeridianJob(started.jobId, LIVE_JOB_MAX_MS);
  if (!view) {
    throw new Error('Timed out waiting for C19R3 Meridian live job');
  }
  return view;
}

/**
 * Hydrate Meridian section without blocking core workspace load.
 * Order: latest C19R3 snapshot → C19R1 fallback.
 */
export async function loadMeridianComparisonForWorkspace(): Promise<MeridianComparisonViewData | null> {
  const snapshot = await loadMeridianComparisonSnapshot();
  if (snapshot) return snapshot;
  return loadMeridianComparisonFallback();
}

/** @deprecated Use loadMeridianComparisonForWorkspace — kept for tests / explicit live runs. */
export async function loadC19R3MeridianComparisonViaJob(): Promise<MeridianComparisonViewData | null> {
  return startMeridianLiveComparisonJob();
}
