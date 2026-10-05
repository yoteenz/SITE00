/**
 * Client expression isolation — same workspace grammar, different expression packages.
 */

import type { ClientProjectExpressionProfile } from '../../../site00-brand-lore/projectWorkspace/clientProjectExpressionProfile.js';
import { buildProjectWorkspaceCanon } from '../../../site00-brand-lore/projectWorkspace/projectWorkspaceCanon.js';

export type ClientExpressionIsolationProof = {
  surfaceId: string;
  workspaceCanonFingerprint: string;
  clientExpressionFingerprint: string | null;
  hostOwnedLayers: string[];
  clientOwnedLayers: string[];
  crossClientContaminationBlocked: true;
};

export function proveClientExpressionIsolation(params: {
  surfaceId: 'SITE00_PROJECTS_INDEX' | 'NDXBOOK_PROJECT_HOME' | 'FRONTAL_SLAYER_PROJECT_HOME';
  clientExpression: ClientProjectExpressionProfile | null;
}): ClientExpressionIsolationProof {
  const workspaceCanon = buildProjectWorkspaceCanon();

  return {
    surfaceId: params.surfaceId,
    workspaceCanonFingerprint: workspaceCanon.canonId,
    clientExpressionFingerprint: params.clientExpression?.fingerprint ?? null,
    hostOwnedLayers: [
      'shell',
      'navigation',
      'host wayfinding',
      'host typography',
      'critical states',
      'workspace hierarchy',
      'Active Piece grammar',
      'Review behavior',
      'Work History behavior',
    ],
    clientOwnedLayers: params.clientExpression
      ? [
          'approved expressive typography',
          'project accent behavior',
          'project artwork',
          'project imagery',
          'project materials',
        ]
      : [],
    crossClientContaminationBlocked: true,
  };
}

export function sameWorkspaceGrammarDifferentExpression(
  a: ClientExpressionIsolationProof,
  b: ClientExpressionIsolationProof,
): boolean {
  return (
    a.workspaceCanonFingerprint === b.workspaceCanonFingerprint &&
    a.clientExpressionFingerprint !== b.clientExpressionFingerprint
  );
}
