/** R7MF3P3 — GPT2 vs NBP focused hybrid benchmark (no FLUX). */

import { resolveTwinBenchmarkModel } from './twinProviderBenchmarkCatalog.js';

export const TWIN_FOCUSED_HYBRID_PROMPT_CONTRACT_VERSION = 'r7mf3p3-page-only-nbp-v1' as const;
export const TWIN_FOCUSED_HYBRID_SPRINT_VERSION = '1' as const;

export type FocusedHybridStrategyId =
  | 'GPT2_FULL_PAIR'
  | 'NBP_FULL_PAIR_CORRECTED'
  | 'GPT2_ACTUAL__NBP_BLUEPRINT'
  | 'NON_CANONICAL_AUDIT_PATH';

export const FOCUSED_HYBRID_MAIN_STRATEGIES: FocusedHybridStrategyId[] = [
  'GPT2_FULL_PAIR',
  'NBP_FULL_PAIR_CORRECTED',
  'GPT2_ACTUAL__NBP_BLUEPRINT',
];

export const FOCUSED_HYBRID_ACTIVE_MODELS = {
  GPT2: 'openai/gpt-image-2/edit',
  NBP: 'fal-ai/nano-banana-pro/edit',
} as const;

export function resolveFocusedHybridGpt2Model(): string {
  return resolveTwinBenchmarkModel('GPT2_BASELINE').model;
}

export function resolveFocusedHybridNbpModel(): string {
  const env = process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL?.trim();
  if (env && env !== 'UNAVAILABLE') return env;
  return resolveTwinBenchmarkModel('NBPRO').model;
}

export function isFocusedHybridProviderModel(model: string): boolean {
  const gpt2 = resolveFocusedHybridGpt2Model();
  const nbp = resolveFocusedHybridNbpModel();
  return model === gpt2 || model === nbp;
}

export function focusedHybridIdempotencyKey(
  benchmarkSnapshotId: string,
  strategyId: FocusedHybridStrategyId,
): string {
  return `focused-hybrid:${benchmarkSnapshotId}:${strategyId}:${TWIN_FOCUSED_HYBRID_SPRINT_VERSION}`;
}
