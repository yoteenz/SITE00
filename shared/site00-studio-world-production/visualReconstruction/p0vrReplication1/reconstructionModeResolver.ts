/**
 * P0.VR.REPLICATION.1 — Map divergence / strategy → PATCH | RECOMPOSE | REPLICATION.
 */

import { resolveReconstructionStrategy } from '../p0vrRebuild1/reconstructionStrategyResolver.js';
import type { ReconstructionMode, ReconstructionModeResolution } from './types.js';

function strategyToMode(strategy: string): ReconstructionMode {
  if (strategy === 'REBUILD_FROM_AUTHORITY') return 'REPLICATION_MODE';
  if (strategy === 'RECOMPOSE_EXISTING') return 'RECOMPOSE_MODE';
  return 'PATCH_MODE';
}

export function resolveReconstructionMode(input: {
  pageId: string;
  viewport: string;
  pageArchetype?: string;
  screenId?: string;
}): ReconstructionModeResolution {
  const { strategy, divergenceScore } = resolveReconstructionStrategy({
    pageId: input.pageId,
    viewport: input.viewport,
    pageArchetype: input.pageArchetype ?? 'ndxbook-overview-mobile',
    screenId: input.screenId ?? 'overview',
  });

  const mode = strategyToMode(strategy);
  let confidence: ReconstructionModeResolution['confidence'] = 'MEDIUM';
  if (divergenceScore.status === 'HIGH' && mode === 'REPLICATION_MODE') confidence = 'HIGH';
  if (divergenceScore.status === 'LOW' && mode === 'PATCH_MODE') confidence = 'HIGH';

  const reason =
    mode === 'REPLICATION_MODE'
      ? `Composition divergence ${divergenceScore.score} (${divergenceScore.status}) — authority blueprint required`
      : mode === 'RECOMPOSE_MODE'
        ? `Medium divergence ${divergenceScore.score} — rearrange reusable components`
        : `Low divergence ${divergenceScore.score} — patch polish only`;

  return { mode, confidence, reason };
}

export function ndxbookOverviewMobileReplicationMode(): ReconstructionMode {
  return resolveReconstructionMode({
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  }).mode;
}
