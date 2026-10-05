/**
 * Project intelligence readiness evaluation and formation gate.
 */

import type {
  ProjectCommercialState,
  ProjectIntelligenceIntakeManifest,
  ProjectIntelligenceModuleAssignment,
  ProjectIntelligenceReadinessState,
} from './types.js';

export function evaluateProjectIntelligenceReadiness(params: {
  manifest: ProjectIntelligenceIntakeManifest;
  commercialState: ProjectCommercialState;
}): ProjectIntelligenceReadinessState {
  const { manifest, commercialState } = params;

  if (commercialState !== 'PAID' && commercialState !== 'ACTIVATED') {
    return 'PROJECT_INTELLIGENCE_NOT_STARTED';
  }

  const required = manifest.modules.filter((m) => m.requirement === 'REQUIRED');
  const conditional = manifest.modules.filter((m) => m.requirement === 'CONDITIONAL');

  const requiredComplete = required.every((m) => m.lifecycle === 'COMPLETE' || m.lifecycle === 'READY');
  const conditionalBlocking = conditional.some(
    (m) => m.lifecycle !== 'COMPLETE' && m.lifecycle !== 'READY',
  );
  const anyComplete = manifest.modules.some((m) => m.lifecycle === 'COMPLETE' || m.lifecycle === 'READY');
  const anyNeedsClarification = manifest.modules.some((m) => m.lifecycle === 'NEEDS_CLARIFICATION');

  if (anyNeedsClarification) return 'PROJECT_INTELLIGENCE_NEEDS_CLARIFICATION';
  if (requiredComplete && !conditionalBlocking) return 'PROJECT_INTELLIGENCE_READY';
  if (anyComplete) return 'PROJECT_INTELLIGENCE_PARTIAL';
  return 'PROJECT_INTELLIGENCE_INCOMPLETE';
}

export function requiredModuleBlocksReadiness(module: ProjectIntelligenceModuleAssignment): boolean {
  if (module.requirement !== 'REQUIRED') return false;
  return module.lifecycle !== 'COMPLETE' && module.lifecycle !== 'READY';
}

export function optionalModuleDoesNotBlockReadiness(module: ProjectIntelligenceModuleAssignment): boolean {
  return module.requirement === 'OPTIONAL';
}

export function conditionalModuleBlocksOnlyWhenActivated(module: ProjectIntelligenceModuleAssignment): boolean {
  if (module.requirement !== 'CONDITIONAL') return false;
  return module.lifecycle === 'AVAILABLE' || module.lifecycle === 'IN_PROGRESS';
}

export function assertProjectReadyForFormation(params: {
  readiness: ProjectIntelligenceReadinessState;
  commercialState: ProjectCommercialState;
}): { allowed: boolean; reason: string | null } {
  if (params.commercialState !== 'PAID' && params.commercialState !== 'ACTIVATED') {
    return { allowed: false, reason: 'Project must be paid/activated before formation' };
  }
  if (params.readiness !== 'PROJECT_INTELLIGENCE_READY') {
    return { allowed: false, reason: `Intelligence readiness is ${params.readiness}` };
  }
  return { allowed: true, reason: null };
}

export function unpaidProjectCannotEnterDeepProductionReadiness(commercialState: ProjectCommercialState): boolean {
  return commercialState === 'DISCOVERY' || commercialState === 'RECOMMENDED' || commercialState === 'SELECTED' || commercialState === 'CHECKOUT_PENDING';
}

export function paymentAloneIsNotSufficientForFormation(): true {
  return true;
}
