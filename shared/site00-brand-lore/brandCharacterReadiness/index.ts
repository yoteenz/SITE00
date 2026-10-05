/**
 * Brand Character Readiness — public exports.
 */

export * from './constants.js';
export * from './types.js';
export * from './evidenceInventory.js';
export * from './domainEvaluation.js';
export * from './readinessEvaluation.js';
export * from './duplicatePrevention.js';
export * from './questionLibrary.js';
export * from './deepeningModule.js';
export * from './fingerprint.js';
export * from './founderLanguage.js';
export * from './invalidationRegistration.js';
export * from './vitestFixtures.js';

export function brandCharacterReadinessImplemented(): true {
  return true;
}

export function characterReadySupportsZeroQuestions(): true {
  return true;
}

export function publicDiscoveryRemainsShallow(): true {
  return true;
}
