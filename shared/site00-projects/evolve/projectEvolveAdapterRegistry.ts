/**
 * B5.9R3 — Project Evolve adapter registry.
 */

import type { ProjectEvolveAdapter } from './types.js';
import { NdxbookEvolveAdapter } from './adapters/ndxbookEvolveAdapter.js';
import { FrontalSlayerEvolveAdapter } from './adapters/frontalSlayerEvolveAdapter.js';
import { AioEvolveAdapter } from './adapters/aioEvolveAdapter.js';
import { createGenericEvolveAdapter } from './adapters/genericEvolveAdapter.js';

const REGISTRY: Record<string, ProjectEvolveAdapter> = {
  ndxbook: NdxbookEvolveAdapter,
  'frontal-slayer': FrontalSlayerEvolveAdapter,
  'all-in-one-enterprises': AioEvolveAdapter,
};

export function getProjectEvolveAdapter(projectId: string): ProjectEvolveAdapter {
  return REGISTRY[projectId] ?? createGenericEvolveAdapter(projectId);
}

export function projectUsesSpecializedEvolve(projectId: string): boolean {
  return getProjectEvolveAdapter(projectId).usesSpecializedSurface;
}

export function ndxbookMustNotUseGenericEvolve(projectId: string): boolean {
  if (projectId !== 'ndxbook') return true;
  const adapter = getProjectEvolveAdapter(projectId);
  return adapter.evolveType === 'NDXBOOK' && adapter.usesSpecializedSurface;
}

export { NdxbookEvolveAdapter, FrontalSlayerEvolveAdapter, AioEvolveAdapter, createGenericEvolveAdapter };
