/**
 * Discovery recommendation compiler — commercial path, not production canon.
 */

import type {
  IdentityNeedClassification,
  ProjectRecommendation,
  ProjectScopeDiagnosis,
  RecommendationStatus,
} from './types.js';
import type { ProjectExperienceClass } from '../site00-world-intake/constants.js';

function discoveryRecommendationFingerprint(payload: unknown): string {
  const raw = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0').slice(0, 16);
}

function identityLabel(need: IdentityNeedClassification): string {
  switch (need) {
    case 'IDENTITY_NOT_REQUIRED':
      return 'EXISTING IDENTITY';
    case 'IDENTITY_REFINEMENT_RECOMMENDED':
      return 'IDENTITY REFINEMENT';
    case 'IDENTITY_FOUNDATION_RECOMMENDED':
      return 'IDENTITY FOUNDATION';
    case 'IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED':
      return 'IDENTITY DEVELOPMENT';
  }
}

function experienceLabel(cls: ProjectExperienceClass): string {
  switch (cls) {
    case 'SITE':
      return 'CUSTOM SITE';
    case 'APPLICATION':
      return 'APPLICATION';
    case 'IMMERSIVE_SITE':
      return 'IMMERSIVE SITE';
    case 'WORLD':
      return 'POTENTIAL WORLD-CLASS PROJECT';
    case 'UNRESOLVED':
      return 'DEEPER SCOPING REQUIRED';
  }
}

export function compileProjectRecommendation(params: {
  identityNeed: IdentityNeedClassification;
  scopeDiagnosis: ProjectScopeDiagnosis;
}): ProjectRecommendation {
  const { identityNeed, scopeDiagnosis } = params;
  let status: RecommendationStatus = 'RECOMMENDATION_READY';

  if (scopeDiagnosis.experienceClass === 'UNRESOLVED') {
    status = 'UNRESOLVED';
  } else if (scopeDiagnosis.confidence === 'LOW') {
    status = 'NEEDS_CLARIFICATION';
  } else if (scopeDiagnosis.experienceClass === 'WORLD') {
    status = 'CUSTOM_SCOPE_REQUIRED';
  }

  const additions: string[] = [];
  if (scopeDiagnosis.creativeDepth === 'HIGHLY_ART_DIRECTED' || scopeDiagnosis.creativeDepth === 'UNCONVENTIONAL_EXPERIMENTAL') {
    additions.push('Elevated creative direction scope');
  }
  if (identityNeed === 'IDENTITY_FOUNDATION_RECOMMENDED' || identityNeed === 'IDENTITY_DEEP_DEVELOPMENT_RECOMMENDED') {
    additions.push('Identity work before or alongside build');
  }

  const headline = `BASED ON WHAT YOU TOLD US, WE'D START WITH ${identityLabel(identityNeed)} + ${experienceLabel(scopeDiagnosis.experienceClass)}`;

  const rationale = [
    `Identity signal: ${identityNeed.replace(/_/g, ' ')}`,
    `Build class: ${scopeDiagnosis.experienceClass.replace(/_/g, ' ')}`,
    scopeDiagnosis.creativeDepth ? `Creative depth preference: ${scopeDiagnosis.creativeDepth.replace(/_/g, ' ')}` : 'Creative depth: not specified',
  ];

  const fingerprint = discoveryRecommendationFingerprint({ identityNeed, experienceClass: scopeDiagnosis.experienceClass, status });

  return {
    status,
    headline,
    identityNeed,
    experienceClass: scopeDiagnosis.experienceClass,
    additions,
    rationale,
    fingerprint,
    compiledAt: new Date().toISOString(),
  };
}

export function projectRecommendationIsNotProjectIntelligenceSnapshot(): true {
  return true;
}

export function discoveryScopeDiagnosisIsNotBrandIntelligence(): true {
  return true;
}
