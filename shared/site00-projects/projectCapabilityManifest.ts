/**
 * B5.9R1 — ProjectCapabilityManifest: capability-driven module entitlement model.
 */

import type { ProjectOperatingCapability } from './projectOperatingCapabilities.js';
import type { ProjectModuleId } from './projectModules.js';
import type { ProjectViewMode } from './projectViewMode.js';

export type ProjectLifecyclePhase =
  | 'DISCOVERY'
  | 'IDENTITY'
  | 'BUILD'
  | 'EVOLVE'
  | 'PRE_LAUNCH'
  | 'LAUNCH'
  | 'LIVE'
  | 'MAINTENANCE';

export type ProjectCapabilityPermissions = {
  founderCanConfigureModules: boolean;
  clientCanViewModules: boolean;
  internalOverride: boolean;
};

export type ProjectCapabilityManifest = {
  projectId: string;
  organizationId: string;
  projectType: string;
  projectClassification: string;
  entitledCapabilities: ProjectOperatingCapability[];
  enabledCapabilities: ProjectOperatingCapability[];
  enabledModules: ProjectModuleId[];
  primaryModules: ProjectModuleId[];
  secondaryModules: ProjectModuleId[];
  moduleOrder: ProjectModuleId[];
  /** Modules visible to client in CLIENT view mode */
  clientVisibleModules: ProjectModuleId[];
  /** Modules founder-only even when enabled */
  founderOnlyModules: ProjectModuleId[];
  internalProject: boolean;
  clientFacing: boolean;
  founderManaged: boolean;
  permissions: ProjectCapabilityPermissions;
  lifecycle: ProjectLifecyclePhase;
  currentPhase: string;
  featureFlags: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
};

export type BuildManifestInput = {
  projectId: string;
  organizationId: string;
  projectType?: string;
  projectClassification?: string;
  entitledCapabilities?: ProjectOperatingCapability[];
  enabledCapabilities?: ProjectOperatingCapability[];
  internalProject?: boolean;
  clientFacing?: boolean;
  founderManaged?: boolean;
  currentPhase?: string;
  lifecycle?: ProjectLifecyclePhase;
  internalOverride?: boolean;
  clientVisibleModules?: ProjectModuleId[];
  founderOnlyModules?: ProjectModuleId[];
  featureFlags?: Record<string, boolean>;
};

export function buildProjectCapabilityManifest(input: BuildManifestInput): ProjectCapabilityManifest {
  const now = new Date().toISOString();
  const entitled = input.entitledCapabilities ?? [];
  const enabled = input.enabledCapabilities ?? entitled;
  const { enabledModules, primaryModules, secondaryModules, moduleOrder } =
    deriveModulesFromCapabilities(enabled, input.projectId);

  const clientVisible =
    input.clientVisibleModules ??
    enabledModules.filter((m) => !['MORE'].includes(m) && m !== 'EVOLVE' || !input.internalProject);

  const founderOnly =
    input.founderOnlyModules ??
    enabledModules.filter((m) => {
      if (input.internalProject && m === 'EVOLVE') return false;
      return false;
    });

  return {
    projectId: input.projectId,
    organizationId: input.organizationId,
    projectType: input.projectType ?? 'SITE',
    projectClassification: input.projectClassification ?? 'MANAGED_BRAND',
    entitledCapabilities: entitled,
    enabledCapabilities: enabled,
    enabledModules,
    primaryModules,
    secondaryModules,
    moduleOrder,
    clientVisibleModules: clientVisible,
    founderOnlyModules: founderOnly,
    internalProject: input.internalProject ?? false,
    clientFacing: input.clientFacing ?? true,
    founderManaged: input.founderManaged ?? true,
    permissions: {
      founderCanConfigureModules: true,
      clientCanViewModules: input.clientFacing ?? true,
      internalOverride: input.internalOverride ?? false,
    },
    lifecycle: input.lifecycle ?? 'DISCOVERY',
    currentPhase: input.currentPhase ?? 'DISCOVERY',
    featureFlags: input.featureFlags ?? {},
    createdAt: now,
    updatedAt: now,
  };
}

function deriveModulesFromCapabilities(
  capabilities: ProjectOperatingCapability[],
  _projectId: string,
): {
  enabledModules: ProjectModuleId[];
  primaryModules: ProjectModuleId[];
  secondaryModules: ProjectModuleId[];
  moduleOrder: ProjectModuleId[];
} {
  const has = (cap: ProjectOperatingCapability) => capabilities.includes(cap);
  const enabledModules: ProjectModuleId[] = ['OVERVIEW'];

  if (has('IDENTITY')) enabledModules.push('IDENTITY');
  if (has('BUILDER') || has('WEBSITE_PRODUCTION')) enabledModules.push('BUILDER');
  if (
    has('EVOLVE') ||
    has('CAMPAIGNS') ||
    has('CONTENT_OPS') ||
    has('CREATIVE_INTELLIGENCE') ||
    has('ANALYTICS')
  ) {
    enabledModules.push('EVOLVE');
  }
  if (has('PRODUCTION') || has('LAUNCH') || has('MAINTENANCE')) enabledModules.push('PRODUCTION');
  if (has('REVIEWS') || has('CLIENT_REVIEW') || has('APPROVALS')) enabledModules.push('REVIEWS');
  if (has('LIBRARY')) enabledModules.push('LIBRARY');
  enabledModules.push('MORE');

  const primaryModules = enabledModules.filter((m) => m !== 'MORE' && m !== 'REVIEWS' && m !== 'LIBRARY');
  const secondaryModules = enabledModules.filter((m) => m === 'REVIEWS' || m === 'LIBRARY' || m === 'MORE');

  return {
    enabledModules,
    primaryModules,
    secondaryModules,
    moduleOrder: [...enabledModules],
  };
}

export function resolveVisibleModules(
  manifest: ProjectCapabilityManifest,
  viewMode: ProjectViewMode,
): ProjectModuleId[] {
  if (viewMode === 'FOUNDER') return manifest.enabledModules;
  return manifest.enabledModules.filter((m) => manifest.clientVisibleModules.includes(m));
}

export function isModuleEnabled(manifest: ProjectCapabilityManifest, moduleId: ProjectModuleId): boolean {
  return manifest.enabledModules.includes(moduleId);
}
