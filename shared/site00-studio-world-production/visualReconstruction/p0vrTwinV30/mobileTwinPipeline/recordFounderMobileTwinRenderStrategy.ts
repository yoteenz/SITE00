import {
  resolveFocusedHybridGpt2Model,
  resolveFocusedHybridNbpModel,
} from '../../../../site00-visual-generation/twinFocusedHybridBenchmarkCatalog.js';
import type { DesignPageAuthorityReviewSession } from '../types.js';
import type {
  FounderMobileTwinRenderStrategyDecision,
  MobileTwinRenderStrategy,
} from './twinFocusedHybridBenchmarkTypes.js';

const DECISION_TO_ROW: Record<
  Exclude<FounderMobileTwinRenderStrategyDecision, 'UNRESOLVED'>,
  'GPT2_FULL_PAIR' | 'NBP_FULL_PAIR_CORRECTED' | 'GPT2_ACTUAL__NBP_BLUEPRINT'
> = {
  GPT2_FULL_PAIR: 'GPT2_FULL_PAIR',
  NBP_FULL_PAIR: 'NBP_FULL_PAIR_CORRECTED',
  HYBRID_GPT2_ACTUAL__NBP_BLUEPRINT: 'GPT2_ACTUAL__NBP_BLUEPRINT',
};

export function recordFounderMobileTwinRenderStrategy(
  session: DesignPageAuthorityReviewSession,
  decision: FounderMobileTwinRenderStrategyDecision,
  founderNotes?: string | null,
): DesignPageAuthorityReviewSession {
  const pipeline = session.mobileTwinPipeline;
  if (!pipeline?.focusedHybridBenchmark) throw new Error('MOBILE_TWIN_FOCUSED_HYBRID_BENCHMARK_MISSING');

  let strategy: MobileTwinRenderStrategy | null = null;
  if (decision !== 'UNRESOLVED') {
    const rowKey = DECISION_TO_ROW[decision];
    const row = pipeline.focusedHybridBenchmark.strategies[rowKey];
    const gpt2 = resolveFocusedHybridGpt2Model();
    const nbp = resolveFocusedHybridNbpModel();
    const actualModel =
      decision === 'NBP_FULL_PAIR' ? nbp
      : gpt2;
    const blueprintModel =
      decision === 'GPT2_FULL_PAIR' ? gpt2
      : nbp;

    strategy = {
      strategy: decision,
      actualProvider: 'FAL',
      actualModel,
      blueprintProvider: 'FAL',
      blueprintModel,
      benchmarkRunId: pipeline.focusedHybridBenchmark.benchmarkId,
      benchmarkSnapshotId: pipeline.focusedHybridBenchmark.snapshot.id,
      compositionStateId: pipeline.focusedHybridBenchmark.snapshot.compositionStateId,
      compositionHash: pipeline.focusedHybridBenchmark.snapshot.compositionHash,
      actualRenderId: row.actualRenderId,
      blueprintRenderId: row.blueprintRenderId,
      founderNotes: founderNotes ?? null,
      selectedAt: new Date().toISOString(),
      status: 'PROVISIONAL_WINNER',
    };
  }

  return {
    ...session,
    mobileTwinPipeline: {
      ...pipeline,
      mobileTwinRenderStrategy: strategy,
      focusedHybridBenchmark: {
        ...pipeline.focusedHybridBenchmark,
        founderSelectedStrategy: decision,
        founderNotes: founderNotes ?? null,
      },
    },
    updatedAt: new Date().toISOString(),
  };
}
