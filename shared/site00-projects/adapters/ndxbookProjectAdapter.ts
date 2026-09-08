/**
 * B5.9R1 — NDXBOOK project adapter (Evolve-heavy, preserves methodology).
 */

import { buildProjectCapabilityManifest } from '../projectCapabilityManifest.js';
import { buildGeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import { createEmptyCodebaseState } from '../projectCodebaseState.js';
import type { ProjectOperatingAdapter } from './types.js';
import { defaultCapabilitiesForAdapter } from './types.js';
import type { ProjectModuleId } from '../projectModules.js';

export const NdxbookProjectAdapter: ProjectOperatingAdapter = {
  adapterId: 'ndxbook',

  buildManifest(ctx) {
    const detail = ctx.projectDetail;
    const clientVisible: ProjectModuleId[] = ['OVERVIEW', 'REVIEWS', 'LIBRARY', 'MORE'];
    return buildProjectCapabilityManifest({
      projectId: 'ndxbook',
      organizationId: detail?.organizationUuid ?? 'ndxbook',
      projectType: 'MANAGED_BRAND',
      projectClassification: detail?.classification ?? 'MANAGED_BRAND',
      entitledCapabilities: defaultCapabilitiesForAdapter('ndxbook'),
      enabledCapabilities: defaultCapabilitiesForAdapter('ndxbook'),
      internalProject: false,
      clientFacing: true,
      founderManaged: true,
      currentPhase: detail?.currentPhase ?? 'EVOLVE',
      lifecycle: 'EVOLVE',
      internalOverride: true,
      clientVisibleModules: clientVisible,
      founderOnlyModules: ['EVOLVE'],
    });
  },

  buildOperatingState(ctx) {
    const manifest = this.buildManifest(ctx);
    const detail = ctx.projectDetail;
    return buildGeneralizedProjectOperatingState({
      projectId: 'ndxbook',
      displayName: detail?.displayName ?? 'NDXBOOK',
      tagline: this.getTagline(ctx),
      manifest,
      projectDetail: detail
        ? {
            currentPhase: detail.currentPhase,
            focusNow: detail.focusNow,
            lifecycleStage: detail.overview.lifecycleStage,
            evolve: detail.evolve,
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

  buildCodebaseState(ctx) {
    const base = createEmptyCodebaseState('ndxbook');
    base.repositoryKey = 'SITE00';
    base.knownImplementationState = 'EVOLVE_HEAVY_METHODOLOGY';
    base.syncStatus = 'SYNCED';
    base.syncConfidence = 'HIGH';
    base.lastSyncedAt = new Date().toISOString();
    if (ctx.projectDetail?.overview.repositoryConnection) {
      base.systemInventory = ['CONTENT_OPS', 'CAMPAIGN_BOARD', 'LAB', 'EXPRESSION_ENGINE'];
    }
    return base;
  },

  getTagline() {
    return 'INDEX BOOK FOUNDER PILOT';
  },
};
