/**
 * FailureLoopIntelligence — classify failures, retry guard, no blind regeneration.
 */

import { resolveEvolveOperationsPolicy } from './policyRegistry.js';
import type {
  EvolveDeliveryMode,
  EvolveExplainReason,
  EvolveFailureBudget,
  EvolveFailureClass,
  EvolveFailureClassification,
  EvolveRetryGuardResult,
  EvolveServicePackageId,
  EvolveSpendSnapshot,
} from './types.js';
import { computeFailureBudget } from './spendIntelligence.js';

const TRANSIENT_CLASSES: EvolveFailureClass[] = ['TECHNICAL_TRANSIENT', 'PROVIDER_TIMEOUT'];
const INPUT_CORRECTION_CLASSES: EvolveFailureClass[] = [
  'BAD_CROP',
  'REFERENCE_MISMATCH',
  'ASSET_MISMATCH',
  'MISSING_INPUT',
  'MALFORMED_REQUEST',
];
const CREATIVE_QUALITY_CLASSES: EvolveFailureClass[] = [
  'VISUAL_FIDELITY_FAILURE',
  'WRONG_BRAND_CONTEXT',
  'CREATIVE_SIMILARITY_FAILURE',
  'PROVIDER_REJECTION',
];
const NO_RETRY_CLASSES: EvolveFailureClass[] = [
  'INSUFFICIENT_CREDITS',
  'USER_ABANDONED_APPROVAL',
  'AUTH_FAILURE',
];

export function classifyFailure(
  rawError: string,
  context?: { providerId?: string; jobType?: string; priorFailureClass?: EvolveFailureClass },
): EvolveFailureClassification {
  const normalized = rawError.toUpperCase();
  let failureClass: EvolveFailureClass = 'UNKNOWN_FAILURE';
  const reasons: EvolveExplainReason[] = [];

  if (normalized.includes('TIMEOUT') || normalized.includes('ETIMEDOUT')) {
    failureClass = 'PROVIDER_TIMEOUT';
    reasons.push({ code: 'PROVIDER_TIMEOUT', label: 'PROVIDER DID NOT RESPOND IN TIME' });
  } else if (normalized.includes('CROP') || normalized.includes('BAD_CROP')) {
    failureClass = 'BAD_CROP';
    reasons.push({ code: 'BAD_CROP', label: 'CROP AUTHORITY MISMATCH' });
  } else if (normalized.includes('REFERENCE')) {
    failureClass = 'REFERENCE_MISMATCH';
    reasons.push({ code: 'REFERENCE_MISMATCH', label: 'REFERENCE DOES NOT MATCH APPROVED AUTHORITY' });
  } else if (normalized.includes('INSUFFICIENT') && normalized.includes('CREDIT')) {
    failureClass = 'INSUFFICIENT_CREDITS';
    reasons.push({ code: 'INSUFFICIENT_CREDITS', label: 'NOT ENOUGH CREDITS TO CONTINUE' });
  } else if (normalized.includes('FIDELITY') || normalized.includes('VISUAL')) {
    failureClass = 'VISUAL_FIDELITY_FAILURE';
    reasons.push({ code: 'VISUAL_FIDELITY', label: 'OUTPUT FAILED VISUAL FIDELITY CHECK' });
  } else if (normalized.includes('BRAND')) {
    failureClass = 'WRONG_BRAND_CONTEXT';
    reasons.push({ code: 'BRAND_CONTEXT', label: 'BRAND CONTEXT MISMATCH' });
  } else if (normalized.includes('SIMILARITY')) {
    failureClass = 'CREATIVE_SIMILARITY_FAILURE';
    reasons.push({ code: 'SIMILARITY', label: 'CREATIVE TOO SIMILAR TO PRIOR OUTPUT' });
  } else if (normalized.includes('STORAGE')) {
    failureClass = 'STORAGE_FAILURE';
    reasons.push({ code: 'STORAGE', label: 'STORAGE WRITE FAILED' });
  } else if (normalized.includes('AUTH') || normalized.includes('401') || normalized.includes('403')) {
    failureClass = 'AUTH_FAILURE';
    reasons.push({ code: 'AUTH', label: 'AUTHENTICATION / AUTHORIZATION FAILURE' });
  } else if (normalized.includes('TRANSIENT') || normalized.includes('503') || normalized.includes('502')) {
    failureClass = 'TECHNICAL_TRANSIENT';
    reasons.push({ code: 'TRANSIENT', label: 'TRANSIENT INFRASTRUCTURE FAILURE' });
  } else if (normalized.includes('REJECT')) {
    failureClass = 'PROVIDER_REJECTION';
    reasons.push({ code: 'PROVIDER_REJECTION', label: 'PROVIDER REJECTED REQUEST' });
  } else if (normalized.includes('MISSING') || normalized.includes('INPUT')) {
    failureClass = 'MISSING_INPUT';
    reasons.push({ code: 'MISSING_INPUT', label: 'REQUIRED INPUT MISSING' });
  } else {
    reasons.push({ code: 'UNKNOWN', label: 'UNCLASSIFIED FAILURE — NO BLIND RETRY' });
  }

  if (context?.priorFailureClass === failureClass) {
    reasons.push({ code: 'REPEATED', label: 'SAME FAILURE CLASS REPEATED' });
  }

  const autoRetryAllowed = TRANSIENT_CLASSES.includes(failureClass);
  const retryAllowed = autoRetryAllowed && !NO_RETRY_CLASSES.includes(failureClass);
  const paidRegenerationAllowed = false;
  const returnToStep = INPUT_CORRECTION_CLASSES.includes(failureClass)
    ? failureClass === 'BAD_CROP'
      ? 'CROP_APPROVAL'
      : 'INPUT_CORRECTION'
    : null;
  const escalate =
    failureClass === 'UNKNOWN_FAILURE' ||
    CREATIVE_QUALITY_CLASSES.includes(failureClass) ||
    Boolean(context?.priorFailureClass === failureClass);

  return {
    failureClass,
    confidence: failureClass === 'UNKNOWN_FAILURE' ? 'LOW' : 'HIGH',
    reasons,
    retryAllowed,
    autoRetryAllowed,
    paidRegenerationAllowed,
    returnToStep,
    escalate,
  };
}

