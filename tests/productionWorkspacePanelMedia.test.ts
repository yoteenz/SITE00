/**
 * P0.SITE00.PRODUCTION-WORKSPACE.PROJECT-SCOPED-VISUAL-PANEL-RESTORATION1
 * Panel media resolution: project scope, no cross-project fallback, placeholder truth, shared artifact identity.
 */
import { describe, expect, it } from 'vitest';
import {
  artifactsForNode,
  assembleProjectGraph,
  resolveDecisionPanelMedia,
  resolveNodePanelMedia,
  type AssembledProjectGraph,
  type ArtifactRecord,
} from '../shared/site00-production-graph/index';
import { AIO_PROJECT_ID, staticGraphParts } from '../src/site00/production/projectGraphSources';

const jurnlGraph = (): AssembledProjectGraph =>
  assembleProjectGraph({ project_id: 'jurnl', project_name: 'JURNL', project_type: 'TEST' }, staticGraphParts('jurnl'), []);

const aioGraph = (): AssembledProjectGraph =>
  assembleProjectGraph({ project_id: AIO_PROJECT_ID, project_name: 'AIO', project_type: 'TEST' }, staticGraphParts(AIO_PROJECT_ID), []);

describe('panel media resolution', () => {
  it('never returns an artifact from another project', () => {
    const g = jurnlGraph();
    for (const n of g.nodes.slice(0, 8)) {
      const c = resolveNodePanelMedia(g, n);
      expect(c.project_id).toBe('jurnl');
      if (c.artifact) expect(c.artifact.project_id).toBe('jurnl');
    }
  });

  it('uses the same artifact identity for inbox decision and node row on one node', () => {
    const g = jurnlGraph();
    const item = g.decisions.find((d) => d.kind === 'AUTHORITY_VERDICT' && d.state === 'NEEDS_YOU');
    if (!item) return;
    const node = g.nodes.find((n) => n.node_id === item.node_id)!;
    const fromNode = resolveNodePanelMedia(g, node);
    const fromDecision = resolveDecisionPanelMedia(g, item);
    expect(fromDecision.artifact_id).toBe(fromNode.artifact_id);
  });

  it('renders AUTHORITY_NOT_ESTABLISHED when a blocked family has no artifacts', () => {
    const g = jurnlGraph();
    const blocked = g.nodes.find((n) => n.status === 'BLOCKED' && n.node_type === 'PAGE_FAMILY');
    if (!blocked) return;
    expect(artifactsForNode(g, blocked.node_id).length).toBe(0);
    const c = resolveNodePanelMedia(g, blocked);
    expect(c.media_status).toBe('AUTHORITY_NOT_ESTABLISHED');
  });

  it('AIO authority artifacts resolve on AIO nodes only (mounted or recorded)', () => {
    const g = aioGraph();
    expect(g.artifacts.length).toBeGreaterThan(0);
    const node = g.nodes.find((n) => g.artifacts.some((a) => a.source_node_id === n.node_id));
    if (!node) return;
    const c = resolveNodePanelMedia(g, node);
    expect(c.project_id).toBe(AIO_PROJECT_ID);
    expect(c.artifact?.project_id).toBe(AIO_PROJECT_ID);
    if (c.artifact?.url) expect(c.media_status).toBe('MOUNTED');
    else expect(['RECORDED_NOT_MOUNTED', 'REFERENCE_NOT_MOUNTED', 'MEDIA_MISSING']).toContain(c.media_status);
  });

  it('jurnl graph never resolves aio artifact urls on jurnl nodes', () => {
    const j = jurnlGraph();
    const a = aioGraph();
    const aioUrl = a.artifacts.find((x) => x.url)?.url;
    if (!aioUrl) return;
    for (const n of j.nodes) {
      const c = resolveNodePanelMedia(j, n);
      expect(c.artifact?.url).not.toBe(aioUrl);
    }
  });
});
