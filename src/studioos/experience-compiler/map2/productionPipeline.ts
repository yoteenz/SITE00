import type { Map2PipelineState } from './map2Types';

export const MODEL_PIPELINE_STAGES = ['OPENART_BATCH', 'COMPOSER_PACK', 'SONNET', 'OPUS', 'GROK', 'COMPOSER', 'PRODUCTION'] as const;

export function nextProductionStage(current: string): string | null {
  const i = MODEL_PIPELINE_STAGES.indexOf(current as (typeof MODEL_PIPELINE_STAGES)[number]);
  if (i < 0 || i >= MODEL_PIPELINE_STAGES.length - 1) return null;
  return MODEL_PIPELINE_STAGES[i + 1];
}

export function pipelineReadiness(state: Map2PipelineState): { ready_for_openart: boolean; blockers: string[] } {
  const blockers: string[] = [];
  if (state.gate_0.status !== 'APPROVED') blockers.push('GATE_0');
  if (!state.graph?.approved) blockers.push('GRAPH');
  if (state.gate_a.status !== 'APPROVED') blockers.push('GATE_A');
  if (state.gate_b.status !== 'APPROVED') blockers.push('GATE_B');
  return { ready_for_openart: blockers.length === 0, blockers };
}
