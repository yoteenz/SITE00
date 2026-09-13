import { P0_VR_TWIN_V30_BUILD } from './constants.js';
import {
  applyDesignPageAuthorityGeneration,
  createDesignPageAuthorityReviewSession,
} from './designPageAuthorityReviewState.js';
import { emptyTerritoryGallery, normalizeDesignPageAuthoritySession } from './designPageAuthorityTerritoryGallery.js';
import { repairPrototypeGallerySession } from './repairAuthorityPrototypeUrls.js';
import type {
  DesignPageAuthorityGenerationResult,
  DesignPageAuthorityReviewSession,
  DesignPageAuthorityTerritoryGallery,
} from './types.js';

export const DESIGN_PAGE_AUTHORITY_BATCH2_MODULE_ID = 'AUTHORITY_BATCH_2' as const;

/** Isolated from batch-1 ledger / backup / recovery — own localStorage key only. */
export type DesignPageAuthorityBatch2ModuleState = {
  moduleId: typeof DESIGN_PAGE_AUTHORITY_BATCH2_MODULE_ID;
  buildRef: typeof P0_VR_TWIN_V30_BUILD;
  projectId: string;
  /** Next FAL apply uses candidateGeneration + 1 as batch number (start at 1 → first run is batch 2). */
  candidateGeneration: number;
  territoryGallery: DesignPageAuthorityTerritoryGallery;
  lastResult: DesignPageAuthorityGenerationResult | null;
  updatedAt: string;
};

export function emptyDesignPageAuthorityBatch2Module(projectId: string): DesignPageAuthorityBatch2ModuleState {
  const now = new Date().toISOString();
  return {
    moduleId: DESIGN_PAGE_AUTHORITY_BATCH2_MODULE_ID,
    buildRef: P0_VR_TWIN_V30_BUILD,
    projectId: projectId.toLowerCase(),
    candidateGeneration: 1,
    territoryGallery: emptyTerritoryGallery(),
    lastResult: null,
    updatedAt: now,
  };
}

export function normalizeDesignPageAuthorityBatch2Module(
  state: DesignPageAuthorityBatch2ModuleState,
): DesignPageAuthorityBatch2ModuleState {
  const shell = createDesignPageAuthorityReviewSession({ projectId: state.projectId });
  const repaired = repairPrototypeGallerySession(
    normalizeDesignPageAuthoritySession({
      ...shell,
      candidateGeneration: state.candidateGeneration,
      territoryGallery: state.territoryGallery,
      lastResult: state.lastResult,
      updatedAt: state.updatedAt,
    }),
  );
  return {
    ...state,
    buildRef: P0_VR_TWIN_V30_BUILD,
    territoryGallery: repaired.territoryGallery,
    lastResult: repaired.lastResult,
  };
}

/** API session uses batch-2 gallery only; founder refine notes come from main session template. */
export function batch2ModuleToReviewSession(
  batch2: DesignPageAuthorityBatch2ModuleState,
  mainTemplate: DesignPageAuthorityReviewSession,
): DesignPageAuthorityReviewSession {
  return normalizeDesignPageAuthoritySession({
    ...mainTemplate,
    candidateGeneration: batch2.candidateGeneration,
    territoryGallery: batch2.territoryGallery,
    lastResult: batch2.lastResult,
  });
}

export function reviewSessionToBatch2Module(
  session: DesignPageAuthorityReviewSession,
): DesignPageAuthorityBatch2ModuleState {
  const normalized = normalizeDesignPageAuthoritySession(session);
  return {
    moduleId: DESIGN_PAGE_AUTHORITY_BATCH2_MODULE_ID,
    buildRef: P0_VR_TWIN_V30_BUILD,
    projectId: normalized.projectId.toLowerCase(),
    candidateGeneration: normalized.candidateGeneration,
    territoryGallery: normalized.territoryGallery,
    lastResult: normalized.lastResult,
    updatedAt: normalized.updatedAt,
  };
}

export function applyBatch2ModuleGeneration(
  batch2: DesignPageAuthorityBatch2ModuleState,
  mainTemplate: DesignPageAuthorityReviewSession,
  result: DesignPageAuthorityGenerationResult,
  action: 'GENERATE' | 'REFINE' | 'REGENERATE' | 'REGENERATE_TERRITORY',
): DesignPageAuthorityBatch2ModuleState {
  const apiSession = batch2ModuleToReviewSession(batch2, mainTemplate);
  const nextSession = applyDesignPageAuthorityGeneration(apiSession, result, action);
  return normalizeDesignPageAuthorityBatch2Module(reviewSessionToBatch2Module(nextSession));
}
