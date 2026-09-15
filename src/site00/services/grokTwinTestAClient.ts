import {
  GROK_TWIN_TEST_A_API_PATH,
  GROK_TWIN_TEST_A_PRODUCTION_API_ORIGIN,
} from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';
import type {
  GrokDesignBenchHostDiagnostic,
  GrokDesignBenchProviderReadinessReceipt,
} from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import type { GrokDesignBenchRun } from '../../../shared/site00-design-bench/grokTwinTestA/types.js';
import { site00ClientApiUrl } from '../../../shared/site00-studio-world-production/site00ClientApiBase.js';

function isPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.includes('fsbw-dev.com') || host.endsWith('.trycloudflare.com') || host === 'localhost' || host === '127.0.0.1';
}

/** Railway first. Same-origin Vite is fallback only — it does not hold production secrets. */
export function listGrokTwinTestAApiUrls(hostname?: string, origin?: string): string[] {
  const host =
    hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
  const pageOrigin =
    origin ?? (typeof window !== 'undefined' ? window.location.origin.replace(/\/$/, '') : '');
  const urls: string[] = [];
  const production = site00ClientApiUrl(GROK_TWIN_TEST_A_API_PATH);
  const railway = `${GROK_TWIN_TEST_A_PRODUCTION_API_ORIGIN}${GROK_TWIN_TEST_A_API_PATH}`;
  if (production) urls.push(production);
  if (!urls.includes(railway)) urls.unshift(railway);
  if (host && isPreviewHost(host) && pageOrigin) {
    const sameOrigin = `${pageOrigin}${GROK_TWIN_TEST_A_API_PATH}`;
    if (!urls.includes(sameOrigin)) urls.push(sameOrigin);
  }
  return [...new Set(urls)];
}

export function grokTwinTestAPayloadReportsMissingHostKey(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const rec = payload as Record<string, unknown>;
  const readiness =
    rec.readiness && typeof rec.readiness === 'object'
      ? (rec.readiness as Record<string, unknown>)
      : null;
  if (readiness?.xaiApiKeyPresent === false) return true;
  const diagnostic =
    rec.hostDiagnostic && typeof rec.hostDiagnostic === 'object'
      ? (rec.hostDiagnostic as Record<string, unknown>)
      : null;
  if (diagnostic?.xaiKeyPresent === false) return true;
  const reason = String(readiness?.reason ?? rec.error ?? '');
  return /missing on the API host/i.test(reason);
}

async function inspectJson(res: Response): Promise<unknown> {
  try {
    return await res.clone().json();
  } catch {
    return null;
  }
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
      const payload = await inspectJson(res);
      if (grokTwinTestAPayloadReportsMissingHostKey(payload)) continue;
      if (res.status !== 404) return res;
    } catch {
      /* try next origin */
    }
  }
  if (last) return last;
  throw new Error('GROK_API_UNREACHABLE');
}

async function getFirstReadyHost(search: string): Promise<Response> {
  let last: Response | null = null;
  for (const url of listGrokTwinTestAApiUrls()) {
    try {
      const res = await fetch(`${url}${search}`, { cache: 'no-store' });
      last = res;
      if (res.ok) {
        const payload = await inspectJson(res);
        if (search.includes('action=readiness') && grokTwinTestAPayloadReportsMissingHostKey(payload)) {
          continue;
        }
        return res;
      }
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

export async function fetchGrokTwinTestAReadiness(): Promise<{
  readiness: GrokDesignBenchProviderReadinessReceipt;
  hostDiagnostic: GrokDesignBenchHostDiagnostic | null;
}> {
  const res = await getFirstReadyHost('?action=readiness');
  const json = (await res.json()) as {
    ok?: boolean;
    readiness?: GrokDesignBenchProviderReadinessReceipt;
    hostDiagnostic?: GrokDesignBenchHostDiagnostic;
    error?: string;
  };
  if (!res.ok || !json.readiness) throw new Error(json.error ?? 'GROK_READINESS_FAILED');
  return {
    readiness: json.readiness,
    hostDiagnostic: json.hostDiagnostic ?? null,
  };
}

export async function pollGrokTwinTestARun(runId: string): Promise<GrokDesignBenchRun> {
  const res = await getFirstReadyHost(`?action=run&runId=${encodeURIComponent(runId)}`);
  const json = (await res.json()) as { ok?: boolean; run?: GrokDesignBenchRun; error?: string };
  if (res.status === 404) throw new Error('RUN_NOT_FOUND');
  if (!res.ok || !json.run) throw new Error(json.error ?? 'GROK_POLL_FAILED');
  return json.run;
}

export async function retryGrokTwinTestARun(runId: string): Promise<GrokDesignBenchRun> {
  const res = await postFirstOk({ action: 'retry', runId });
  const json = (await res.json()) as { ok?: boolean; run?: GrokDesignBenchRun; error?: string };
  if (!res.ok && res.status !== 202) {
    throw new Error(json.error ?? `GROK_RETRY_FAILED_${res.status}`);
  }
  if (!json.run) throw new Error(json.error ?? 'GROK_RETRY_NO_RUN');
  return json.run;
}

export async function cancelGrokTwinTestARun(runId: string): Promise<GrokDesignBenchRun> {
  const res = await postFirstOk({ action: 'cancel', runId });
  const json = (await res.json()) as { ok?: boolean; run?: GrokDesignBenchRun; error?: string };
  if (!res.ok || !json.run) throw new Error(json.error ?? 'GROK_CANCEL_FAILED');
  return json.run;
}

export async function fetchGrokTwinTestARuntimeHealth(): Promise<{
  founderRunReady: boolean;
  modelAccess: string;
  imageInput: string;
  providerTimingProbe: string;
  polling: string;
  stallWatchdog: string;
  timeout: string;
  timingProbe?: { providerLatencyMs: number | null; totalLatencyMs: number | null; pass: boolean };
}> {
  const res = await getFirstReadyHost('?action=runtime_health');
  const json = (await res.json()) as { ok?: boolean; health?: Record<string, unknown> };
  if (!json.health || typeof json.health !== 'object') {
    return {
      founderRunReady: false,
      modelAccess: 'PENDING_API',
      imageInput: 'PENDING_API',
      providerTimingProbe: 'PENDING_API',
      polling: 'PENDING_API',
      stallWatchdog: 'PENDING_API',
      timeout: 'PENDING_API',
    };
  }
  const health = json.health;
  return {
    founderRunReady: health.founderRunReady === true,
    modelAccess: String(health.modelAccess ?? 'FAIL'),
    imageInput: String(health.imageInput ?? 'FAIL'),
    providerTimingProbe: String(health.providerTimingProbe ?? 'FAIL'),
    polling: String(health.polling ?? 'FAIL'),
    stallWatchdog: String(health.stallWatchdog ?? 'FAIL'),
    timeout: String(health.timeout ?? 'FAIL'),
    timingProbe: health.timingProbe as { providerLatencyMs: number | null; totalLatencyMs: number | null; pass: boolean } | undefined,
  };
}
