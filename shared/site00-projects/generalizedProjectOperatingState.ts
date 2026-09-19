/**
 * B5.9R1 — Generalized ProjectOperatingState (extends B5.7 NDX-specific state).
 */

import type { ProjectCapabilityManifest } from './projectCapabilityManifest.js';
import type { ProjectCodebaseState } from './projectCodebaseState.js';
import type { ProjectOperatingState as NdxProjectOperatingState } from '../site00-brand-lore/founderWorkspace/projectOperatingState/types.js';

export type ProjectNeedsYourEyeItem = {
  id: string;
  label: string;
  module: string;
  priority: 'HIGH' | 'MED' | 'LOW';
  href?: string;
  clientActionable: boolean;
};

export type ProjectActivityItem = {
  id: string;
  summary: string;
  timestamp: string | null;
  module?: string;
  clientSafe: boolean;
};

export type ProjectModuleStatus = {
  moduleId: string;
  label: string;
  status: string;
  progressPercent: number | null;
  itemCount: number | null;
};

export type ProjectIdentityState = {
  brandTruth: string;
  personality: string;
  voice: string;
  visualDna: string;
  territories: number;
  brandBible: string;
  assets: number;
};

export type ProjectBuilderState = {
  buildProgressPercent: number;
  pages: number;
  templates: number;
  inReview: number;
  complete: number;
  blockers: string[];
};

export type ProjectEvolveState = {
  activeCampaigns: number;
  contentInProduction: number;
  packagesReady: number;
  analyticsEnabled: boolean;
  upNext: string | null;
};

export type ProjectProductionState = {
  development: string;
  staging: string;
  production: string;
  launchChecklistComplete: number;
  launchChecklistTotal: number;
  blockers: string[];
};

export type ProjectReviewItem = {
  id: string;
  label: string;
  module: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  href?: string;
};

export type GeneralizedProjectOperatingState = {
  projectId: string;
  projectStateVersion: number;
  lastUpdatedAt: string;
  summary: {
    displayName: string;
    tagline: string | null;
    progressPercent: number;
    phase: string;
    lifecycleStage: string | null;
  };
  capabilityManifest: ProjectCapabilityManifest;
  needsYourEye: ProjectNeedsYourEyeItem[];
  activity: ProjectActivityItem[];
  blockers: string[];
  currentFocus: string | null;
  moduleStatuses: ProjectModuleStatus[];
  identityState: ProjectIdentityState | null;
  builderState: ProjectBuilderState | null;
  evolveState: ProjectEvolveState | null;
  productionState: ProjectProductionState | null;
  reviewsState: ProjectReviewItem[];
  libraryState: { assetCount: number; deliverableCount: number } | null;
  codebaseState: ProjectCodebaseState;
  /** NDXBOOK adapter extension — undefined for other projects */
  ndxExtension?: NdxProjectOperatingState;
};

export type BuildGeneralizedOperatingStateInput = {
  projectId: string;
  displayName: string;
  tagline?: string | null;
  manifest: ProjectCapabilityManifest;
  projectDetail?: {
    currentPhase: string;
    focusNow: string | null;
    lifecycleStage: string | null;
    evolve?: { activeCampaigns: number; needsApproval: number; isMarketingClient: boolean };
    creativeDirection?: { lifecycleState: string; visualDnaStatus: string; territoriesGenerated: boolean } | null;
    production?: { launchState: string };
    command?: {
      needsYou: Array<{ id: string; title: string; route: string }>;
      blocked: Array<{ id: string; title: string; reason: string }>;
    };
    activity?: Array<{ id: string; summary: string; timestamp: string | null }>;
  };
  codebaseState?: ProjectCodebaseState;
  ndxExtension?: NdxProjectOperatingState;
  projectStateVersion?: number;
};