export function applyRetryGuard(
  classification: EvolveFailureClassification,
  automatedRetryCount: number,
  servicePackage: EvolveServicePackageId,
  deliveryMode: EvolveDeliveryMode,
  providerIncidentActive = false,
): EvolveRetryGuardResult {
  const policy = resolveEvolveOperationsPolicy(servicePackage, deliveryMode);
  const reasons = [...classification.reasons];
  const maxAutomatedRetries = policy.maxAutomatedRetries;

  if (providerIncidentActive) {
    reasons.push({ code: 'PROVIDER_INCIDENT', label: 'UNSAFE RETRIES PAUSED — PROVIDER INCIDENT ACTIVE' });
    return {
      allowed: false,
      action: 'FREEZE_JOB',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (classification.failureClass === 'INSUFFICIENT_CREDITS') {
    return {
      allowed: false,
      action: 'OFFER_TOP_UP',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (INPUT_CORRECTION_CLASSES.includes(classification.failureClass)) {
    reasons.push({ code: 'NO_GENERATION_RETRY', label: 'RETURN TO INPUT / CROP CORRECTION — NO PAID REGENERATION' });
    return {
      allowed: false,
      action: 'RETURN_TO_INPUT',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (CREATIVE_QUALITY_CLASSES.includes(classification.failureClass)) {
    reasons.push({ code: 'REVISION_RECOMMENDED', label: 'CREATIVE QUALITY FAILURE — REVISION RECOMMENDED, NO AUTO-REGENERATE' });
    return {
      allowed: false,
      action: 'ESCALATE',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (classification.failureClass === 'UNKNOWN_FAILURE') {
    reasons.push({ code: 'NO_BLIND_RETRY', label: 'UNKNOWN FAILURE — ESCALATE FOR DIAGNOSIS' });
    return {
      allowed: false,
      action: 'ESCALATE',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (automatedRetryCount >= maxAutomatedRetries) {
    reasons.push({ code: 'MAX_RETRIES', label: `MAX AUTOMATED RETRIES (${maxAutomatedRetries}) REACHED` });
    return {
      allowed: false,
      action: classification.escalate ? 'ESCALATE' : 'FREEZE_JOB',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (TRANSIENT_CLASSES.includes(classification.failureClass) && classification.autoRetryAllowed) {
    reasons.push({ code: 'SAFE_AUTO_RETRY', label: 'ONE SAFE AUTO-RETRY PERMITTED' });
    return {
      allowed: true,
      action: 'AUTO_RETRY',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  if (NO_RETRY_CLASSES.includes(classification.failureClass)) {
    return {
      allowed: false,
      action: 'BLOCK',
      reasons,
      automatedRetryCount,
      maxAutomatedRetries,
    };
  }

  return {
    allowed: false,
    action: 'ESCALATE',
    reasons,
    automatedRetryCount,
    maxAutomatedRetries,
  };
}

export function deriveFailureBudget(
  spend: EvolveSpendSnapshot,
  priorFailureRatePercent?: number,
  currentFailureRatePercent?: number,
): EvolveFailureBudget {
  const base = computeFailureBudget(spend);
  const anomalyReasons: EvolveExplainReason[] = [];
  let anomalyDetected = false;

  if (
    priorFailureRatePercent != null &&
    currentFailureRatePercent != null &&
    currentFailureRatePercent - priorFailureRatePercent >= 5
  ) {
    anomalyDetected = true;
    anomalyReasons.push({
      code: 'FAILURE_RATE_SPIKE',
      label: `FAILURE RATE ${priorFailureRatePercent}% → ${currentFailureRatePercent}% THIS PERIOD`,
    });
  }

  return {
    ...base,
    anomalyDetected,
    anomalyReasons,
  };
}

export function assertNoPaidAutoRegeneration(
  classification: EvolveFailureClassification,
  explicitApproval: boolean,
): boolean {
  if (explicitApproval) return true;
  return !classification.paidRegenerationAllowed;
}
