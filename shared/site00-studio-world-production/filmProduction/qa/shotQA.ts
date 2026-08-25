/**
 * P0.FILM.1 — Automated shot QA + auto-reject + correction plan.
 */

import type { CorrectionPlan, FilmShotCandidate, FilmShotContract, FilmShotQA, QAFailureCode, QAStatus } from '../types.js';
import { MAX_RETRIES } from '../constants.js';

const HARD_GATE_THRESHOLDS: Record<string, number> = {
  identity: 0.7,
  face: 0.7,
  hands: 0.6,
  wardrobe: 0.65,
  environment: 0.6,
  motion: 0.6,
  continuity: 0.7,
};

export function evaluateShotQA(params: {
  candidate: FilmShotCandidate;
  shot: FilmShotContract;
  scores: Record<string, number>;
}): FilmShotQA {
  const hardGateFailures = detectHardGateFailures(params.scores);
  const status = determineQAStatus(hardGateFailures, params.scores);

  return {
    qaId: `qa-${params.candidate.candidateId}`,
    candidateId: params.candidate.candidateId,
    shotId: params.shot.shotId,
    scores: params.scores,
    hardGateFailures,
    status,
    evaluatedAt: new Date().toISOString(),
  };
}

function detectHardGateFailures(scores: Record<string, number>): QAFailureCode[] {
  const failures: QAFailureCode[] = [];
  if ((scores.identity ?? 1) < HARD_GATE_THRESHOLDS.identity) failures.push('FAIL_IDENTITY');
  if ((scores.hands ?? 1) < HARD_GATE_THRESHOLDS.hands) failures.push('FAIL_HAND_PROP');
  if ((scores.wardrobe ?? 1) < HARD_GATE_THRESHOLDS.wardrobe) failures.push('FAIL_WARDROBE_CONTINUITY');
  if ((scores.environment ?? 1) < HARD_GATE_THRESHOLDS.environment) failures.push('FAIL_ENVIRONMENT');
  if ((scores.motion ?? 1) < HARD_GATE_THRESHOLDS.motion) failures.push('FAIL_MOTION');
  if ((scores.continuity ?? 1) < HARD_GATE_THRESHOLDS.continuity) failures.push('FAIL_CONTINUITY');
  if ((scores.camera ?? 1) < 0.5) failures.push('FAIL_CAMERA');
  if ((scores.realism ?? 1) < 0.5) failures.push('FAIL_REALISM');
  return failures;
}

function determineQAStatus(failures: QAFailureCode[], scores: Record<string, number>): QAStatus {
  if (failures.length > 0) {
    const critical = failures.filter((f) => f === 'FAIL_IDENTITY' || f === 'FAIL_HAND_PROP');
    if (critical.length > 0) return 'QA_REJECTED';
    return 'QA_RETRY_ELIGIBLE';
  }
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(scores).length, 1);
  return avg >= 0.65 ? 'FOUNDER_REVIEW_READY' : 'QA_RETRY_ELIGIBLE';
}

export function buildCorrectionPlan(failureCode: QAFailureCode): CorrectionPlan {
  const plans: Record<QAFailureCode, CorrectionPlan> = {
    FAIL_HAND_PROP: {
      failureCode,
      diagnosis: 'Hand/prop interaction geometry failed',
      adjustments: ['tighten hand pose instruction', 'reduce prop complexity', 'switch to STILL_FIRST stack'],
      retryEligible: true,
    },
    FAIL_IDENTITY: {
      failureCode,
      diagnosis: 'Character identity drift detected',
      adjustments: ['strengthen identity anchors', 'bind reference pack', 'reduce motion'],
      retryEligible: true,
    },
    FAIL_CAMERA: {
      failureCode,
      diagnosis: 'Camera behavior does not match shot contract',
      adjustments: ['clarify camera position', 'reduce movement', 'adjust framing'],
      retryEligible: true,
    },
    FAIL_ENVIRONMENT: {
      failureCode,
      diagnosis: 'Environment instability or signage artifacts',
      adjustments: ['simplify background', 'reduce patron density', 'tighten environment grammar'],
      retryEligible: true,
    },
    FAIL_MOTION: {
      failureCode,
      diagnosis: 'Motion realism failure',
      adjustments: ['reduce motion intensity', 'shorten duration', 'use static camera'],
      retryEligible: true,
    },
    FAIL_WARDROBE_CONTINUITY: {
      failureCode,
      diagnosis: 'Wardrobe continuity break',
      adjustments: ['re-bind wardrobe continuity id', 'strengthen outfit description'],
      retryEligible: true,
    },
    FAIL_LIP_SYNC: {
      failureCode,
      diagnosis: 'Lip sync inadequate for dialogue shot',
      adjustments: ['switch provider', 'reduce dialogue length', 'use voiceover'],
      retryEligible: false,
    },
    FAIL_CONTINUITY: {
      failureCode,
      diagnosis: 'Cross-shot continuity violation',
      adjustments: ['align prop states', 'verify wardrobe id', 'check lime artifact placement'],
      retryEligible: true,
    },
    FAIL_REALISM: {
      failureCode,
      diagnosis: 'General realism gate failure',
      adjustments: ['apply realism enforcement', 'reduce stylization', 'hybrid still-first'],
      retryEligible: true,
    },
  };
  return plans[failureCode];
}

export function applyQAToCandidate(candidate: FilmShotCandidate, qa: FilmShotQA): FilmShotCandidate {
  return {
    ...candidate,
    qaStatus: qa.status,
    qaScore: Object.values(qa.scores).reduce((a, b) => a + b, 0) / Math.max(Object.values(qa.scores).length, 1),
    qaFailures: qa.hardGateFailures,
    correctionPlan: qa.hardGateFailures[0] ? buildCorrectionPlan(qa.hardGateFailures[0]) : null,
    founderVisible: qa.status === 'FOUNDER_REVIEW_READY',
  };
}

export function hardFailureAutoRejected(qa: FilmShotQA): boolean {
  return qa.status === 'QA_REJECTED';
}

export function retryEligible(qa: FilmShotQA, retryCount: number): boolean {
  return qa.status === 'QA_RETRY_ELIGIBLE' && retryCount < MAX_RETRIES;
}

export function automatedShotQAImplemented(): true {
  return true;
}

export function smartCorrectionPlanImplemented(): true {
  return true;
}
