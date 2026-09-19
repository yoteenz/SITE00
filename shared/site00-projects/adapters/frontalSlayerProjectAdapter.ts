/**
 * B5.9R1 — Frontal Slayer project adapter (full-stack founder-owned internal brand).
 */

import { buildProjectCapabilityManifest } from '../projectCapabilityManifest.js';
import { buildGeneralizedProjectOperatingState } from '../generalizedProjectOperatingState.js';
import { createEmptyCodebaseState } from '../projectCodebaseState.js';
import type { ProjectOperatingAdapter } from './types.js';
import { defaultCapabilitiesForAdapter } from './types.js';
import type { ProjectModuleId } from '../projectModules.js';

export const FrontalSlayerProjectAdapter: ProjectOperatingAdapter = {
  adapterId: 'frontal-slayer',

  buildManifest(ctx) {
    const detail = ctx.projectDetail;
    const clientVisible: ProjectModuleId[] = [
      'OVERVIEW',
      'IDENTITY',
      'BUILDER',
      'REVIEWS',
      'LIBRARY',
      'MORE',
    ];
    return buildProjectCapabilityManifest({
      projectId: 'frontal-slayer',
      organizationId: detail?.organizationUuid ?? 'frontal-slayer',
      projectType: 'INTERNAL_BRAND',
      projectClassification: detail?.classification ?? 'INTERNAL_BRAND',
      entitledCapabilities: defaultCapabilitiesForAdapter('frontal-slayer'),
      enabledCapabilities: defaultCapabilitiesForAdapter('frontal-slayer'),
      internalProject: true,
      clientFacing: false,
      founderManaged: true,
      currentPhase: detail?.currentPhase ?? 'PRE_LAUNCH',
      lifecycle: 'PRE_LAUNCH',
      internalOverride: true,
      clientVisibleModules: clientVisible,
      founderOnlyModules: ['EVOLVE', 'PRODUCTION'],
    });
  },

  buildOperatingState(ctx) {
    const manifest = this.buildManifest(ctx);
    const detail = ctx.projectDetail;
    const state = buildGeneralizedProjectOperatingState({
      projectId: 'frontal-slayer',
      displayName: detail?.displayName ?? 'FRONTAL SLAYER',
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

    if (state.builderState) {
      state.builderState = {
        ...state.builderState,
        buildProgressPercent: 62,
        pages: 24,
        templates: 8,
        inReview: 3,
        complete: 13,
      };
    }
    if (state.identityState) {
      state.identityState = {
        brandTruth: 'DEFINED',
        personality: 'DEFINED',
        voice: 'IN PROGRESS',
        visualDna: 'IN REVIEW',
        territories: 3,
        brandBible: 'DRAFT V1',
        assets: 48,
      };
    }
    if (state.productionState) {
      state.productionState = {
        development: 'ACTIVE',
        staging: 'UPDATED 2H AGO',
        production: 'NOT DEPLOYED',
        launchChecklistComplete: 12,
        launchChecklistTotal: 18,
        blockers: [],
      };
    }
    state.summary.progressPercent = 62;
    return state;
  },

  buildCodebaseState(_ctx) {
    const base = createEmptyCodebaseState('frontal-slayer');
    base.repositoryKey = 'frontal-slayer';
    base.knownImplementationState = 'COMMERCE_MANSION_EXPERIENCE';
    base.syncStatus = 'SYNCED';
    base.syncConfidence = 'HIGH';
    base.routeInventory = [
      { path: '/', label: 'HOME', status: 'LIVE' },
      { path: '/shop', label: 'SHOP', status: 'DRAFT' },
    ];
    base.deploymentTargets = [
      { id: 'dev', label: 'DEVELOPMENT', environment: 'DEVELOPMENT', url: null, lastDeployedAt: null, status: 'ACTIVE' },
      { id: 'staging', label: 'STAGING', environment: 'STAGING', url: null, lastDeployedAt: new Date().toISOString(), status: 'UPDATED' },
      { id: 'prod', label: 'PRODUCTION', environment: 'PRODUCTION', url: null, lastDeployedAt: null, status: 'NOT_DEPLOYED' },
    ];
    base.lastSyncedAt = new Date().toISOString();
    return base;
  },

  getTagline() {
    return 'BEAUTY BEHAVES DIFFERENTLY HERE.';
  },
};
