/**
 * Project Intelligence service — manifest compilation for activated projects.
 */

import type { ProjectExperienceClass } from '../../../shared/site00-world-intake/constants.js';
import {
  compileProjectIntelligenceIntakeManifest,
  expandScopeManifest,
} from '../../../shared/site00-project-intelligence/manifestCompiler.js';
import {
  evaluateProjectIntelligenceReadiness,
  assertProjectReadyForFormation,
} from '../../../shared/site00-project-intelligence/readiness.js';
import type {
  ProjectCommercialState,
  ProjectIntelligenceModuleId,
  ProjectIntelligenceIntakeManifest,
} from '../../../shared/site00-project-intelligence/types.js';
import * as store from './projectIntelligenceMemoryStore.js';

const LEGACY_COMPLETED_MODULES: Record<string, ProjectIntelligenceModuleId[]> = {
  ndxbook: ['BRAND_LORE', 'BRAND_PERSONALITY', 'FOUNDER_CREATIVE_APPETITE', 'PRIMARY_EXPRESSION_CONTEXT'],
};

const DEFAULT_EXPERIENCE_CLASS_BY_SLUG: Record<string, ProjectExperienceClass> = {
  ndxbook: 'IMMERSIVE_SITE',
  'frontal-slayer': 'WORLD',
  'all-in-one-enterprises': 'SITE',
  'studio-world': 'SITE',
};

export function resolveExperienceClassForProject(params: {
  projectSlug: string;
  override?: ProjectExperienceClass | null;
}): ProjectExperienceClass {
  if (params.override) return params.override;
  return DEFAULT_EXPERIENCE_CLASS_BY_SLUG[params.projectSlug] ?? 'SITE';
}

export function getCommercialStateForProject(params: {
  projectSlug: string;
  paymentState?: string | null;
  provisioningState?: string | null;
}): ProjectCommercialState {
  if (params.paymentState === 'CONFIRMED') {
    return params.provisioningState === 'IN_PROGRESS' || params.provisioningState === 'COMPLETE'
      ? 'ACTIVATED'
      : 'PAID';
  }
  if (params.projectSlug === 'ndxbook' || params.projectSlug === 'frontal-slayer') {
    return 'ACTIVATED';
  }
  return 'DISCOVERY';
}

export async function compileProjectIntelligenceManifest(params: {
  projectId: string;
  projectSlug: string;
  experienceClass: ProjectExperienceClass;
  commercialState?: ProjectCommercialState;
  purchasedScope?: string[];
  scopeChangeReason?: string | null;
}): Promise<{
  manifest: ProjectIntelligenceIntakeManifest;
  readiness: ReturnType<typeof evaluateProjectIntelligenceReadiness>;
}> {
  const commercialState = params.commercialState ?? getCommercialStateForProject({ projectSlug: params.projectSlug });
  const previous = store.getLatestManifest(params.projectSlug);
  const completedModuleIds = LEGACY_COMPLETED_MODULES[params.projectSlug] ?? [];

  const manifest = compileProjectIntelligenceIntakeManifest({
    projectId: params.projectId,
    projectSlug: params.projectSlug,
    commercialState,
    experienceClass: params.experienceClass,
    purchasedScope: params.purchasedScope ?? [`experience-class:${params.experienceClass}`],
    includeIdentity: true,
    completedModuleIds,
    previousManifest: previous,
    scopeChangeReason: params.scopeChangeReason ?? null,
  });

  store.saveManifest(manifest);
  const readiness = evaluateProjectIntelligenceReadiness({ manifest, commercialState });
  return { manifest, readiness };
}

export function expandProjectScopeManifest(params: {
  projectSlug: string;
  newExperienceClass: ProjectExperienceClass;
  reason: string;
}): ProjectIntelligenceIntakeManifest {
  const previous = store.getLatestManifest(params.projectSlug);
  if (!previous) {
    throw new Error('No existing manifest to expand');
  }
  const completed = previous.modules
    .filter((m) => m.lifecycle === 'COMPLETE' || m.lifecycle === 'READY')
    .map((m) => m.moduleId);
  const expanded = expandScopeManifest({
    previous,
    newExperienceClass: params.newExperienceClass,
    reason: params.reason,
    completedModuleIds: completed,
  });
  store.saveManifest(expanded);
  return expanded;
}

export function getProjectIntelligenceState(projectSlug: string): {
  manifest: ProjectIntelligenceIntakeManifest | null;
  readiness: ReturnType<typeof evaluateProjectIntelligenceReadiness> | null;
  formationGate: ReturnType<typeof assertProjectReadyForFormation> | null;
} {
  const manifest = store.getLatestManifest(projectSlug);
  if (!manifest) return { manifest: null, readiness: null, formationGate: null };
  const readiness = evaluateProjectIntelligenceReadiness({
    manifest,
    commercialState: manifest.commercialState,
  });
  const formationGate = assertProjectReadyForFormation({
    readiness,
    commercialState: manifest.commercialState,
  });
  return { manifest, readiness, formationGate };
}

export function resetProjectIntelligenceServiceMemory(): void {
  store.resetProjectIntelligenceMemory();
}

export function legacyProjectIntelligenceSatisfiesModules(projectSlug: string): boolean {
  return (LEGACY_COMPLETED_MODULES[projectSlug]?.length ?? 0) > 0;
}
