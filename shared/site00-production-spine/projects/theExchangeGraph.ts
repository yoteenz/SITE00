import type { GraphPart } from '../../site00-production-graph/graph.js';
import type { ProductionNode, SourceTruthRef } from '../../site00-production-graph/types.js';

/**
 * THE EXCHANGE in the production graph: one EXPRESSION node for the record-spine Takes workspace. Browser-safe (no
 * imports beyond types). The node carries no live status: the shot's requirements, jobs and takes are read from the
 * spine API on the TAKES route, so the graph never shows a stale copy of them.
 */
export const EXCHANGE_TAKES_ROUTE = '/production/the-exchange/expression/performance/takes';

export function theExchangeGraphPart(projectId: string): GraphPart {
  const source: SourceTruthRef = { source_id: `${projectId}.spine.records`, kind: 'PRODUCTION_RECORD_SPINE', path: 'THE_EXCHANGE/SEASON_1/PRODUCTION_RECORDS', label: 'Production record spine (pilot repository JSON)' };
  const node: ProductionNode = {
    project_id: projectId,
    node_id: `${projectId}.expression.takes.s1-01`,
    node_type: 'PERFORMANCE',
    label: 'S1-01 · TAKES',
    parent_id: null,
    family_id: null,
    domain: 'EXPRESSION',
    workspace_domains: ['HUB', 'EXPRESSION'],
    current_stage: 'PLANNED',
    pipeline_step: 'PERFORMANCE',
    status: 'ACTIVE',
    status_detail: 'S1-01-SH01 first-take setup recorded; requirements, jobs and takes are live in EXPRESSION → TAKES',
    authority_status: 'REQUIRED',
    approval_status: 'PENDING',
    implementation_status: 'IN_PROGRESS',
    qa_status: 'NOT_RUN',
    live_status: 'NOT_LIVE',
    dependencies: [],
    blockers: [],
    upstream_nodes: [],
    downstream_nodes: [],
    actor_scope: ['FOUNDER'],
    viewport_scope: ['MOBILE', 'TABLET', 'DESKTOP'],
    artifact_ids: [],
    source_truth_ids: [source.source_id],
    last_event: null,
    next_required_action: 'Open TAKES: review the S1-01-SH01 requirements; generation stays disabled until the founder authorizes it separately',
    route: EXCHANGE_TAKES_ROUTE,
    preview_artifact_id: null,
  };
  return { sources: [source], nodes: [node] };
}
