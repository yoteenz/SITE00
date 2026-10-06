/**
 * Project-scoped panel media resolution — no cross-project fallback, no decorative filler.
 * Hierarchy: canonical authority → reference → artifact on node → preview_artifact_id → truthful placeholder.
 */
import { designMethodOf, type DesignMethodId } from './methods.js';
import type { ArtifactRecord, ArtifactType, DecisionItem, ProductionBlocker, ProductionEvent, ProductionNode, ProjectProductionGraph } from './types.js';

export type MediaSlotGeometry = 'THUMBNAIL' | 'PREVIEW' | 'TILE' | 'HERO_PREVIEW' | 'STRIP';
export type MediaFallbackState =
  | 'MOUNTED'
  | 'RECORDED_NOT_MOUNTED'
  | 'MEDIA_MISSING'
  | 'AUTHORITY_NOT_ESTABLISHED'
  | 'REFERENCE_NOT_MOUNTED'
  | 'NONVISUAL_NODE';

export type PanelMediaContract = {
  project_id: string;
  node_id: string | null;
  artifact_id: string | null;
  media_source: string;
  media_status: MediaFallbackState;
  media_purpose: string;
  crop_mode: 'CONTAIN';
  aspect_ratio: string;
  fallback_state: MediaFallbackState;
  click_target: string | null;
  artifact: ArtifactRecord | null;
};

const VISUAL_TYPES: readonly ArtifactType[] = [
  'VISUAL_AUTHORITY',
  'PAGE_FAMILY_AUTHORITY',
  'REFERENCE_AUTHORITY',
  'STORYBOARD_FRAME',
  'PHOTOGRAPHY',
  'ILLUSTRATION',
  'UI_ASSET',
  'WORLD_ASSET',
  'OTHER',
];

const TYPE_RANK = (t: ArtifactType) => {
  const i = VISUAL_TYPES.indexOf(t);
  return i === -1 ? 99 : i;
};

function artifactById(graph: ProjectProductionGraph, id: string | null | undefined): ArtifactRecord | null {
  if (!id) return null;
  const a = graph.artifacts.find((x) => x.artifact_id === id);
  return a?.project_id === graph.project_id ? a : null;
}

export function artifactsForNode(graph: ProjectProductionGraph, nodeId: string): ArtifactRecord[] {
  const node = graph.nodes.find((n) => n.node_id === nodeId);
  const ids = new Set<string>();
  const out: ArtifactRecord[] = [];
  const push = (a: ArtifactRecord | null | undefined) => {
    if (!a || a.project_id !== graph.project_id || ids.has(a.artifact_id)) return;
    ids.add(a.artifact_id);
    out.push(a);
  };
  if (node?.preview_artifact_id) push(artifactById(graph, node.preview_artifact_id));
  for (const id of node?.artifact_ids ?? []) push(artifactById(graph, id));
  for (const a of graph.artifacts) if (a.source_node_id === nodeId) push(a);
  return out.sort((a, b) => TYPE_RANK(a.artifact_type) - TYPE_RANK(b.artifact_type));
}

function pickBestArtifact(artifacts: readonly ArtifactRecord[]): ArtifactRecord | null {
  if (!artifacts.length) return null;
  const withUrl = artifacts.filter((a) => !!a.url);
  const pool = withUrl.length ? withUrl : artifacts;
  return [...pool].sort((a, b) => TYPE_RANK(a.artifact_type) - TYPE_RANK(b.artifact_type))[0] ?? null;
}

function fallbackForNode(node: ProductionNode, artifact: ArtifactRecord | null): MediaFallbackState {
  if (node.node_type === 'PAGE_TREE') return 'NONVISUAL_NODE';
  if (!artifact) {
    if (node.authority_status === 'REQUIRED' || node.pipeline_step === 'VISUAL_AUTHORITY_DEVELOPMENT') return 'AUTHORITY_NOT_ESTABLISHED';
    return 'AUTHORITY_NOT_ESTABLISHED';
  }
  if (artifact.url) return 'MOUNTED';
  if (artifact.status === 'MISSING') return 'MEDIA_MISSING';
  if (artifact.artifact_type === 'REFERENCE_AUTHORITY' || artifact.status === 'REFERENCE') return 'REFERENCE_NOT_MOUNTED';
  return 'RECORDED_NOT_MOUNTED';
}

