/**
 * B5.9R7 — Project overview adapter registry.
 */

import type { ProjectOverviewAdapter } from './types.js';
import { NdxbookOverviewAdapter } from './adapters/ndxbookOverviewAdapter.js';
import { FrontalSlayerOverviewAdapter } from './adapters/frontalSlayerOverviewAdapter.js';
import { StudioWorldOverviewAdapter } from './adapters/studioWorldOverviewAdapter.js';
import { AioOverviewAdapter } from './adapters/aioOverviewAdapter.js';
import { AstralWorldOverviewAdapter } from './adapters/astralWorldOverviewAdapter.js';
import { createGenericOverviewAdapter } from './adapters/genericOverviewAdapter.js';

const REGISTRY: Record<string, ProjectOverviewAdapter> = {
  ndxbook: NdxbookOverviewAdapter,
  'frontal-slayer': FrontalSlayerOverviewAdapter,
  'studio-world': StudioWorldOverviewAdapter,
  'all-in-one-enterprises': AioOverviewAdapter,
  'astral-world': AstralWorldOverviewAdapter,
};

export function getProjectOverviewAdapter(projectId: string): ProjectOverviewAdapter {
  return REGISTRY[projectId] ?? createGenericOverviewAdapter(projectId);
}

export function projectUsesSpecializedOverview(projectId: string): boolean {
  return getProjectOverviewAdapter(projectId).usesSpecializedOverview;
}

export function ndxbookMustNotUseGenericOverview(projectId: string): boolean {
  if (projectId !== 'ndxbook') return true;
  const adapter = getProjectOverviewAdapter(projectId);
  return adapter.adapterId === 'ndxbook' && adapter.usesSpecializedOverview;
}

export {
  NdxbookOverviewAdapter,
  FrontalSlayerOverviewAdapter,
  StudioWorldOverviewAdapter,
  AioOverviewAdapter,
  AstralWorldOverviewAdapter,
  createGenericOverviewAdapter,
};
