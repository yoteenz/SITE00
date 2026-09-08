/**
 * Poll C19R3 Meridian live job (POST start, GET ?jobId= poll).
 */

import { apiFetch } from '../../../../utils/api.js';
import type { MeridianComparisonViewData } from './MeridianDeterministicVsLiveComparison.js';

const POLL_MS = 3_000;
const MAX_WAIT_MS = 20 * 60_000;

type MeridianJobPollBody = {
  jobId?: string;
  status?: string;
  asyncRequired?: boolean;
  view?: MeridianComparisonViewData;
  acceptanceStatus?: string;
  errorMessage?: string;
};

export async function loadC19R3MeridianComparisonViaJob(): Promise<MeridianComparisonViewData | null> {
  const startRes = await apiFetch('/api/site00/expression-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'START_C19R3_MERIDIAN_LIVE_JOB' }),
  });

  if (!startRes.ok) {
    return null;
  }

  const started = (await startRes.json()) as { jobId?: string };
  const jobId = started.jobId;
  if (!jobId) return null;

  const startedAt = Date.now();
  while (Date.now() - startedAt < MAX_WAIT_MS) {
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
    if (body.view) {
      return body.view;
    }
    if (body.status === 'COMPLETED' && body.view) {
      return body.view;
    }

    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  throw new Error('Timed out waiting for C19R3 Meridian live job');
}