function contractFrom(
  graph: ProjectProductionGraph,
  node: ProductionNode | null,
  artifact: ArtifactRecord | null,
  source: string,
  purpose: string,
  click: string | null,
): PanelMediaContract {
  const status = node ? fallbackForNode(node, artifact) : artifact?.url ? 'MOUNTED' : artifact ? 'RECORDED_NOT_MOUNTED' : 'MEDIA_MISSING';
  return {
    project_id: graph.project_id,
    node_id: node?.node_id ?? artifact?.source_node_id ?? null,
    artifact_id: artifact?.artifact_id ?? null,
    media_source: source,
    media_status: status,
    media_purpose: purpose,
    crop_mode: 'CONTAIN',
    aspect_ratio: '1',
    fallback_state: status,
    click_target: click,
    artifact,
  };
}

export function resolveNodePanelMedia(graph: ProjectProductionGraph, node: ProductionNode, purpose = 'NODE_ROW'): PanelMediaContract {
  const fromPreview = artifactById(graph, node.preview_artifact_id);
  const pool = artifactsForNode(graph, node.node_id);
  const artifact = fromPreview ?? pickBestArtifact(pool);
  const source = fromPreview ? 'preview_artifact_id' : artifact ? 'node_artifact' : 'none';
  return contractFrom(graph, node, artifact, source, purpose, node.route);
}

export function resolveDecisionPanelMedia(graph: ProjectProductionGraph, item: DecisionItem): PanelMediaContract {
  const node = graph.nodes.find((n) => n.node_id === item.node_id) ?? null;
  if (node) return contractFrom(graph, node, pickBestArtifact(artifactsForNode(graph, node.node_id)), 'decision_node', 'FOUNDER_DECISION', item.route);
  return contractFrom(graph, null, null, 'none', 'FOUNDER_DECISION', item.route);
}

export function resolveBlockerPanelMedia(graph: ProjectProductionGraph, blocker: ProductionBlocker): PanelMediaContract {
  const node = graph.nodes.find((n) => n.node_id === blocker.node_id) ?? null;
  if (!node) return contractFrom(graph, null, null, 'none', 'BLOCKER', null);
  return contractFrom(graph, node, pickBestArtifact(artifactsForNode(graph, node.node_id)), 'blocker_node', 'BLOCKER', node.route);
}

export function resolveEventPanelMedia(graph: ProjectProductionGraph, event: ProductionEvent): PanelMediaContract {
  const fromEvent = artifactById(graph, event.artifact_id);
  const node = event.node_id ? (graph.nodes.find((n) => n.node_id === event.node_id) ?? null) : null;
  const artifact = fromEvent ?? (node ? pickBestArtifact(artifactsForNode(graph, node.node_id)) : null);
  const source = fromEvent ? 'event_artifact_id' : node ? 'event_node' : 'none';
  return contractFrom(graph, node, artifact, source, 'ACTIVITY_EVENT', node?.route ?? null);
}

/** First mounted preview for families at a DESIGN method step (for method strip). */
export function resolveDesignMethodPanelMedia(graph: ProjectProductionGraph, methodId: DesignMethodId): PanelMediaContract | null {
  const families = graph.nodes.filter((n) => n.domain === 'DESIGN' && n.node_type === 'PAGE_FAMILY' && designMethodOf(n) === methodId);
  for (const n of families) {
    const c = resolveNodePanelMedia(graph, n, 'DESIGN_METHOD');
    if (c.artifact?.url) return c;
  }
  for (const n of families) {
    const c = resolveNodePanelMedia(graph, n, 'DESIGN_METHOD');
    if (c.artifact) return c;
  }
  return null;
}

export function placeholderLabel(state: MediaFallbackState, node: ProductionNode | null): string {
  switch (state) {
    case 'AUTHORITY_NOT_ESTABLISHED':
      return 'AUTHORITY NOT YET ESTABLISHED';
    case 'REFERENCE_NOT_MOUNTED':
      return 'REFERENCE · NOT MOUNTED';
    case 'RECORDED_NOT_MOUNTED':
      return 'RECORDED · NOT MOUNTED';
    case 'MEDIA_MISSING':
      return 'MEDIA MISSING';
    case 'NONVISUAL_NODE':
      return 'NONVISUAL NODE';
    default:
      return node?.family_id ?? node?.label?.slice(0, 12) ?? '—';
  }
}
