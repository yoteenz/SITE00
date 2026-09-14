/** R7MF3P2 — canonical FAL model IDs for Method A provider benchmark (override via env). */

export const TWIN_BENCHMARK_PROMPT_CONTRACT_VERSION = 'r7mf3p2-method-a-v1' as const;
export const TWIN_BENCHMARK_VERSION = '1' as const;

export type TwinBenchmarkChallengerSlug = 'GPT2_BASELINE' | 'NBPRO' | 'FLUX2MAX' | 'KONTEXTMAX';

export type TwinBenchmarkModelResolution = {
  slug: TwinBenchmarkChallengerSlug;
  provider: 'FAL';
  model: string;
  label: string;
  available: boolean;
  unavailableReason?: string;
};

const DEFAULT_MODELS: Record<Exclude<TwinBenchmarkChallengerSlug, 'GPT2_BASELINE'>, string> = {
  NBPRO: 'fal-ai/nano-banana-pro/edit',
  FLUX2MAX: 'fal-ai/flux-2-max/edit',
  KONTEXTMAX: 'fal-ai/flux-pro/kontext/max',
};

export function resolveTwinBenchmarkModel(slug: TwinBenchmarkChallengerSlug): TwinBenchmarkModelResolution {
  if (slug === 'GPT2_BASELINE') {
    return {
      slug,
      provider: 'FAL',
      model: 'openai/gpt-image-2/edit',
      label: 'GPT IMAGE 2',
      available: true,
    };
  }
  const envKey =
    slug === 'NBPRO' ? process.env.SITE00_TWIN_BENCHMARK_NBPRO_MODEL
    : slug === 'FLUX2MAX' ? process.env.SITE00_TWIN_BENCHMARK_FLUX2MAX_MODEL
    : process.env.SITE00_TWIN_BENCHMARK_KONTEXTMAX_MODEL;
  const model = (envKey?.trim() || DEFAULT_MODELS[slug]).trim();
  if (model === 'UNAVAILABLE') {
    return {
      slug,
      provider: 'FAL',
      model,
      label: slug,
      available: false,
      unavailableReason: 'MODEL_MARKED_UNAVAILABLE',
    };
  }
  return {
    slug,
    provider: 'FAL',
    model,
    label:
      slug === 'NBPRO' ? 'NANO BANANA PRO'
      : slug === 'FLUX2MAX' ? 'FLUX.2 MAX'
      : 'FLUX.1 KONTEXT MAX',
    available: true,
  };
}

export const TWIN_BENCHMARK_CHALLENGERS: TwinBenchmarkChallengerSlug[] = ['NBPRO', 'FLUX2MAX', 'KONTEXTMAX'];
