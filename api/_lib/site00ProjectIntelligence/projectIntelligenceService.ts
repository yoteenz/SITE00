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
import * as store from './storeAdapter.js';
import {
  getBrandCharacterReadinessState,
} from '../site00Evolve/creativeDirection/brandCharacterExperiment/brandCharacterReadinessService.js';

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
  brandCharacterReadiness: Awaited<ReturnType<typeof getBrandCharacterReadinessState>> | null;
}> {
  const commercialState = params.commercialState ?? getCommercialStateForProject({ projectSlug: params.projectSlug });
  const previous = await store.getLatestManifest(params.projectSlug);
  const completedModuleIds = LEGACY_COMPLETED_MODULES[params.projectSlug] ?? [];

  let brandCharacterReadiness = null;
  if (params.projectSlug === 'ndxbook') {
    try {
      brandCharacterReadiness = await getBrandCharacterReadinessState('ndxbook');
    } catch {
      brandCharacterReadiness = null;
    }
  }

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
    characterReadinessState: brandCharacterReadiness?.latestEvaluation?.overallState ?? null,
    characterDeepeningQuestionCount: brandCharacterReadiness?.deepeningModule?.questions.length ?? 0,
  });

  await store.saveManifest(manifest);
  const readiness = evaluateProjectIntelligenceReadiness({ manifest, commercialState });
  return { manifest, readiness, brandCharacterReadiness };
}

export async function expandProjectScopeManifest(params: {
  projectSlug: string;
  newExperienceClass: ProjectExperienceClass;
  reason: string;
}): Promise<ProjectIntelligenceIntakeManifest> {
  const previous = await store.getLatestManifest(params.projectSlug);
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
  await store.saveManifest(expanded);
  return expanded;
}

export async function getProjectIntelligenceState(projectSlug: string): Promise<{
  manifest: ProjectIntelligenceIntakeManifest | null;
  readiness: ReturnType<typeof evaluateProjectIntelligenceReadiness> | null;
  formationGate: ReturnType<typeof assertProjectReadyForFormation> | null;
  brandCharacterReadiness: Awaited<ReturnType<typeof getBrandCharacterReadinessState>> | null;
  brandCharacterSummary: {
    state: string;
    questionCount: number;
    label: string;
  } | null;
}> {
  const manifest = await store.getLatestManifest(projectSlug);
  if (!manifest) {
    return {
      manifest: null,
      readiness: null,
      formationGate: null,
      brandCharacterReadiness: null,
      brandCharacterSummary: null,
    };
  }
  const readiness = evaluateProjectIntelligenceReadiness({
    manifest,
    commercialState: manifest.commercialState,
  });
  const formationGate = assertProjectReadyForFormation({
    readiness,
    commercialState: manifest.commercialState,
  });

  let brandCharacterReadiness = null;
  if (projectSlug === 'ndxbook') {
    try {
      brandCharacterReadiness = await getBrandCharacterReadinessState('ndxbook');
    } catch {
      brandCharacterReadiness = null;
    }
  }

  const evalState = brandCharacterReadiness?.latestEvaluation?.overallState ?? 'CHARACTER_NOT_EVALUATED';
  const questionCount = brandCharacterReadiness?.deepeningModule?.questions.length ?? 0;
  const brandCharacterSummary =
    projectSlug === 'ndxbook'
      ? {
          state: evalState,
          questionCount,
          label:
            evalState === 'CHARACTER_READY'
              ? 'READY'
              : evalState === 'CHARACTER_PARTIAL'
                ? `${questionCount} QUESTIONS REMAIN`
                : evalState === 'CHARACTER_INSUFFICIENT'
                  ? 'DEEPENING REQUIRED'
                  : evalState.replace(/_/g, ' '),
        }
      : null;

  return { manifest, readiness, formationGate, brandCharacterReadiness, brandCharacterSummary };
}

export function resetProjectIntelligenceServiceMemory(): void {
  store.resetProjectIntelligenceMemory();
  store.resetProjectIntelligenceStoreModeCache();
}

export function legacyProjectIntelligenceSatisfiesModules(projectSlug: string): boolean {
  return (LEGACY_COMPLETED_MODULES[projectSlug]?.length ?? 0) > 0;
}
