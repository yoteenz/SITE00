/**
 * Builder discovery — scope and ProjectExperienceClass diagnosis.
 */

import type { ProjectExperienceClass } from '../site00-world-intake/constants.js';
import type { CreativeDepthPreference, ProjectScopeDiagnosis } from './types.js';

function normalizeAnswer(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v.map(String) : [String(v)];
}

export function diagnoseBuilderExperienceClass(params: {
  classSlug: string;
  answers: Record<string, string | string[]>;
}): ProjectExperienceClass {
  const { classSlug, answers } = params;

  if (classSlug === 'world') return 'WORLD';
  if (classSlug === 'enterprise') return 'APPLICATION';
  if (classSlug === 'site') return 'SITE';

  if (classSlug === 'not-sure') {
    const q2 = normalizeAnswer(answers['q2']).join(' ').toLowerCase();
    const q3 = normalizeAnswer(answers['q3']).join(' ').toLowerCase();
    const q4 = normalizeAnswer(answers['q4']).join(' ').toLowerCase();
    const combined = `${q2} ${q3} ${q4}`;
    if (combined.includes('world') || combined.includes('immersive') || combined.includes('game')) {
      if (combined.includes('world') && (combined.includes('persistent') || combined.includes('avatar'))) {
        return 'WORLD';
      }
      return 'IMMERSIVE_SITE';
    }
    if (combined.includes('application') || combined.includes('workflow') || combined.includes('portal')) {
      return 'APPLICATION';
    }
    if (combined.includes('unsure') || combined.includes('not sure') || combined.includes('complex')) {
      return 'UNRESOLVED';
    }
    return 'SITE';
  }

  const typeAnswers = normalizeAnswer(answers['type']).join(' ').toLowerCase();
  const experienceAnswers = normalizeAnswer(answers['experience']).join(' ').toLowerCase();
  if (typeAnswers.includes('web-app') || typeAnswers.includes('application')) return 'APPLICATION';
  if (experienceAnswers.includes('immersive') || experienceAnswers.includes('spatial')) return 'IMMERSIVE_SITE';
  return 'SITE';
}

export function inferCreativeDepthFromDiscovery(params: {
  answers: Record<string, string | string[]>;
}): CreativeDepthPreference | null {
  const custom = normalizeAnswer(params.answers['custom-feel'] ?? params.answers['creative-depth']).join(' ').toLowerCase();
  if (!custom) return null;
  if (custom.includes('experimental') || custom.includes('unconventional')) return 'UNCONVENTIONAL_EXPERIMENTAL';
  if (custom.includes('art') || custom.includes('highly')) return 'HIGHLY_ART_DIRECTED';
  if (custom.includes('distinct')) return 'DISTINCTIVE';
  if (custom.includes('straightforward') || custom.includes('simple')) return 'STRAIGHTFORWARD';
  return 'DISTINCTIVE';
}

export function creativeDepthIsNotFounderCreativeAppetite(): true {
  return true;
}

export function compileBuilderScopeDiagnosis(params: {
  classSlug: string;
  answers: Record<string, string | string[]>;
}): ProjectScopeDiagnosis {
  const experienceClass = diagnoseBuilderExperienceClass(params);
  const creativeDepth = inferCreativeDepthFromDiscovery(params);
  const unresolvedReasons: string[] = [];
  let confidence: ProjectScopeDiagnosis['confidence'] = 'HIGH';

  if (experienceClass === 'UNRESOLVED') {
    confidence = 'LOW';
    unresolvedReasons.push('Scope requires deeper scoping conversation');
  }
  if (params.classSlug === 'not-sure' && experienceClass === 'SITE') {
    confidence = 'MEDIUM';
  }

  return {
    experienceClass,
    identityNeed: 'IDENTITY_REFINEMENT_RECOMMENDED',
    creativeDepth,
    confidence,
    unresolvedReasons,
    diagnosedAt: new Date().toISOString(),
  };
}
