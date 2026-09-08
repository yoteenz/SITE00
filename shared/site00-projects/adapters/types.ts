/**
 * B5.9R1 — Project adapter interface for universal operating system shell.
 */

import type { ProjectCapabilityManifest } from '../projectCapabilityManifest.js';
import type { ProjectCodebaseState } from '../projectCodebaseState.js';
import type { GeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import type { ProjectOperatingCapability } from '../projectOperatingCapabilities.js';
import type { Site00ProjectDetail } from '../types.js';

export type ProjectAdapterId =
  | 'ndxbook'
  | 'frontal-slayer'
  | 'astral-world'
  | 'all-in-one-enterprises'
  | 'studio-world'
  | 'generic';

export type ProjectAdapterContext = {
  projectDetail: Site00ProjectDetail | null;
  projectStateVersion?: number;
};

export interface ProjectOperatingAdapter {
  readonly adapterId: ProjectAdapterId;
  buildManifest(ctx: ProjectAdapterContext): ProjectCapabilityManifest;
  buildOperatingState(ctx: ProjectAdapterContext): GeneralizedProjectOperatingState;
  buildCodebaseState(ctx: ProjectAdapterContext): ProjectCodebaseState;
  getTagline(ctx: ProjectAdapterContext): string | null;
}

export function resolveProjectAdapterId(projectId: string): ProjectAdapterId {
  const slug = projectId.trim().toLowerCase();
  if (slug === 'ndxbook') return 'ndxbook';
  if (slug === 'frontal-slayer') return 'frontal-slayer';
  if (slug === 'astral-world') return 'astral-world';
  if (slug === 'all-in-one-enterprises') return 'all-in-one-enterprises';
  if (slug === 'studio-world') return 'studio-world';
  return 'generic';
}

export function defaultCapabilitiesForAdapter(adapterId: ProjectAdapterId): ProjectOperatingCapability[] {
  switch (adapterId) {
    case 'ndxbook':
      return [
        'IDENTITY',
        'EVOLVE',
        'CAMPAIGNS',
        'CONTENT_OPS',
        'CREATIVE_INTELLIGENCE',
        'PRODUCTION',
        'REVIEWS',
        'LIBRARY',
        'ANALYTICS',
      ];
    case 'frontal-slayer':
      return [
        'IDENTITY',
        'BUILDER',
        'EVOLVE',
        'CAMPAIGNS',
        'CONTENT_OPS',
        'CREATIVE_INTELLIGENCE',
        'PRODUCTION',
        'REVIEWS',
        'LIBRARY',
      ];
    case 'astral-world':
      return ['IDENTITY', 'BUILDER', 'PRODUCTION', 'REVIEWS', 'LIBRARY'];
    case 'all-in-one-enterprises':
      return ['IDENTITY', 'BUILDER', 'PRODUCTION', 'REVIEWS', 'LIBRARY'];
    case 'studio-world':
      return ['BUILDER', 'PRODUCTION', 'REVIEWS', 'LIBRARY', 'CONTROL_ROOM'];
    default:
      return ['IDENTITY', 'BUILDER', 'PRODUCTION', 'REVIEWS', 'LIBRARY'];
  }
}
