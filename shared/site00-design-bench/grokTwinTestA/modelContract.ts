/** P0.VR.DESIGNBENCH.GROK1F1 — hard-bound Grok 4.6 model contract. */

export const GROK_DESIGN_BENCH_MODEL_ID = 'grok-4.6' as const;
export const GROK_DESIGN_BENCH_PROVIDER = 'xai' as const;
export const GROK_DESIGN_BENCH_PROVIDER_LABEL = 'xAI' as const;
export const GROK_DESIGN_BENCH_PROMPT_VERSION = 'grok-4.6-bench-v1' as const;
export const GROK_4_6_PROVIDER_BINDING_FAILED = 'GROK_4_6_PROVIDER_BINDING_FAILED' as const;

export const GROK_DESIGN_BENCH_FORBIDDEN_MODELS = [
  'grok-2-vision-1212',
  'grok-2-1212',
  'grok-2-vision',
  'grok-3',
  'grok-3-mini',
  'grok-4',
  'grok-4-fast',
  'grok-test-harness',
] as const;

export const GROK_DESIGN_BENCH_MODEL_CONTRACT = {
  provider: GROK_DESIGN_BENCH_PROVIDER,
  modelId: GROK_DESIGN_BENCH_MODEL_ID,
  visionInputRequired: true,
  fallbackAllowed: false,
  webSearchAllowed: false,
  competitorAccessAllowed: false,
} as const;

export type GrokDesignBenchModelContract = typeof GROK_DESIGN_BENCH_MODEL_CONTRACT;

export interface GrokBenchmarkInputReceipt {
  runId: string;
  referenceSha256: string;
  referenceWidth: number;
  referenceHeight: number;
  imageInputAttached: true;
  provider: 'xai';
  modelId: typeof GROK_DESIGN_BENCH_MODEL_ID;
  promptVersion: typeof GROK_DESIGN_BENCH_PROMPT_VERSION;
}

export interface GrokDesignBenchProviderReadinessReceipt {
  state: 'READY' | 'BLOCKED';
  reason: string | null;
  provider: 'xai';
  modelId: typeof GROK_DESIGN_BENCH_MODEL_ID;
  xaiApiKeyPresent: boolean;
  modelHardBound: true;
  fallbackAllowed: false;
  webSearchAllowed: false;
  visionInputRequired: true;
  imageInputCanAttach: boolean;
  competitorAccessAllowed: false;
}

export interface GrokDesignBenchProviderFailure {
  code: typeof GROK_4_6_PROVIDER_BINDING_FAILED;
  providerResponseCode: number | null;
  classification: 'MODEL_REJECTED' | 'AUTH' | 'RATE_LIMIT' | 'NETWORK' | 'UNKNOWN';
  runId: string;
  detail: string;
}

export function assertGrok46HardBind(modelId: string): asserts modelId is typeof GROK_DESIGN_BENCH_MODEL_ID {
  if (modelId !== GROK_DESIGN_BENCH_MODEL_ID) {
    throw new Error(`${GROK_4_6_PROVIDER_BINDING_FAILED}: modelId ${modelId} is not ${GROK_DESIGN_BENCH_MODEL_ID}`);
  }
}

export function isForbiddenGrokBenchModel(modelId: string): boolean {
  return (GROK_DESIGN_BENCH_FORBIDDEN_MODELS as readonly string[]).includes(modelId);
}

export function classifyGrok46ProviderError(status: number | null, body: string): GrokDesignBenchProviderFailure['classification'] {
  const text = body.toLowerCase();
  if (status === 401 || status === 403 || text.includes('invalid api key') || text.includes('unauthorized')) {
    return 'AUTH';
  }
  if (status === 429) return 'RATE_LIMIT';
  if (
    status === 404 ||
    text.includes('model') && (text.includes('not found') || text.includes('unknown') || text.includes('does not exist') || text.includes('unsupported'))
  ) {
    return 'MODEL_REJECTED';
  }
  if (status == null) return 'NETWORK';
  return 'UNKNOWN';
}

export function formatGrok46BindingFailure(args: {
  runId: string;
  status: number | null;
  body: string;
}): string {
  const classification = classifyGrok46ProviderError(args.status, args.body);
  return [
    GROK_4_6_PROVIDER_BINDING_FAILED,
    `modelId=${GROK_DESIGN_BENCH_MODEL_ID}`,
    `runId=${args.runId}`,
    `providerResponseCode=${args.status ?? 'none'}`,
    `classification=${classification}`,
  ].join(' ');
}
