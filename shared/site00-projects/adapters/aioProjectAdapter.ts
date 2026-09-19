/**
 * B5.9R1 — All In One Enterprises (AIO) project adapter.
 */

import { buildProjectCapabilityManifest } from '../projectCapabilityManifest.js';
import { buildGeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import { createEmptyCodebaseState } from '../projectCodebaseState.js';
import type { ProjectOperatingAdapter } from './types.js';
import { defaultCapabilitiesForAdapter } from './types.js';
import type { ProjectModuleId } from '../projectModules.js';

export const AioProjectAdapter: ProjectOperatingAdapter = {
  adapterId: 'all-in-one-enterprises',

  buildManifest(ctx) {
    const detail = ctx.projectDetail;
    const caps = defaultCapabilitiesForAdapter('all-in-one-enterprises');
    const clientVisible: ProjectModuleId[] = [
      'OVERVIEW',
      'IDENTITY',
      'BUILDER',
      'PRODUCTION',
      'REVIEWS',
      'LIBRARY',
      'MORE',
    ];
    return buildProjectCapabilityManifest({
      projectId: 'all-in-one-enterprises',
      organizationId: detail?.organizationUuid ?? 'all-in-one-enterprises',
      projectType: 'MANAGED_BRAND',
      projectClassification: detail?.classification ?? 'MANAGED_BRAND',
      entitledCapabilities: caps,
      enabledCapabilities: caps,
      internalProject: false,
      clientFacing: true,
      founderManaged: true,
      currentPhase: detail?.currentPhase ?? 'BUILD',
      lifecycle: 'BUILD',
      clientVisibleModules: clientVisible,
    });
  },

  buildOperatingState(ctx) {
    const manifest = this.buildManifest(ctx);
    const detail = ctx.projectDetail;
    return buildGeneralizedProjectOperatingState({
      projectId: 'all-in-one-enterprises',
      displayName: detail?.displayName ?? 'ALL IN ONE ENTERPRISES',
      tagline: this.getTagline(ctx),
      manifest,
      projectDetail: detail
        ? {
            currentPhase: detail.currentPhase,
            focusNow: detail.focusNow,
            lifecycleStage: detail.overview.lifecycleStage,
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
    const base = createEmptyCodebaseState('all-in-one-enterprises');
    base.knownImplementationState = 'SERVICE_OPERATIONS_ACTIVE';
    base.syncStatus = 'SYNCED';
    base.syncConfidence = 'MEDIUM';
    base.lastSyncedAt = new Date().toISOString();
    return base;
  },

  getTagline() {
    return 'TRUCKING AND LOGISTICS MANAGED BRAND';
  },
};
