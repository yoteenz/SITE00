/**
 * EVOLVE scope assessment generator — structured scope object from intake selections.
 */

import type { EvolvePathId } from './evolve';
import type { EvolveStepAnswers } from '../hooks/useEvolveAssessment';

export type EvolveScopeAssessment = {
  property: Record<string, unknown>;
  currentStack: Record<string, unknown>;
  clientGoals: string[];
  painPoints: string[];
  mustPreserve: string[];
  requestedSystems: string[];
  knownIntegrations: string[];
  accessRequirements: string[];
  compatibilityQuestions: string[];
  riskFlags: string[];
  recommendedEvolvePath: EvolvePathId;
  recommendedAssessment: string;
  proposedDeliverables: string[];
  dependencies: string[];
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'REQUIRES_ASSESSMENT';
  assessmentStatus: 'PENDING_ASSESSMENT';
};

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function computeEvolveScopeAssessment(
  pathId: EvolvePathId,
  answersByStep: Record<string, EvolveStepAnswers>,
): EvolveScopeAssessment {
  const propertyAnswers = answersByStep.property ?? {};
  const diagnoseAnswers = answersByStep.diagnose ?? {};
  const systemsAnswers = answersByStep.systems ?? {};
  const accessAnswers = answersByStep.access ?? {};

  const clientGoals = asStringArray(diagnoseAnswers.goals);
  const painPoints = asStringArray(diagnoseAnswers.notWorking);
  const mustPreserve = asStringArray(diagnoseAnswers.mustNotChange);
  const requestedSystems = asStringArray(systemsAnswers.selected);

  const hasTransformSignals = clientGoals.some((g) =>
    ['infrastructure', 'security', 'integrations'].includes(g.toLowerCase()),
  );
  const hasInstallSignals = requestedSystems.length >= 2;
  let recommendedPath: EvolvePathId = pathId;
  if (pathId === 'refine' && hasTransformSignals) recommendedPath = 'transform';
  else if (pathId === 'refine' && hasInstallSignals) recommendedPath = 'install';

  const riskFlags: string[] = [];
  if (!asText(propertyAnswers.propertyUrl)) riskFlags.push('PROPERTY URL NOT PROVIDED');
  if (requestedSystems.some((id) => id.includes('api'))) riskFlags.push('INTEGRATION COMPATIBILITY REQUIRES REVIEW');

  const complexity =
    requestedSystems.length >= 4 || recommendedPath === 'transform'
      ? 'REQUIRES_ASSESSMENT'
      : requestedSystems.length >= 2
        ? 'HIGH'
        : requestedSystems.length === 1
          ? 'MEDIUM'
          : 'LOW';

  return {
    property: {
      name: asText(propertyAnswers.propertyName),
      url: asText(propertyAnswers.propertyUrl),
      type: asText(propertyAnswers.propertyType),
      brand: asText(propertyAnswers.brand),
    },
    currentStack: {
      platform: asText(propertyAnswers.platform) || 'UNKNOWN',
      hosting: asText(propertyAnswers.hosting) || 'UNKNOWN',
      cms: asText(propertyAnswers.cms) || 'UNKNOWN',
      repository: asText(propertyAnswers.repository) || 'UNKNOWN',
    },
    clientGoals,
    painPoints,
    mustPreserve,
    requestedSystems,
    knownIntegrations: asStringArray(propertyAnswers.integrations),
    accessRequirements: asStringArray(accessAnswers.providers),
    compatibilityQuestions:
      requestedSystems.length > 0
        ? ['TECHNICAL COMPATIBILITY PENDING SITE 00 ASSESSMENT']
        : ['NO SYSTEMS SELECTED — PATH MAY CHANGE AFTER REVIEW'],
    riskFlags,
    recommendedEvolvePath: recommendedPath,
    recommendedAssessment: 'SITE 00 PROPERTY ASSESSMENT REQUIRED BEFORE FIXED IMPLEMENTATION SCOPE',
    proposedDeliverables: [
      'PROPERTY ASSESSMENT REPORT',
      'COMPATIBILITY REVIEW',
      'EVOLVE PRODUCTION PLAN',
      'ACCESS CHECKLIST',
    ],
    dependencies: requestedSystems,
    estimatedComplexity: complexity,
    assessmentStatus: 'PENDING_ASSESSMENT',
  };
}
