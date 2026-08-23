/**
 * Scope-derived Project Intelligence Intake Manifest compiler.
 */

import { createHash } from 'node:crypto';
import type { ProjectExperienceClass } from '../site00-world-intake/constants.js';
import type {
  IntelligenceModuleLifecycle,
  IntelligenceModuleRequirement,
  ProjectCommercialState,
  ProjectIntelligenceIntakeManifest,
  ProjectIntelligenceModuleAssignment,
  ProjectIntelligenceModuleId,
} from './types.js';
import { PROJECT_INTELLIGENCE_MODULE_REGISTRY } from './moduleRegistry.js';

const MANIFEST_VERSION = 1;

const SITE_MODULES: ProjectIntelligenceModuleId[] = [
  'BUSINESS_TRUTH', 'BRAND_LORE', 'BRAND_PERSONALITY', 'PRIMARY_EXPRESSION_CONTEXT',
  'FOUNDER_CREATIVE_APPETITE', 'FUNCTIONAL_REQUIREMENTS', 'ASSET_INVENTORY', 'VISUAL_REFERENCES',
];

const IDENTITY_SITE_MODULES: ProjectIntelligenceModuleId[] = [
  ...SITE_MODULES, 'IDENTITY_DIRECTION', 'ANTI_DIRECTION', 'CONTENT_INTELLIGENCE',
];

const APPLICATION_MODULES: ProjectIntelligenceModuleId[] = [
  ...SITE_MODULES, 'USER_ROLES', 'WORKFLOW_INTELLIGENCE', 'PERSISTENT_STATE',
  'NOTIFICATION_BEHAVIOR', 'APPLICATION_BEHAVIOR',
];

const IMMERSIVE_MODULES: ProjectIntelligenceModuleId[] = [
  ...IDENTITY_SITE_MODULES, 'EXPERIENCE_INTENT', 'INTERACTION_REQUIREMENTS', 'MOTION_INTENT',
];

const WORLD_MODULES: ProjectIntelligenceModuleId[] = [
  ...IMMERSIVE_MODULES,
  'WORLD_READINESS', 'WORLD_ENTRY_INTENT', 'WORLD_SPATIAL_INTENT', 'WORLD_IDENTITY_AVATAR',
  'WORLD_FOUNDER_PRESENCE', 'WORLD_AI_REPRESENTATION', 'WORLD_NAVIGATION', 'WORLD_PERSISTENCE',
  'WORLD_SOCIAL_PRESENCE', 'WORLD_CONTENT_CREATION', 'WORLD_GAME_DEPTH', 'WORLD_HARD_BOUNDARIES',
];

export function deriveModulesForScope(params: {
  experienceClass: ProjectExperienceClass;
  includeIdentity: boolean;
}): ProjectIntelligenceModuleId[] {
  const { experienceClass, includeIdentity } = params;
  if (experienceClass === 'WORLD') return WORLD_MODULES;
  if (experienceClass === 'IMMERSIVE_SITE') return IMMERSIVE_MODULES;
  if (experienceClass === 'APPLICATION') return APPLICATION_MODULES;
  if (includeIdentity) return IDENTITY_SITE_MODULES;
  return SITE_MODULES;
}

function assignModule(
  moduleId: ProjectIntelligenceModuleId,
  requirement: IntelligenceModuleRequirement,
  lifecycle: IntelligenceModuleLifecycle = 'LOCKED',
): ProjectIntelligenceModuleAssignment {
  return {
    moduleId,
    requirement,
    lifecycle,
    moduleVersion: '1',
    questionVersion: '1',
    rawAnswerCount: 0,
    synthesized: false,
    unlockCondition: requirement === 'CONDITIONAL' ? 'Activated when scope requires' : null,
  };
}

export function compileProjectIntelligenceIntakeManifest(params: {
  projectId: string;
  projectSlug: string;
  commercialState: ProjectCommercialState;
  experienceClass: ProjectExperienceClass;
  purchasedScope: string[];
  includeIdentity?: boolean;
  completedModuleIds?: ProjectIntelligenceModuleId[];
  previousManifest?: ProjectIntelligenceIntakeManifest | null;
  scopeChangeReason?: string | null;
}): ProjectIntelligenceIntakeManifest {
  const moduleIds = deriveModulesForScope({
    experienceClass: params.experienceClass,
    includeIdentity: params.includeIdentity ?? true,
  });

  const completed = new Set(params.completedModuleIds ?? []);
  const modules: ProjectIntelligenceModuleAssignment[] = moduleIds.map((moduleId) => {
    const requirement: IntelligenceModuleRequirement = 'REQUIRED';
    const lifecycle: IntelligenceModuleLifecycle = completed.has(moduleId)
      ? 'COMPLETE'
      : params.commercialState === 'ACTIVATED' || params.commercialState === 'PAID'
        ? 'AVAILABLE'
        : 'LOCKED';
    return assignModule(moduleId, requirement, lifecycle);
  });

  const manifestVersion = params.previousManifest ? params.previousManifest.manifestVersion + 1 : MANIFEST_VERSION;
  const manifestId = `pim-${params.projectSlug}-v${manifestVersion}`;

  const fingerprintPayload = {
    projectSlug: params.projectSlug,
    experienceClass: params.experienceClass,
    modules: modules.map((m) => `${m.moduleId}:${m.requirement}`).sort(),
    version: manifestVersion,
  };
  const fingerprint = createHash('sha256').update(JSON.stringify(fingerprintPayload)).digest('hex').slice(0, 16);

  return {
    manifestId,
    manifestVersion,
    projectId: params.projectId,
    projectSlug: params.projectSlug,
    commercialState: params.commercialState,
    experienceClass: params.experienceClass,
    purchasedScope: params.purchasedScope,
    modules,
    fingerprint,
    compiledAt: new Date().toISOString(),
    previousManifestId: params.previousManifest?.manifestId ?? null,
    scopeChangeReason: params.scopeChangeReason ?? null,
  };
}

export function manifestFingerprintIsDeterministic(
  a: ProjectIntelligenceIntakeManifest,
  b: ProjectIntelligenceIntakeManifest,
): boolean {
  return a.fingerprint === b.fingerprint;
}

export function expandScopeManifest(params: {
  previous: ProjectIntelligenceIntakeManifest;
  newExperienceClass: ProjectExperienceClass;
  reason: string;
  completedModuleIds: ProjectIntelligenceModuleId[];
}): ProjectIntelligenceIntakeManifest {
  return compileProjectIntelligenceIntakeManifest({
    projectId: params.previous.projectId,
    projectSlug: params.previous.projectSlug,
    commercialState: params.previous.commercialState,
    experienceClass: params.newExperienceClass,
    purchasedScope: [...params.previous.purchasedScope, `scope-expand:${params.newExperienceClass}`],
    completedModuleIds: params.completedModuleIds,
    previousManifest: params.previous,
    scopeChangeReason: params.reason,
  });
}

export function registryModuleCount(): number {
  return PROJECT_INTELLIGENCE_MODULE_REGISTRY.length;
}
