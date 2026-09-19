import {
  resolveTwinBenchmarkModel,
  type TwinBenchmarkChallengerSlug,
} from '../../../../site00-visual-generation/twinProviderBenchmarkCatalog.js';
import type { DesignPageAuthorityReviewSession } from '../types.js';
import type {
  FounderProviderBenchmarkDecision,
  MobileTwinProviderStrategy,
} from './twinProviderBenchmarkTypes.js';

const DECISION_TO_SLUG: Record<
  Exclude<FounderProviderBenchmarkDecision, 'NONE'>,
  TwinBenchmarkChallengerSlug
> = {
  GPT_IMAGE_2: 'GPT2_BASELINE',
  NANO_BANANA_PRO: 'NBPRO',
  FLUX_2_MAX: 'FLUX2MAX',
  FLUX_1_KONTEXT_MAX: 'KONTEXTMAX',
};

const DECISION_LABEL: Record<Exclude<FounderProviderBenchmarkDecision, 'NONE'>, string> = {
  GPT_IMAGE_2: 'GPT IMAGE 2',
  NANO_BANANA_PRO: 'NANO BANANA PRO',
  FLUX_2_MAX: 'FLUX.2 MAX',
  FLUX_1_KONTEXT_MAX: 'FLUX.1 KONTEXT MAX',
};

export function recordFounderProviderBenchmarkDecision(
  session: DesignPageAuthorityReviewSession,
  decision: FounderProviderBenchmarkDecision,
  decisionNotes?: string | null,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.providerBenchmark) throw new Error('MOBILE_TWIN_PROVIDER_BENCHMARK_MISSING');

  let strategy: MobileTwinProviderStrategy | null = null;
  if (decision !== 'NONE') {
    const slug = DECISION_TO_SLUG[decision];
    const resolved = resolveTwinBenchmarkModel(slug);
    strategy = {
      generationMethod: 'ATOMIC_SIBLING_FROM_COMPOSITION',
      selectedProvider: 'FAL',
      selectedModel: resolved.model,
      selectedLabel: DECISION_LABEL[decision],
      benchmarkRunId: pipeline.providerBenchmark.benchmarkId,
      compositionSnapshotId: pipeline.providerBenchmark.snapshot.id,
      selectedAt: new Date().toISOString(),
      founderDecision: decision,
      decisionNotes: decisionNotes ?? null,
      status: 'PROVISIONAL_WINNER',
    };
  }

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      mobileTwinProviderStrategy: strategy,
      providerBenchmark: {
        ...pipeline.providerBenchmark,
        founderDecision: decision,
        founderDecisionNotes: decisionNotes ?? null,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
