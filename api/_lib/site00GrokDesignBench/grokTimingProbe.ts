import { GROK46_SMOKE_PNG_B64 } from './grokAccessProbe.js';
import { grokDesignBenchApiKey } from './grokVisionProvider.js';
import { GROK_DESIGN_BENCH_MODEL_ID } from '../../../shared/site00-design-bench/grokTwinTestA/modelContract.js';
import { GROK_XAI_API_BASE } from '../../../shared/site00-design-bench/grokTwinTestA/constants.js';

export interface GrokTimingProbeResult {
  ran: boolean;
  httpStatus: number | null;
  providerLatencyMs: number | null;
  totalLatencyMs: number | null;
  pass: boolean;
  model: typeof GROK_DESIGN_BENCH_MODEL_ID;
  polling: 'PASS' | 'FAIL';
}

let cache: { at: number; value: GrokTimingProbeResult } | null = null;

export async function runGrokDesignBenchTimingProbe(opts?: { skipCache?: boolean }): Promise<GrokTimingProbeResult> {
  if (!opts?.skipCache && process.env.VITEST !== 'true' && cache && Date.now() - cache.at < 120_000) {
    return cache.value;
  }
  const apiKey = grokDesignBenchApiKey();
  const empty: GrokTimingProbeResult = {
    ran: false,
    httpStatus: null,
    providerLatencyMs: null,
    totalLatencyMs: null,
    pass: false,
    model: GROK_DESIGN_BENCH_MODEL_ID,
    polling: 'FAIL',
  };
  if (!apiKey) return empty;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch(`${GROK_XAI_API_BASE}/responses`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROK_DESIGN_BENCH_MODEL_ID,
        store: false,
        tools: [],
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_image', image_url: `data:image/png;base64,${GROK46_SMOKE_PNG_B64}` },
              { type: 'input_text', text: 'Return exactly JSON {"ok":true,"probe":"timing"} and nothing else.' },
            ],
          },
        ],
      }),
    });
    const body = await res.text();
    const total = Date.now() - started;
    const pass = res.ok && /ok/i.test(body);
    const value: GrokTimingProbeResult = {
      ran: true,
      httpStatus: res.status,
      providerLatencyMs: total,
      totalLatencyMs: total,
      pass,
      model: GROK_DESIGN_BENCH_MODEL_ID,
      polling: 'PASS',
    };
    cache = { at: Date.now(), value };
    return value;
  } catch {
    return { ...empty, ran: true, totalLatencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}
