import {
  GROK_TWIN_TEST_A_API_PATH,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import type { GrokDesignBenchProviderReadinessReceipt } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import type { GrokDesignBenchRun } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import { site00ClientApiUrl } from '../../../shared/site00-studio-world-production/site00ClientApiBase.js';

function isPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com') || host === 'localhost' || host === '127.0.0.1';
}

export function listGrokTwinTestAApiUrls(): string[] {
  const urls: string[] = [];
  if (typeof window !== 'undefined' && isPreviewHost(window.location.hostname)) {
    urls.push(`${window.location.origin.replace(/\/$/, '')}${GROK_TWIN_TEST_A_API_PATH}`);
  }
  const production = site00ClientApiUrl(GROK_TWIN_TEST_A_API_PATH);
  if (!urls.includes(production)) urls.push(production);
  return urls;
}

async function postFirstOk(body: unknown): Promise<Response> {
  let last: Response | null = null;
  for (const url of listGrokTwinTestAApiUrls()) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      last = res;
      if (res.ok || res.status === 202) return res;
      if (res.status !== 404) return res;
    } catch {
      /* try next origin */
    }
  }
  if (last) return last;
  throw new Error('GROK_API_UNREACHABLE');
}

async function getFirstOk(search: string): Promise<Response> {
  let last: Response | null = null;
  for (const url of listGrokTwinTestAApiUrls()) {
    try {
      const res = await fetch(`${url}${search}`, { cache: 'no-store' });
      last = res;
      if (res.ok) return res;
      if (res.status !== 404) return res;
    } catch {
      /* try next */
    }
  }
  if (last) return last;
  throw new Error('GROK_API_UNREACHABLE');
}

export async function startGrokTwinTestARun(input: {
  projectId: string;
  filename: string;
  mime: string;
  width: number;
  height: number;
  imageBase64: string;
}): Promise<GrokDesignBenchRun> {
  const res = await postFirstOk({ action: 'start', ...input });
  const json = (await res.json()) as { ok?: boolean; run?: GrokDesignBenchRun; error?: string };
  if (!res.ok && res.status !== 202) {
    throw new Error(json.error ?? `GROK_START_FAILED_${res.status}`);
  }
  if (!json.run) throw new Error(json.error ?? 'GROK_START_NO_RUN');
  return json.run;
}

export async function fetchGrokTwinTestAReadiness(): Promise<GrokDesignBenchProviderReadinessReceipt> {
  const res = await getFirstOk('?action=readiness');
  const json = (await res.json()) as { ok?: boolean; readiness?: GrokDesignBenchProviderReadinessReceipt; error?: string };
  if (!res.ok || !json.readiness) throw new Error(json.error ?? 'GROK_READINESS_FAILED');
  return json.readiness;
}

export async function pollGrokTwinTestARun(runId: string): Promise<GrokDesignBenchRun> {
  const res = await getFirstOk(`?action=run&runId=${encodeURIComponent(runId)}`);
  const json = (await res.json()) as { ok?: boolean; run?: GrokDesignBenchRun; error?: string };
  if (!res.ok || !json.run) throw new Error(json.error ?? 'GROK_POLL_FAILED');
  return json.run;
}
