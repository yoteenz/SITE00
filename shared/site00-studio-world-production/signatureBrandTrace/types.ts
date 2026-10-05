/**
 * Generic SignatureBrandTraceRequirement — configurable per client.
 */

import type {
  SIGNATURE_TRACE_COLOR_OWNERSHIP,
  SIGNATURE_TRACE_DOMINANCE_RESULTS,
  SIGNATURE_TRACE_FAILURE_STATES,
  SIGNATURE_TRACE_PRESENCE_RESULTS,
  SIGNATURE_TRACE_REVISION_CLASSES,
} from './constants.js';

export type SignatureTracePresenceResult = (typeof SIGNATURE_TRACE_PRESENCE_RESULTS)[number];
export type SignatureTraceDominanceResult = (typeof SIGNATURE_TRACE_DOMINANCE_RESULTS)[number];
export type SignatureTraceColorOwnership = (typeof SIGNATURE_TRACE_COLOR_OWNERSHIP)[number];
export type SignatureTraceRevisionClass = (typeof SIGNATURE_TRACE_REVISION_CLASSES)[number];
export type SignatureTraceFailureState = (typeof SIGNATURE_TRACE_FAILURE_STATES)[number];

export type SignatureBrandTraceRequirement = {
  required: boolean;
  brandToken: string;
  brandTokenHex: string | null;
  minimumPresence: 'PERCEPTIBLE' | 'VISIBLE' | 'DOMINANT';
  dominancePolicy: 'RESTRAINED_BY_DEFAULT' | 'MODERATE_ALLOWED' | 'DOMINANT_ALLOWED';
  semanticPlacementRequired: boolean;
  allowedBehaviors: string[];
  prohibitedBehaviors: string[];
};

export type PerceptibleSignatureEvaluation = {
  evaluationId: string;
  artifactId: string;
  perceptibleAtFeedDistance: boolean;
  withinReadingPath: boolean;
  passes: boolean;
  evaluatedAt: string;
};

export type SignatureTracePresenceEvaluation = {
  evaluationId: string;
  artifactId: string;
  signaturePresent: boolean;
  minimumElementsMet: boolean;
  result: SignatureTracePresenceResult;
  evaluatedAt: string;
};

export type SignatureTraceDominanceEvaluation = {
  evaluationId: string;
  artifactId: string;
  result: SignatureTraceDominanceResult;
  dominantBackground: boolean;
  evaluatedAt: string;
};
