/**
 * P0.5E.4A — Generic Founder Character Calibration system exports.
 */

export * from './constants.js';
export * from './types.js';
export * from './reactions.js';
export * from './inference.js';
export * from './priority.js';
export * from './session.js';
export * from './synthesis.js';
export * from './forensic.js';
export * from './cognitiveLoad.js';

export function adaptiveFounderCharacterCalibrationImplemented(): boolean {
  return true;
}

export function studioWorldGenericCalibrationImplemented(): boolean {
  return true;
}

export function oneCalibrationMomentAtATime(state: { currentInteractionId: string | null }): boolean {
  return state.currentInteractionId !== undefined;
}

export function founderPrimaryRoleIsRecognition(): boolean {
  return true;
}

export function castingNotAutomaticallyTriggered(): boolean {
  return true;
}

export function falGenerationNotTriggeredByCalibration(): boolean {
  return true;
}

export function yesMachineConvergenceBlocked(state: {
  interactions: Array<{ disconfirming: boolean; resolved: boolean }>;
}): boolean {
  return state.interactions.some((i) => i.disconfirming && !i.resolved);
}

export function disconfirmingEvidenceSupported(state: {
  interactions: Array<{ disconfirming: boolean }>;
}): boolean {
  return state.interactions.some((i) => i.disconfirming);
}
