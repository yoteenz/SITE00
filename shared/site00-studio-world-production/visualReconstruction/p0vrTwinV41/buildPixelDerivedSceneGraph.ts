import { V40_SCENE_GRAPH_REJECTION_REASON } from './constants.js';
import type {
  ForensicPixelAnalysis,
  PixelEvidenceContract,
  TwinV41PixelDerivedSceneGraph,
  TwinV41PixelSceneNode,
} from './twinV41Types.js';

function evidence(input: {
  refs: PixelEvidenceContract['evidenceRefs'];
  confidence: number;
  method: string;
  authorityHash: string;
}): PixelEvidenceContract {
  return {
    evidenceRefs: input.refs,
    evidenceCount: input.refs.length,
    confidence: input.confidence,
    extractionMethod: input.method,
    sourceAuthorityHash: input.authorityHash,
  };
}

export function buildTwinV41PixelDerivedSceneGraph(input: {
  analysis: ForensicPixelAnalysis;
  authorityHash: string;
}): TwinV41PixelDerivedSceneGraph {
  const nodes: TwinV41PixelSceneNode[] = [];
  const rootId = 'DOCUMENT_ROOT';

  nodes.push({
    sceneNodeId: rootId,
    parentNodeId: null,
    type: 'DOCUMENT',
    x: 0,
    y: 0,
    width: input.analysis.coordinateSpace.sourceWidth,
    height: input.analysis.coordinateSpace.sourceHeight,
    semanticLabel: null,
    evidence: evidence({
      refs: [{ kind: 'pixelHash', refId: input.analysis.id }],
      confidence: 0.99,
      method: 'full_raster_bounds',
      authorityHash: input.authorityHash,
    }),
  });

  for (const region of input.analysis.majorRegions) {
    if (region.classification === 'NOISE') continue;
    const id = `REGION_${region.regionId}`;
    nodes.push({
      sceneNodeId: id,
      parentNodeId: rootId,
      type: 'REGION',
      x: region.x,
      y: region.y,
      width: region.width,
      height: region.height,
      semanticLabel: region.regionId,
      evidence: evidence({
        refs: [
          { kind: 'crop', refId: region.sourceCropRef },
          { kind: 'pixelHash', refId: region.sourcePixelHash },
        ],
        confidence: region.confidence,
        method: region.evidenceType,
        authorityHash: input.authorityHash,
      }),
    });
  }

  for (const edge of input.analysis.edgeMap.edges) {
    nodes.push({
      sceneNodeId: edge.edgeId,
      parentNodeId: rootId,
      type: 'EDGE',
      x: Math.min(edge.x1, edge.x2),
      y: Math.min(edge.y1, edge.y2),
      width: Math.abs(edge.x2 - edge.x1) || edge.thickness,
      height: Math.abs(edge.y2 - edge.y1) || edge.thickness,
      semanticLabel: null,
      evidence: evidence({
        refs: [{ kind: 'edge', refId: edge.edgeId }],
        confidence: edge.confidence,
        method: 'edge_scan',
        authorityHash: input.authorityHash,
      }),
    });
  }

  for (const tr of input.analysis.textRegionMap.regions) {
    nodes.push({
      sceneNodeId: tr.textRegionId,
      parentNodeId: rootId,
      type: 'TEXT',
      x: tr.x,
      y: tr.y,
      width: tr.width,
      height: tr.height,
      semanticLabel: null,
      evidence: evidence({
        refs: [{ kind: 'text', refId: tr.textRegionId }],
        confidence: tr.confidence,
        method: 'text_density_scan',
        authorityHash: input.authorityHash,
      }),
    });
  }

  for (const c of input.analysis.calloutMap.callouts) {
    nodes.push({
      sceneNodeId: c.calloutId,
      parentNodeId: rootId,
      type: 'CALLOUT',
      x: c.x,
      y: c.y,
      width: c.width,
      height: c.height,
      semanticLabel: c.visibleNumber != null ? String(c.visibleNumber) : null,
      evidence: evidence({
        refs: [{ kind: 'callout', refId: c.calloutId }],
        confidence: c.confidence,
        method: 'saturation_blob',
        authorityHash: input.authorityHash,
      }),
    });
  }

  for (const vo of input.analysis.visualObjectRegions) {
    nodes.push({
      sceneNodeId: vo.objectRegionId,
      parentNodeId: rootId,
      type: 'VISUAL_OBJECT',
      x: vo.x,
      y: vo.y,
      width: vo.width,
      height: vo.height,
      semanticLabel: vo.objectClass,
      evidence: evidence({
        refs: [
          { kind: 'visualObject', refId: vo.objectRegionId },
          { kind: 'crop', refId: vo.sourceCropRef },
        ],
        confidence: vo.confidence,
        method: 'region_object',
        authorityHash: input.authorityHash,
      }),
    });
  }

  const withoutEvidence = nodes.filter((n) => n.evidence.evidenceCount === 0);
  if (withoutEvidence.length) {
    throw new Error('TWIN_V41_SCENE_NODE_MISSING_EVIDENCE');
  }

  return {
    id: `tv41sg-${input.authorityHash.slice(0, 10)}`,
    coordinateSpace: input.analysis.coordinateSpace,
    rootNodeId: rootId,
    nodes,
    v40Rejected: true,
    v40RejectionReason: V40_SCENE_GRAPH_REJECTION_REASON,
  };
}