export function buildGeneralizedProjectOperatingState(
  input: BuildGeneralizedOperatingStateInput,
): GeneralizedProjectOperatingState {
  const now = new Date().toISOString();
  const detail = input.projectDetail;
  const manifest = input.manifest;
  const codebase = input.codebaseState ?? { projectId: input.projectId } as ProjectCodebaseState;

  const needsYourEye: ProjectNeedsYourEyeItem[] = [];
  if (detail?.command?.needsYou) {
    for (const item of detail.command.needsYou) {
      needsYourEye.push({
        id: item.id,
        label: item.title.toUpperCase(),
        module: 'OVERVIEW',
        priority: 'HIGH',
        href: item.route,
        clientActionable: true,
      });
    }
  }
  if (detail?.evolve?.needsApproval && detail.evolve.needsApproval > 0) {
    needsYourEye.push({
      id: 'evolve-approval',
      label: `${detail.evolve.needsApproval} EVOLVE ITEM${detail.evolve.needsApproval > 1 ? 'S' : ''} NEED APPROVAL`,
      module: 'EVOLVE',
      priority: 'HIGH',
      clientActionable: true,
    });
  }

  const moduleStatuses: ProjectModuleStatus[] = manifest.enabledModules
    .filter((m) => m !== 'MORE')
    .map((moduleId) => ({
      moduleId,
      label: moduleId,
      status: 'ACTIVE',
      progressPercent: moduleId === 'OVERVIEW' ? computeProgress(manifest, detail) : null,
      itemCount: null,
    }));

  const identityState = manifest.enabledModules.includes('IDENTITY')
    ? buildIdentityState(detail)
    : null;
  const builderState = manifest.enabledModules.includes('BUILDER')
    ? buildBuilderState(detail)
    : null;
  const evolveState = manifest.enabledModules.includes('EVOLVE')
    ? buildEvolveState(detail)
    : null;
  const productionState = manifest.enabledModules.includes('PRODUCTION')
    ? buildProductionState(detail)
    : null;

  const activity: ProjectActivityItem[] = (detail?.activity ?? []).map((a) => ({
    id: a.id,
    summary: a.summary.toUpperCase(),
    timestamp: a.timestamp,
    clientSafe: !a.summary.toLowerCase().includes('internal'),
  }));

  return {
    projectId: input.projectId,
    projectStateVersion: input.projectStateVersion ?? 1,
    lastUpdatedAt: now,
    summary: {
      displayName: input.displayName.toUpperCase(),
      tagline: input.tagline?.toUpperCase() ?? null,
      progressPercent: computeProgress(manifest, detail),
      phase: (detail?.currentPhase ?? manifest.currentPhase).toUpperCase(),
      lifecycleStage: detail?.lifecycleStage?.toUpperCase() ?? null,
    },
    capabilityManifest: manifest,
    needsYourEye,
    activity,
    blockers: (detail?.command?.blocked ?? []).map((b) => b.title.toUpperCase()),
    currentFocus: detail?.focusNow?.toUpperCase() ?? null,
    moduleStatuses,
    identityState,
    builderState,
    evolveState,
    productionState,
    reviewsState: [],
    libraryState: manifest.enabledModules.includes('LIBRARY')
      ? { assetCount: 0, deliverableCount: 0 }
      : null,
    codebaseState: codebase.projectId ? codebase : createMinimalCodebase(input.projectId),
    ndxExtension: input.ndxExtension,
  };
}

function createMinimalCodebase(projectId: string): ProjectCodebaseState {
  return {
    projectId,
    repositoryKey: null,
    routeInventory: [],
    featureInventory: [],
    systemInventory: [],
    currentRelease: null,
    deploymentTargets: [],
    lastBuild: null,
    lastDeployment: null,
    knownImplementationState: 'UNKNOWN',
    syncStatus: 'UNKNOWN',
    syncConfidence: 'LOW',
    lastSyncedAt: null,
  };
}

function computeProgress(
  manifest: ProjectCapabilityManifest,
  detail?: BuildGeneralizedOperatingStateInput['projectDetail'],
): number {
  const modules = manifest.primaryModules.filter((m) => m !== 'OVERVIEW');
  if (!modules.length) return 0;
  let complete = 0;
  if (modules.includes('IDENTITY') && detail?.creativeDirection?.visualDnaStatus === 'APPROVED') complete++;
  if (modules.includes('BUILDER')) complete += 0.5;
  if (modules.includes('EVOLVE') && detail?.evolve?.activeCampaigns) complete += 0.5;
  if (modules.includes('PRODUCTION') && detail?.production?.launchState === 'LIVE') complete++;
  return Math.min(100, Math.round((complete / modules.length) * 100));
}

function buildIdentityState(
  detail?: BuildGeneralizedOperatingStateInput['projectDetail'],
): ProjectIdentityState {
  const cd = detail?.creativeDirection;
  return {
    brandTruth: cd ? 'DEFINED' : 'IN PROGRESS',
    personality: cd ? 'DEFINED' : 'NOT STARTED',
    voice: 'IN PROGRESS',
    visualDna: cd?.visualDnaStatus?.toUpperCase() ?? 'NOT STARTED',
    territories: cd?.territoriesGenerated ? 3 : 0,
    brandBible: 'DRAFT V1',
    assets: 0,
  };
}

function buildBuilderState(
  _detail?: BuildGeneralizedOperatingStateInput['projectDetail'],
): ProjectBuilderState {
  return {
    buildProgressPercent: 0,
    pages: 0,
    templates: 0,
    inReview: 0,
    complete: 0,
    blockers: [],
  };
}

function buildEvolveState(
  detail?: BuildGeneralizedOperatingStateInput['projectDetail'],
): ProjectEvolveState {
  return {
    activeCampaigns: detail?.evolve?.activeCampaigns ?? 0,
    contentInProduction: 0,
    packagesReady: 0,
    analyticsEnabled: false,
    upNext: null,
  };
}

function buildProductionState(
  detail?: BuildGeneralizedOperatingStateInput['projectDetail'],
): ProjectProductionState {
  return {
    development: 'ACTIVE',
    staging: 'NOT DEPLOYED',
    production: detail?.production?.launchState?.toUpperCase() ?? 'NOT DEPLOYED',
    launchChecklistComplete: 0,
    launchChecklistTotal: 18,
    blockers: [],
  };
}

// Re-export for convenience
import { createEmptyCodebaseState } from './projectCodebaseState.js';
export { createEmptyCodebaseState };
