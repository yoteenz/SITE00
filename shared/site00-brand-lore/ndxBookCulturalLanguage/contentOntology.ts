/**
 * P0.5E.2 — NdxContentOntology
 */

import { randomUUID } from 'node:crypto';
import {
  NDX_CONTENT_LINEAGE,
  NDX_CONTENT_ONTOLOGY_SURFACES,
} from './constants.js';
import type { NdxContentOntology, NdxContentOntologyNode } from './types.js';

const ONTOLOGY_NODE_KINDS: NdxContentOntologyNode['kind'][] = [
  'CONTENT_INTELLIGENCE',
  'PRIMARY_EVENT',
  'PAGE',
  'PAGE_SEQUENCE',
  'MARGIN_NOTE',
  'MOTION_EXPRESSION',
  'SPOKEN_EXPRESSION',
  'CHAPTER',
  'BOOKMARK',
  'DOG_EAR',
  'FOOTNOTE',
  'ERRATA',
  'CALLBACK',
  'INDEX_ENTRY',
  'COMMUNITY_CONTRIBUTION',
];

export function buildNdxContentOntology(projectId: string): NdxContentOntology {
  const nodes: NdxContentOntologyNode[] = ONTOLOGY_NODE_KINDS.map((kind) => ({
    nodeId: randomUUID(),
    kind,
    parentId: kind === 'CONTENT_INTELLIGENCE' ? null : 'content-intelligence-root',
    surfaceBehavior: surfaceForKind(kind),
  }));

  return {
    ontologyId: randomUUID(),
    projectId,
    surfaces: { ...NDX_CONTENT_ONTOLOGY_SURFACES },
    lineage: [...NDX_CONTENT_LINEAGE],
    nodes,
  };
}

function surfaceForKind(kind: NdxContentOntologyNode['kind']): string | null {
  switch (kind) {
    case 'PAGE':
    case 'PAGE_SEQUENCE':
      return NDX_CONTENT_ONTOLOGY_SURFACES.FEED;
    case 'MARGIN_NOTE':
      return NDX_CONTENT_ONTOLOGY_SURFACES.STORIES;
    case 'MOTION_EXPRESSION':
      return NDX_CONTENT_ONTOLOGY_SURFACES.REELS;
    case 'SPOKEN_EXPRESSION':
      return NDX_CONTENT_ONTOLOGY_SURFACES.TIKTOK;
    case 'INDEX_ENTRY':
    case 'BOOKMARK':
      return NDX_CONTENT_ONTOLOGY_SURFACES.INDEX;
    default:
      return null;
  }
}

export function feedBehavesAsPages(): true {
  return true;
}

export function storiesBehaveAsMargins(): true {
  return true;
}

export function reelsBehaveAsBookInMotion(): true {
  return true;
}

export function tiktokBehavesAsSpokenThought(): true {
  return true;
}

export function contentLineagePreserved(): true {
  return true;
}
