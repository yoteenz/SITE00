/**
 * P0.E.FT5.2 — Adapter: Astral World WORLD_SCREEN → SITE 00 P0.VR.2 pipeline.
 * Reuses canonical reference registry + design screen registry — no parallel engine.
 */

import {
  getActiveCanonicalReference,
  registerCanonicalVisualReference,
  seedCanonicalRegistry,
} from '../../site00-studio-world-production/visualReconstruction/p0vr2/canonicalReferenceRegistry.js';
import { registerProjectDesignScreens } from '../../site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';
import type { DesignScreenDefinition } from '../../site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import { ASTRAL_WORLD_BOARD_TO_SCREEN_MAP } from './boardToScreenMap.js';
import {
  getScreenMaster,
  initializeScreenMasterRegistry,
  listScreenMasters,
  upsertScreenMaster,
} from './registry.js';
import type { CanonicalScreenMaster } from './types.js';
import { ASTRAL_WORLD_PROJECT_ID } from './types.js';

export function buildDesignScreenDefinitions(): DesignScreenDefinition[] {
  return ASTRAL_WORLD_BOARD_TO_SCREEN_MAP.filter((e) => e.state === 'default').map((e) => ({
    screenId: e.screenId,
    displayName: e.screenName,
    routePattern: e.route,
    scopeTargetId: e.relatedSceneId,
    absoluteRoute: true,
    routeFamily: 'OTHER',
    classification: 'FOUNDER_WORKSPACE',
    recordKind: 'ROUTE',
    priority: e.screenId.includes('_01_') ? 'CRITICAL' : 'PRIMARY',
    componentName: e.relatedSceneId,
    sourceEvidence: [e.sourceBoard],
    showInDefaultSelector: true,
  }));
}

export function syncAstralScreensToDesignRegistry(): void {
  registerProjectDesignScreens(ASTRAL_WORLD_PROJECT_ID, buildDesignScreenDefinitions());
}

export function registerScreenMasterInVr2(master: CanonicalScreenMaster): CanonicalScreenMaster {
  const record = registerCanonicalVisualReference({
    projectId: ASTRAL_WORLD_PROJECT_ID,
    screenId: master.screenId,
    route: master.route,
    viewportClass: master.viewportClass,
    viewportWidth: master.width,
    viewportHeight: master.height,
    scope: 'FULL_SCREEN_REFERENCE',
    scopeTargetId: master.relatedSceneId,
    assetId: master.screenId,
    storagePath: master.canonicalMasterPath.replace(/^\//, ''),
    status: master.approvalState === 'MASTER_LOCKED' ? 'ACTIVE_CANONICAL' : 'DRAFT',
    createdBy: 'astral-world-ft52',
    supersedes: master.supersedes ? `${master.screenId}:v${master.supersedes}` : null,
    notes: `Astral World canonical screen master v${master.version} — ${master.sourceBoard}`,
  });
  const updated = { ...master, vr2ReferenceId: record.referenceId };
  upsertScreenMaster(updated);
  return updated;
}

export function getVr2ReferenceForScreen(screenId: string) {
  const master = getScreenMaster(screenId);
  if (!master) return null;
  return getActiveCanonicalReference(
    ASTRAL_WORLD_PROJECT_ID,
    screenId,
    master.viewportClass,
  );
}

export function initializeAstralWorldProductionAdapter(): void {
  initializeScreenMasterRegistry();
  syncAstralScreensToDesignRegistry();
}

export function seedPilotVr2Reference(master: CanonicalScreenMaster): void {
  seedCanonicalRegistry([
    {
      referenceId: master.vr2ReferenceId ?? `${ASTRAL_WORLD_PROJECT_ID}:${master.screenId}:mobile:v1`,
      projectId: ASTRAL_WORLD_PROJECT_ID,
      screenId: master.screenId,
      route: master.route,
      viewportClass: master.viewportClass,
      viewportWidth: master.width,
      viewportHeight: master.height,
      scope: 'FULL_SCREEN_REFERENCE',
      scopeTargetId: master.relatedSceneId,
      assetId: master.screenId,
      storagePath: master.canonicalMasterPath.replace(/^\//, ''),
      version: master.version,
      status: 'DRAFT',
      createdAt: master.createdAt,
      createdBy: 'astral-world-ft52-pilot',
      supersedes: null,
      notes: 'Pilot canonical screen master AW_M_01_WORLD_ENTRY',
    },
  ]);
}

export function countRegisteredAstralScreens(): {
  mobile: number;
  desktop: number;
  state: number;
} {
  initializeScreenMasterRegistry();
  const all = listScreenMasters();
  return {
    mobile: all.filter((m) => m.viewportClass === 'mobile').length,
    desktop: all.filter((m) => m.viewportClass === 'desktop').length,
    state: all.filter((m) => m.state !== 'default').length,
  };
}
