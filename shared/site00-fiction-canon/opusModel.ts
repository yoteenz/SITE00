/**
 * Resolve Claude Opus model id from environment — no hard-coded unsupported version.
 * Paid execution requires explicit authorization env (see opusEvaluationAdapter).
 */

const OPUS_MODEL_CANDIDATES = [
  'SITE00_FICTION_OPUS_MODEL',
  'ANTHROPIC_OPUS_MODEL',
  'ANTHROPIC_CREATIVE_MODEL',
] as const;

export function resolveFictionOpusModelId(): string {
  for (const key of OPUS_MODEL_CANDIDATES) {
    const value = process.env[key]?.trim();
    if (value && /opus/i.test(value)) return value;
  }
  const creative = process.env.SITE00_CREATIVE_INTELLIGENCE_MODEL?.trim();
  if (creative && /opus/i.test(creative)) return creative;
  return 'claude-opus-4-20250514';
}

export function isFictionOpusExecutionAuthorized(): boolean {
  return process.env.SITE00_FICTION_OPUS_EXECUTION_AUTHORIZED === '1';
}
