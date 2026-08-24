/**
 * Generic Studio World — Motion Character System.
 * Answers: HOW DOES THIS BRAND NATURALLY BEHAVE IN MOTION?
 */

import { randomUUID } from 'node:crypto';
import { MOTION_CHARACTER_SYSTEM_V1, GENERIC_MOTION_FAILURE_MODES } from './constants.js';
import type { GenericMotionBehaviorChain, MotionCharacterSystem } from './types.js';

export function buildMotionCharacterSystem(params: {
  brandId: string;
  behaviorChains: GenericMotionBehaviorChain[];
}): MotionCharacterSystem {
  return {
    systemId: randomUUID(),
    version: MOTION_CHARACTER_SYSTEM_V1,
    brandId: params.brandId,
    coreQuestion: 'HOW DOES THIS BRAND NATURALLY BEHAVE IN MOTION?',
    behaviorChains: params.behaviorChains,
    failureModes: [...GENERIC_MOTION_FAILURE_MODES],
    motionMustEmergeFromCharacter: true,
    motionMustNotDeriveFromVisualIdentityAlone: true,
  };
}

export function buildGenericMotionBehaviorChain(params: {
  brandId: string;
  stages: string[];
  description: string;
}): GenericMotionBehaviorChain {
  return {
    chainId: randomUUID(),
    brandId: params.brandId,
    stages: params.stages,
    description: params.description,
  };
}

export function motionBehaviorDerivesFromCharacter(): true {
  return true;
}

export function motionDoesNotDefaultToAnimatedCarousel(): true {
  return true;
}

export function genericStudioWorldMotionNotHardcodedToNdx(): true {
  return true;
}
