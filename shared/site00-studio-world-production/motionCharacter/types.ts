/**
 * Generic Studio World — Motion Character System types.
 */

import type {
  GENERIC_MOTION_FAILURE_MODES,
  GENERIC_MOTION_PLATFORM_SURFACES,
  PHYSICAL_BOOK_PRESENCE_DECISIONS,
} from './constants.js';

export type GenericMotionFailureMode = (typeof GENERIC_MOTION_FAILURE_MODES)[number];
export type GenericMotionPlatformSurface = (typeof GENERIC_MOTION_PLATFORM_SURFACES)[number];
export type PhysicalBookPresenceDecision = (typeof PHYSICAL_BOOK_PRESENCE_DECISIONS)[number];

export type GenericMotionBehaviorChain = {
  chainId: string;
  brandId: string;
  stages: string[];
  description: string;
};

export type MotionCharacterSystem = {
  systemId: string;
  version: string;
  brandId: string;
  coreQuestion: 'HOW DOES THIS BRAND NATURALLY BEHAVE IN MOTION?';
  behaviorChains: GenericMotionBehaviorChain[];
  failureModes: GenericMotionFailureMode[];
  motionMustEmergeFromCharacter: true;
  motionMustNotDeriveFromVisualIdentityAlone: true;
};

export type HumanMotionTrace = {
  traceId: string;
  kind: string;
  causalMeaning: string;
  mustNotBeManufacturedMechanically: true;
};

export type HumanMotionTraceSystem = {
  systemId: string;
  traces: HumanMotionTrace[];
  fakeImperfectionBlocked: true;
};

export type PhysicalBookBehavior = {
  behaviorId: string;
  action: string;
  narrativeRole: string;
  mandatoryInEveryReel: false;
};

export type PhysicalBookPresenceEvaluation = {
  evaluationId: string;
  decision: PhysicalBookPresenceDecision;
  reason: string;
};

export type EmbodiedBrandCharacterFoundation = {
  foundationId: string;
  brandId: string;
  distinctFromFounder: true;
  distinctFromBrandCharacter: true;
  visualDesignFinalized: false;
  characterGenerationPerformed: false;
  copyrightedCharacterCloningBlocked: true;
};

export type EmbodiedCharacterDiscoveryReadiness = {
  readinessId: string;
  readyForDiscoverySprint: boolean;
  blockedItems: string[];
  nextDiscoveryItems: string[];
};
