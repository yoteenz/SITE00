/**
 * B5.9R1 — Astral World project adapter (Identity + Builder + Production, no Evolve unless enabled).
 */

import { buildProjectCapabilityManifest } from '../projectCapabilityManifest.js';
import { buildGeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import { createEmptyCodebaseState } from '../projectCodebaseState.js';
import type { ProjectOperatingAdapter } from './types.js';
import { defaultCapabilitiesForAdapter } from './types.js';
import type { ProjectModuleId } from '../projectModules.js';

export const AstralWorldProjectAdapter: ProjectOperatingAdapter = {
  adapterId: 'astral-world',

  buildManifest(ctx) {
    const detail = ctx.projectDetail;
    const caps = defaultCapabilitiesForAdapter('astral-world');
    const clientVisible: ProjectModuleId[] = [
      'OVERVIEW',
      'IDENTITY',
      'BUILDER',
      'REVIEWS',
      'LIBRARY',
      'MORE',
    ];
    return buildProjectCapabilityManifest({
      projectId: 'astral-world',
      organizationId: detail?.organizationUuid ?? 'astral-world',
      projectType: 'WORLD',
      projectClassification: 'WORLD',
      entitledCapabilities: caps,
      enabledCapabilities: caps,
      internalProject: false,
      clientFacing: true,
      founderManaged: true,
      currentPhase: detail?.currentPhase ?? 'IDENTITY',
      lifecycle: 'IDENTITY',
      clientVisibleModules: clientVisible,
    });
  },

  buildOperatingState(ctx) {
    const manifest = this.buildManifest(ctx);
    const detail = ctx.projectDetail;
    return buildGeneralizedProjectOperatingState({
      projectId: 'astral-world',
      displayName: detail?.displayName ?? 'ASTRAL WORLD',
      tagline: this.getTagline(ctx),
      manifest,
      projectDetail: detail
        ? {
            currentPhase: detail.currentPhase,
            focusNow: detail.focusNow,
            lifecycleStage: detail.overview.lifecycleStage,
            creativeDirection: detail.creativeDirection,
            production: detail.production,
            command: detail.command,
            activity: detail.activity,
          }
        : undefined,
      codebaseState: this.buildCodebaseState(ctx),
      projectStateVersion: ctx.projectStateVersion,
    });
  },

  buildCodebaseState(_ctx) {
    const base = createEmptyCodebaseState('astral-world');
    base.knownImplementationState = 'WORLD_PROTOTYPE';
    base.systemInventory = ['ORIGIN', 'IDENTITY', 'EXPERIENCE'];
    base.syncStatus = 'SYNCED';
    base.syncConfidence = 'MEDIUM';
    base.lastSyncedAt = new Date().toISOString();
    return base;
  },

  getTagline() {
    return 'WORLD FORMATION IN PROGRESS';
  },
};
