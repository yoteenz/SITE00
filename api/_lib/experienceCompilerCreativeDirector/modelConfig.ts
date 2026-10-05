import { createHash } from 'node:crypto';

export type CreativeDirectorReasoningEffort = 'low' | 'medium' | 'high' | 'max';

export type CreativeDirectorModelConfig = {
  model: string;
  reasoning_effort: CreativeDirectorReasoningEffort;
  max_output_tokens: number;
  response_schema: 'json_object';
  timeout_ms: number;
  retry_policy: { max_attempts: number; backoff_ms: number };
  responses_endpoint: string;
};

const DEFAULT_MODEL = 'gpt-5.6-sol';

export function normalizeCreativeDirectorModelId(raw: string | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return DEFAULT_MODEL;
  // Strip legacy suffixes that encoded reasoning in the model name.
  return value.replace(/-(medium|high|max|low)$/i, '') || DEFAULT_MODEL;
}

export function resolveCreativeDirectorModelConfig(overrides?: {
  reasoning_effort?: CreativeDirectorReasoningEffort;
  max_output_tokens?: number;
}): CreativeDirectorModelConfig {
  const model = normalizeCreativeDirectorModelId(
    process.env.SITE00_CREATIVE_DIRECTOR_MODEL || process.env.OPENAI_CREATIVE_DIRECTOR_MODEL,
  );
  const reasoningRaw = (
    overrides?.reasoning_effort ||
    process.env.SITE00_CREATIVE_DIRECTOR_REASONING ||
    'high'
  )
    .trim()
    .toLowerCase();
  const reasoning_effort: CreativeDirectorReasoningEffort =
    reasoningRaw === 'max' ? 'max' : reasoningRaw === 'medium' ? 'medium' : reasoningRaw === 'low' ? 'low' : 'high';

  return {
    model,
    reasoning_effort,
    max_output_tokens: overrides?.max_output_tokens ?? 16_000,
    response_schema: 'json_object',
    timeout_ms: 600_000,
    retry_policy: { max_attempts: 2, backoff_ms: 1500 },
    responses_endpoint: 'https://api.openai.com/v1/responses',
  };
}

export function validateModelIdentifier(model: string): { ok: true } | { ok: false; reason: string } {
  if (!model || /\s/.test(model)) return { ok: false, reason: 'Model id must be non-empty and contain no spaces' };
  if (/gpt-5\.6-sol-(medium|high|max|low)$/i.test(model)) {
    return { ok: false, reason: 'Reasoning must not be encoded in model id; use SITE00_CREATIVE_DIRECTOR_REASONING' };
  }
  return { ok: true };
}

export function hashContextManifest(manifest: unknown): string {
  return createHash('sha256').update(JSON.stringify(manifest)).digest('hex').slice(0, 32);
}
