import type { Map2PipelineState } from '../map2/map2Types';
import type { IngestedAuthorityAsset, SonnetBatchStatus } from './types';

export function evaluateSonnetBatchReadiness(
  _batchId: string,
  pipeline: Map2PipelineState,
  ingested: IngestedAuthorityAsset[],
  packValid: boolean,
  hardBlockers: string[] = [],
): { status: SonnetBatchStatus; blockers: string[] } {
  const blockers: string[] = [...hardBlockers];
  if (pipeline.gate_a.status !== 'APPROVED' || !pipeline.graph?.approved) {
    blockers.push('Experience graph not approved');
    return { status: 'WAITING_FOR_ARCHITECTURE', blockers };
  }
  if (pipeline.gate_b.status !== 'APPROVED') {
    blockers.push('Family/surface gate not approved');
    return { status: 'WAITING_FOR_FAMILY_APPROVAL', blockers };
  }
  const approvedCount = pipeline.authority_plan.filter((a) => a.approval_status === 'APPROVED' || a.approval_status === 'LOVE_IT').length;
  if (pipeline.gate_c.status !== 'APPROVED' && approvedCount < pipeline.authority_plan.length) {
    blockers.push('Visual authorities not fully approved');
    return { status: 'WAITING_FOR_AUTHORITY', blockers };
  }
  if (pipeline.authority_plan.length === 0) {
    blockers.push('No authority plan');
    return { status: 'NOT_READY', blockers };
  }
  const required = new Set(pipeline.authority_plan.map((a) => a.authority_id));
  const have = new Set(ingested.filter((a) => !a.superseded).map((a) => a.authority_id));
  for (const id of required) {
    if (!have.has(id)) {
      blockers.push(`Missing ingest for ${id}`);
      return { status: 'WAITING_FOR_INGEST', blockers };
    }
  }
  if (!packValid) {
    blockers.push('Authority pack invalid or over size limit');
    return { status: 'WAITING_FOR_GENERATION', blockers };
  }
  if (blockers.length) return { status: 'NOT_READY', blockers };
  return { status: 'SONNET_READY', blockers: [] };
}

export function pipelineStageLabel(pipeline: Map2PipelineState): string {
  if (pipeline.gate_0.status !== 'APPROVED') return 'CONCEPT_DIRECTION';
  if (!pipeline.graph?.approved) return 'EXPERIENCE_GRAPH';
  if (pipeline.gate_a.status !== 'APPROVED') return 'EXPERIENCE_GRAPH_REVIEW';
  if (pipeline.gate_b.status !== 'APPROVED') return 'FAMILY_SURFACE';
  if (pipeline.gate_c.status !== 'APPROVED') return 'VISUAL_AUTHORITY';
  return 'PRODUCTION';
}
