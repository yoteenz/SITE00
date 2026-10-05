/**
 * B5.9R1 — Generic fallback project adapter.
 */

import { buildProjectCapabilityManifest } from '../projectCapabilityManifest.js';
import { buildGeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import { createEmptyCodebaseState } from '../projectCodebaseState.js';
import type { ProjectOperatingAdapter } from './types.js';
import { defaultCapabilitiesForAdapter } from './types.js';

function genericAdapter(adapterId: 'studio-world' | 'generic'): ProjectOperatingAdapter {
  return {
    adapterId,

    buildManifest(ctx) {
      const detail = ctx.projectDetail;
      const projectId = detail?.slug ?? adapterId;
      return buildProjectCapabilityManifest({
        projectId,
        organizationId: detail?.organizationUuid ?? projectId,
        entitledCapabilities: defaultCapabilitiesForAdapter(adapterId === 'studio-world' ? 'studio-world' : 'generic'),
        enabledCapabilities: defaultCapabilitiesForAdapter(adapterId === 'studio-world' ? 'studio-world' : 'generic'),
        currentPhase: detail?.currentPhase ?? 'DISCOVERY',
        internalProject: adapterId === 'studio-world',
        founderManaged: true,
      });
    },

    buildOperatingState(ctx) {
      const manifest = this.buildManifest(ctx);
      const detail = ctx.projectDetail;
      return buildGeneralizedProjectOperatingState({
        projectId: detail?.slug ?? adapterId,
        displayName: detail?.displayName ?? adapterId.toUpperCase(),
        tagline: this.getTagline(ctx),
        manifest,
        projectDetail: detail
          ? {
              currentPhase: detail.currentPhase,
              focusNow: detail.focusNow,
              lifecycleStage: detail.overview.lifecycleStage,
              command: detail.command,
              activity: detail.activity,
            }
          : undefined,
        codebaseState: this.buildCodebaseState(ctx),
        projectStateVersion: ctx.projectStateVersion,
      });
    },

    buildCodebaseState(ctx) {
      return createEmptyCodebaseState(ctx.projectDetail?.slug ?? adapterId);
    },

    getTagline(ctx) {
      return ctx.projectDetail?.overview.description?.slice(0, 80) ?? null;
    },
  };
}

export const StudioWorldProjectAdapter = genericAdapter('studio-world');
export const GenericProjectAdapter = genericAdapter('generic');

import { NdxbookProjectAdapter } from './ndxbookProjectAdapter.js';
import { FrontalSlayerProjectAdapter } from './frontalSlayerProjectAdapter.js';
import { AstralWorldProjectAdapter } from './astralWorldProjectAdapter.js';
import { AioProjectAdapter } from './aioProjectAdapter.js';
import { resolveProjectAdapterId } from './types.js';

export function getProjectOperatingAdapter(projectId: string): ProjectOperatingAdapter {
  switch (resolveProjectAdapterId(projectId)) {
    case 'ndxbook':
      return NdxbookProjectAdapter;
    case 'frontal-slayer':
      return FrontalSlayerProjectAdapter;
    case 'astral-world':
      return AstralWorldProjectAdapter;
    case 'all-in-one-enterprises':
      return AioProjectAdapter;
    case 'studio-world':
      return StudioWorldProjectAdapter;
    default:
      return GenericProjectAdapter;
  }
}

export {
  NdxbookProjectAdapter,
  FrontalSlayerProjectAdapter,
  AstralWorldProjectAdapter,
  AioProjectAdapter,
};

export type { ProjectOperatingAdapter, ProjectAdapterContext } from './types.js';
export { resolveProjectAdapterId } from './types.js';
