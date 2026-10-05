/**
 * P0.VR.REBUILD.1 — PATCH vs RECOMPOSE vs REBUILD_FROM_AUTHORITY.
 */

import { resolvePageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import { NDX_LEGACY_OVERVIEW_STACK, scoreCompositionDivergence } from './compositionDivergenceScore.js';
import type { ReconstructionStrategy } from './types.js';

export function resolveReconstructionStrategy(input: {
  pageId: string;
  viewport: string;
  pageArchetype?: string;
  screenId?: string;
  currentStack?: readonly string[];
}): { strategy: ReconstructionStrategy; divergenceScore: ReturnType<typeof scoreCompositionDivergence> } {
  const pageArchetype = input.pageArchetype ?? 'ndxbook-overview-mobile';
  const screenId =
    input.screenId ??
    (pageArchetype.includes('ndxbook') || input.pageId.includes('ndxbook') ? 'overview' : 'main');
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype,
    screenId,
  });
  const authorityStack = profile.stackOrder;
  const defaultCurrentStack =
    input.pageArchetype?.includes('ndxbook') || input.pageId.includes('ndxbook')
      ? NDX_LEGACY_OVERVIEW_STACK
      : authorityStack;
  const currentStack = input.currentStack ?? defaultCurrentStack;
  const divergenceScore = scoreCompositionDivergence({ currentStack, authorityStack });

  if (divergenceScore.status === 'HIGH') {
    return { strategy: 'REBUILD_FROM_AUTHORITY', divergenceScore };
  }
  if (divergenceScore.status === 'MEDIUM') {
    return { strategy: 'RECOMPOSE_EXISTING', divergenceScore };
  }
  return { strategy: 'PATCH_EXISTING', divergenceScore };
}

export function ndxbookOverviewMobileStrategy(): ReconstructionStrategy {
  return resolveReconstructionStrategy({
    pageId: 'ndxbook:/projects/ndxbook/overview',
    viewport: 'mobile',
    pageArchetype: 'ndxbook-overview-mobile',
    screenId: 'overview',
  }).strategy;
}
